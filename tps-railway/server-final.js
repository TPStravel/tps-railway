const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});
app.use(limiter);

app.post("/gpt-tps", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:nitro",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "⚠️ Nenhuma resposta recebida.";
    res.json({ content: reply });
  } catch (err) {
    console.error("Erro ao chamar OpenRouter:", err.message);
    res.status(500).json({ message: "Erro no servidor." });
  }
});

app.listen(port, () => {
  console.log(`✅ Servidor rodando em http://0.0.0.0:${port}`);
});
