import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY!;

// ---- Gemini: chat (reasoning) ----
app.post('/api/gemini', async (req, res) => {
  try {
    const { messages } = req.body as {
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
    };

    const sys = messages.find(m => m.role === 'system')?.content ?? '';
    const convo = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `${sys}\n\n${convo}\nASSISTANT:`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );

    const data = await r.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      'Sorry, I could not generate a reply.';
    res.json({ text });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Gemini error', detail: String(e) });
  }
});

// ---- Deepgram: TTS (audio out) ----
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'aura-2-thalia-en', format = 'mp3' } = req.body as {
      text: string; voice?: string; format?: 'mp3'|'wav';
    };

    const r = await fetch('https://api.deepgram.com/v1/speak', {
      method: 'POST',
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: format === 'wav' ? 'audio/wav' : 'audio/mpeg'
      },
      body: JSON.stringify({ model: voice, text })
    });

    if (!r.ok) {
      const t = await r.text();
      res.status(502).send(t);
      return;
    }

    res.setHeader('Content-Type', format === 'wav' ? 'audio/wav' : 'audio/mpeg');
    r.body?.pipe(res);
  } catch (e: any) {
    console.error(e);
    res.status(500).send('Deepgram TTS error: ' + String(e));
  }
});

app.listen(process.env.PORT || 4000, () => {
  console.log('API server running on http://localhost:' + (process.env.PORT || 4000));
});
