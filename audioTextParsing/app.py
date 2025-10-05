import os
import base64
import mimetypes
from pathlib import Path
from urllib.parse import unquote

import requests
from flask import Flask, jsonify, render_template, request
from bs4 import BeautifulSoup

# ---------- Config ----------
DEEPGRAM_API_KEY = os.environ.get("DEEPGRAM_API_KEY")  # required for Deepgram

app = Flask(__name__)

# ---------- Utilities: extract audio bytes + mime from HTML ----------
def parse_data_url(data_url: str):
    """
    Parse data:audio/...;base64,AAAA...
    Returns (mime, bytes)
    """
    if not data_url.startswith("data:"):
        raise ValueError("Not a data URL.")
    header, b64 = data_url.split(",", 1)
    meta = header[5:]  # strip 'data:'
    mime = (meta.split(";", 1)[0] or "application/octet-stream") if ";" in meta else (meta or "application/octet-stream")
    if ";base64" not in header.lower():
        raise ValueError("Data URL not base64-encoded.")
    return mime, base64.b64decode(b64)

def guess_mime_for_path(path: Path) -> str:
    mime, _ = mimetypes.guess_type(path.name)
    return mime or "application/octet-stream"

def read_local_audio_bytes(app_root: Path, src: str) -> tuple[bytes, str]:
    """
    Try typical locations for a relative src:
      - static/src
      - app_root/src
      - templates/src (last resort)
    """
    candidates = [
        app_root / "static" / src,
        app_root / src,
        app_root / "templates" / src,
    ]
    for p in candidates:
        if p.exists() and p.is_file():
            return p.read_bytes(), guess_mime_for_path(p)
    raise FileNotFoundError(f"Audio file not found for src='{src}'. Tried: {', '.join(str(c) for c in candidates)}")

def extract_audio_from_template() -> tuple[bytes, str]:
    """
    Load templates/index.html, parse with BS, find #audioPlayer, and return (bytes, mime).
    Supports:
      - data URL in src
      - http(s) URL in src (downloads)
      - local relative path in src (looks in static/, then app root)
    """
    # 1) load the HTML
    html_path = Path(app.root_path) / "templates" / "index.html"
    html = html_path.read_text(encoding="utf-8", errors="ignore")

    # 2) parse
    soup = BeautifulSoup(html, "html.parser")
    audio = soup.find(id="audioPlayer")
    if not audio or not audio.has_attr("src"):
        raise RuntimeError("index.html has no <audio id='audioPlayer' src='...'>")

    src = str(audio["src"]).strip()
    src = unquote(src)  # handle spaces or %20

    # 3) route based on src
    if src.startswith("data:"):
        mime, audio_bytes = parse_data_url(src)
        return audio_bytes, mime

    if src.startswith("http://") or src.startswith("https://"):
        r = requests.get(src, timeout=30)
        r.raise_for_status()
        mime = (r.headers.get("Content-Type") or "application/octet-stream").split(";")[0]
        return r.content, mime

    # else: treat as local relative path (e.g., "University of Toronto Scarborough 2.m4a")
    audio_bytes, mime = read_local_audio_bytes(Path(app.root_path), src)
    return audio_bytes, mime

# ---------- STT: Deepgram ----------
def transcribe_with_deepgram(audio_bytes: bytes, mime: str, model: str = "nova-3") -> str:
    if not DEEPGRAM_API_KEY:
        raise RuntimeError("DEEPGRAM_API_KEY not set.")
    from deepgram import DeepgramClient, PrerecordedOptions  # lazy import

    client = DeepgramClient(DEEPGRAM_API_KEY)
    payload = {"buffer": audio_bytes, "mimetype": mime}
    options = PrerecordedOptions(model=model, smart_format=True)

    resp = client.listen.rest.v("1").transcribe_file(payload, options)
    # Deepgram returns structured JSON; you may prefer resp["results"]["channels"][0]["alternatives"][0]["transcript"]
    try:
        alt = resp.to_dict()["results"]["channels"][0]["alternatives"][0]
        return alt.get("paragraphs", {}).get("transcript") or alt.get("transcript") or ""
    except Exception:
        # Fallback to full JSON string if shape differs
        return resp.to_json(indent=0)

# ---------- (Optional) STT: Gemini ----------
# def transcribe_with_gemini(audio_bytes: bytes, mime: str, model="gemini-2.5-flash") -> str:
#     from google import genai
#     from google.genai import types
#     client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
#     res = client.models.generate_content(
#         model=model,
#         contents=[
#             "Transcribe the speech verbatim. Return only the transcript.",
#             types.Part.from_bytes(data=audio_bytes, mime_type=mime),
#         ],
#         config=types.GenerateContentConfig(response_mime_type="text/plain"),
#     )
#     return (res.text or "").strip()

# ---------- Routes ----------
@app.get("/")
def index():
    return render_template("index.html")

@app.get("/transcribe")
def transcribe():
    try:
        audio_bytes, mime = extract_audio_from_template()
        transcript = transcribe_with_deepgram(audio_bytes, mime)   # or transcribe_with_gemini(...)
        return jsonify({"ok": True, "mime": mime, "transcript": transcript})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 400

@app.post("/upload")
def upload():
    if "audio" not in request.files:
        return jsonify({"ok": False, "error": "No audio file"}), 400
    audio = request.files["audio"]
    audio_bytes = audio.read()
    mime = audio.mimetype
    try:
        transcript = transcribe_with_deepgram(audio_bytes, mime)
        return jsonify({"ok": True, "transcript": transcript})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

@app.post("/ingest")
def ingest():
    # accept raw text or JSON
    text = request.get_data(as_text=True) or (request.json or {}).get("text", "")
    print(f"[Flask] Received text: {text}")  # <- this prints to your terminal
    return jsonify({"ok": True, "received": text})

if __name__ == "__main__":
    # Enable reloader for dev
    app.run(debug=True)
