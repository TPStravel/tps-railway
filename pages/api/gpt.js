// api/gpt.js
import fetch from 'node-fetch'; // ✅ IMPORTAÇÃO NECESSÁRIA

export default async function handler(req, res) {
  console.log('[DEBUG] Iniciando endpoint GPT');

  if (req.method !== 'POST') {
    console.log('[DEBUG] Método inválido:', req.method);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { message } = req.body;
  console.log('[DEBUG] Mensagem recebida:', message);

  if (!process.env.OPENAI_API_KEY) {
    console.error('[ERRO] Chave da OpenAI não configurada');
    return res.status(500).json({ error: 'Chave da OpenAI não configurada' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7
      }),
    });

    const data = await response.json();
    console.log('[DEBUG] Resposta da OpenAI:', data);

    const reply = data.choices?.[0]?.message?.content || 'Erro na resposta do GPT.';
    res.status(200).json({ reply });

  } catch (error) {
    console.error('[ERRO] Falha na comunicação com OpenAI:', error);
    res.status(500).json({ error: 'Erro na comunicação com a OpenAI.' });
  }
}
