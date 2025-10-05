# main.py
import os
import sys
import argparse
import mimetypes
import base64
from pathlib import Path
from typing import Optional, Tuple
from bs4 import BeautifulSoup

from deepgram import DeepgramClient, PrerecordedOptions, FileSource

# ------------------------------------------------------------
# Assumes you already have `html_doc` (string) with your page.
# If you already created `soup` elsewhere, you can remove the
# two lines below and import/use your existing `soup` variable.
# ------------------------------------------------------------
# html_doc = ...  # your HTML string that includes the audio
# soup = BeautifulSoup(html_doc, 'html.parser')

# If you already have a soup object:
# soup = BeautifulSoup(html_doc, 'html.parser')
# Or simply keep your existing:
# soup = <your existing BeautifulSoup instance>
try:
    soup  # type: ignore[name-defined]
except NameError:
    soup = None  # If not provided, we'll just fall back to file path.

# ✅ Rotate this leaked key; prefer DG key via env: DEEPGRAM_API_KEY
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY", "b5e61f8fd83a188dfba7b0035b8849634a594140")


# -------------------------
# Helpers (frontend first)
# -------------------------
def parse_data_url(data_url: str) -> Tuple[str, bytes]:
    """
    Parse a data URL like: data:audio/webm;codecs=opus;base64,AAAA...
    Returns (mime, raw_bytes).
    """
    if not data_url.startswith("data:"):
        raise ValueError("Not a data URL.")
    try:
        header, b64 = data_url.split(",", 1)
    except ValueError:
        raise ValueError("Malformed data URL (missing comma).")

    # header example: data:audio/webm;codecs=opus;base64
    # Extract MIME type between 'data:' and the first ';' or ','.
    meta = header[5:]  # strip 'data:'
    # default mime if not present
    mime = "application/octet-stream"
    if ";" in meta:
        mime = meta.split(";", 1)[0] or mime
    elif meta:
        mime = meta

    # must be base64 for this path
    if ";base64" not in header:
        raise ValueError("Data URL is not base64-encoded.")

    raw = base64.b64decode(b64)
    return mime, raw


def extract_audio_from_soup(bs: BeautifulSoup) -> Optional[Tuple[bytes, str]]:
    """
    Try, in order:
      1) <audio id="audioPlayer" src="data:...">
      2) <audio><source src="data:..."></audio>
      3) data attributes on #audioPlayer or #audioControls:
         data-base64="..." and data-mime="...".
      4) Generic first <audio> with data: URL.
    Returns (bytes, mimetype) or None if not present.
    """
    if bs is None:
        return None

    # 1) <audio id="audioPlayer" src="data:...">
    audio = bs.find(id="audioPlayer")
    if audio and audio.has_attr("src"):
        src = audio["src"]
        if src.startswith("data:"):
            mime, raw = parse_data_url(src)
            return raw, mime

    # 2) <audio><source src="data:..."></audio>
    if audio:
        source = audio.find("source")
        if source and source.has_attr("src"):
            src = source["src"]
            if src.startswith("data:"):
                mime, raw = parse_data_url(src)
                return raw, mime

    # 3) data attributes on #audioPlayer or #audioControls
    #    e.g., <audio id="audioPlayer" data-base64="..." data-mime="audio/webm">
    for el_id in ("audioPlayer", "audioControls"):
        el = bs.find(id=el_id)
        if el:
            data_b64 = el.get("data-base64")
            data_mime = el.get("data-mime")
            if data_b64 and data_mime:
                try:
                    raw = base64.b64decode(data_b64)
                    return raw, data_mime
                except Exception:
                    pass  # fall through

    # 4) First <audio> with a data: URL src
    any_audio = bs.find("audio")
    if any_audio and any_audio.has_attr("src"):
        src = any_audio["src"]
        if src.startswith("data:"):
            mime, raw = parse_data_url(src)
            return raw, mime

    # If we reach here, we couldn't find usable audio in the DOM.
    return None


def make_payload_from_frontend(bs: BeautifulSoup) -> Optional[FileSource]:
    """
    Build a Deepgram FileSource from the soup if present.
    """
    extracted = extract_audio_from_soup(bs)
    if not extracted:
        return None
    raw, mime = extracted
    payload: FileSource = {"buffer": raw}
    if mime:
        payload["mimetype"] = mime
    return payload


# -------------------------
# Original path-based path
# -------------------------
def read_audio_bytes(path: Path) -> bytes:
    if not path.exists():
        raise FileNotFoundError(f"No such file: {path}")
    if not path.is_file():
        raise IsADirectoryError(f"Path is not a file: {path}")
    return path.read_bytes()


def make_payload_from_path(path: Path) -> FileSource:
    audio_bytes = read_audio_bytes(path)
    payload: FileSource = {"buffer": audio_bytes}
    mime, _ = mimetypes.guess_type(path.name)
    if mime:
        payload["mimetype"] = mime
    return payload


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Transcribe an audio file with Deepgram.")
    p.add_argument(
        "audio_path",
        nargs="?",
        help="Path to the audio file (e.g., ~/clip.mp3). If omitted, we'll try to use the front-end audio in the HTML."
    )
    p.add_argument("--model", default="nova-3", help="Deepgram model (default: nova-3)")
    return p.parse_args()


def main():
    args = parse_args()

    try:
        deepgram = DeepgramClient(DEEPGRAM_API_KEY)

        # 1) Prefer the front-end audio captured in the HTML (via BeautifulSoup)
        payload = None
        if soup is not None:
            payload = make_payload_from_frontend(soup)

        # 2) Fallback: use a file path if HTML didn't contain usable audio
        if payload is None:
            if not args.audio_path:
                # preserve original prompt behavior
                try:
                    args.audio_path = input("Enter path to audio file: ").strip().strip('"').strip("'")
                except EOFError:
                    print("No audio in HTML and no path provided.", file=sys.stderr)
                    sys.exit(2)
            audio_path = Path(os.path.expanduser(args.audio_path)).resolve()
            payload = make_payload_from_path(audio_path)

        options = PrerecordedOptions(
            model=args.model,
            smart_format=True,
        )

        response = deepgram.listen.rest.v("1").transcribe_file(payload, options)
        print(response.to_json(indent=4))

    except Exception as e:
        print(f"Exception: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

*/