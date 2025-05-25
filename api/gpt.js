import fetch from 'node-fetch';
import rateLimit from './rateLimiter';
import { getCachedResponse, setCachedResponse } from './cache';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { message } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (rateLimit(ip)) {
    return res.status(429).json({ error: 'Muitas requisições. Tente novamente mais tarde.' });
  }

  if (typeof message !== 'string' || message.length === 0 || message.length > 1000) {
    return res.status(400).json({ error: 'Mensagem inválida ou muito longa' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada' });
  }

  const cached = getCachedResponse(message);
  if (cached) {
    return res.status(200).json({ reply: cached });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: message }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro da OpenAI API' });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Sem resposta';

    setCachedResponse(message, reply);

    return res.status(200).json({ resultado: reply });

  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Tempo limite excedido' });
    }
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
}
