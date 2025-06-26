import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Limite de requisições por IP
app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60
}));

// GPT Endpoint principal
app.post("/gpt-tps", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt ausente." });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://canalvivo.org",
        "X-Title": "TPS - Travel Assistant"
      },
      body: JSON.stringify({
        model: process.env.MODEL,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "❌ Resposta não recebida.";
    res.json({ content });

  } catch (error) {
    console.error("Erro GPT:", error.message);
    res.status(500).json({ error: "Erro interno ao processar GPT." });
  }
});

// Fallback manual (opcional)
app.get("/", (_, res) => {
  res.send("🟢 Backend do TPS ativo.");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
