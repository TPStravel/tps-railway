export async function handler(event) {
  try {
    const { message } = JSON.parse(event.body || '{}');

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Mensagem ausente' })
      };
    }

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
          {
            role: "system",
            content: `
Você é um assistente de viagem emocional, sensível e criativo.
Responda como se estivesse conversando pessoalmente com o viajante.
Nunca pareça uma ferramenta automática. Evite listas secas e termos como "verifique no site", "confira no Booking", "Airbnb", "Expedia", etc.

Seu papel é imaginar com a pessoa, oferecer conselhos sinceros, considerar possibilidades alternativas, perguntar com carinho e despertar um sentimento real de descoberta.

Quando alguém disser "quero hotel barato em Lisboa", responda de forma humana, como:

"Lisboa tem lugares encantadores mesmo para quem quer economizar. Me diga uma coisa: você prefere algo mais perto dos miradouros ou das ruelas históricas como Alfama?"

Nunca invente nomes de hotéis. Prefira indicar regiões, atmosferas e experiências. E sempre demonstre cuidado e envolvimento real com a pessoa.
`
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: data.choices?.[0]?.message?.content || 'Sem resposta.' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
