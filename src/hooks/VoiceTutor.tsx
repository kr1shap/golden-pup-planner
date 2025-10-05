import { useCallback, useEffect, useRef, useState } from 'react';
import { useSpeech } from '../hooks/useSpeech';

type Msg = { role: 'user' | 'assistant' | 'system'; content: string };

const SYSTEM_PROMPT = `
You are a supportive study tutor. For each concept: 
1) explain briefly; 2) ask a check-for-understanding; 
3) if I'm wrong, re-teach with a simpler example; 
4) end each topic with a 2-question oral quiz; 
5) speak clearly at a medium pace.
`;

export default function VoiceTutor() {
  const [history, setHistory] = useState<Msg[]>([
    { role: 'system', content: SYSTEM_PROMPT.trim() }
  ]);
  const [partial, setPartial] = useState('');
  const [busy, setBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const onResult = useCallback((text: string, isFinal: boolean) => {
    // show interim text
    setPartial(isFinal ? '' : text);
    if (isFinal) setHistory(h => [...h, { role: 'user', content: text }]);
  }, []);

  const { start, stop, listening } = useSpeech(onResult);

  // When a new user message is added, call Gemini then TTS then play
  useEffect(() => {
    const last = history[history.length - 1];
    if (!last || last.role !== 'user') return;

    (async () => {
      setBusy(true);
      try {
        // 1) Reason with Gemini
        const r = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });
        const { text } = await r.json();
        setHistory(h => [...h, { role: 'assistant', content: text }]);

        // 2) Turn to speech with Deepgram
        const tts = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice: 'aura-2-thalia-en', format: 'mp3' })
        });

        const blob = await tts.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          await audioRef.current.play();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setBusy(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  return (
    <div className="p-4 max-w-xl mx-auto space-y-3">
      <h2 className="text-xl font-semibold">Voice Study Tutor</h2>

      <div className="flex gap-2">
        {!listening ? (
          <button className="px-3 py-2 rounded-xl bg-green-600 text-white disabled:opacity-50"
                  onClick={start} disabled={busy}>
            🎙️ Start Talking
          </button>
        ) : (
          <button className="px-3 py-2 rounded-xl bg-red-600 text-white" onClick={stop}>
            ⏹️ Stop
          </button>
        )}
        <button className="px-3 py-2 rounded-xl bg-gray-200"
                onClick={() => setHistory([{ role: 'system', content: SYSTEM_PROMPT.trim() }])}>
          🔁 Reset Session
        </button>
      </div>

      <div className="text-sm text-gray-600">
        {listening ? 'Listening…' : 'Idle'} {busy ? ' • thinking…' : ''}
      </div>

      <div className="bg-white rounded-2xl shadow p-3 h-64 overflow-auto space-y-2">
        {history.filter(m => m.role !== 'system').map((m, i) => (
          <div key={i}><b>{m.role === 'user' ? 'You' : 'Tutor'}:</b> {m.content}</div>
        ))}
        {partial && <div className="opacity-70"><b>You (speaking)…</b> {partial}</div>}
      </div>

      <audio ref={audioRef} />
    </div>
  );
}
