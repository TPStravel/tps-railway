export async function callGPTWithFallback(prompt) {
  const models = process.env.MODEL
  ? [process.env.MODEL]  // usa o modelo fixo definido no .env
  : [
      "meta-llama/llama-3.2-3b-instruct",
      "nousresearch/nous-capybara-7b",
      "openchat/openchat-3.5"
    ];

  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "TPS-GPT/1.0 (https://tps.canalvivo.org)",
          "Referer": "https://tps.canalvivo.org",
          "X-Project": "TPS",
          "X-Client-Version": "2025.06"
        },

        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error(`Erro com modelo ${model}:`, error.message);
    }
  }

  return "⚠️ Todos os modelos falharam ao responder.";
}
