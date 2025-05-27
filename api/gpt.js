// api/gpt.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { message, lang = 'pt' } = req.body;

  const systemMessages = {
    pt: `Você é um assistente de viagem emocional, sensível e criativo. Responda em português com empatia e imaginação.`,
    en: `You are an emotional, sensitive and creative travel assistant. Respond in English with empathy and imagination.`,
    es: `Eres un asistente de viajes emocional, sensible y creativo. Responde en español con empatía e imaginación.`,
    ko: `당신은 감성적이고 창의적인 여행 도우미입니다. 한국어로 따뜻하고 인간적인 톤으로 대답해주세요.`,
    fr: `Vous êtes un assistant de voyage émotionnel, sensible et créatif. Répondez en français avec empathie.`,
    ja: `あなたは感情的で思いやりのある旅行アシスタントです。日本語で優しく答えてください。`
  };

  const systemPrompt = systemMessages[lang] || systemMessages['pt'];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        temperature: 0.8,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.choices?.[0]?.message?.content || 'Sem resposta.';

    return res.status(200).json({ result: reply });

  } catch (err) {
    console.error('Erro ao se comunicar com OpenAI:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
