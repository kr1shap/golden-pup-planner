import { useEffect, useRef, useState } from 'react';

type OnResult = (text: string, isFinal: boolean) => void;

export function useSpeech(onResult: OnResult) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }
    const rec: SpeechRecognition = new SR();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (ev: SpeechRecognitionEvent) => {
      const res = ev.results[ev.resultIndex];
      const text = res[0].transcript;
      onResult(text, res.isFinal);
    };
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
  }, [onResult]);

  const start = () => {
    recognitionRef.current?.start();
    setListening(true);
  };
  const stop = () => recognitionRef.current?.stop();

  return { start, stop, listening, supported: !!recognitionRef.current };
}
