const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const modelos = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "deepseek-chat",
  "mistral-7b-instruct:free"
];

app.post("/gpt-tps", async (req, res) => {
  const userPrompt = req.body.prompt;
  if (!userPrompt) return res.status(400).json({ error: "Prompt ausente" });

  for (const model of modelos) {
    try {
      const resposta = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content: "Você é o TPS – Travel Personally Secretary, um assistente de viagens inteligente, amigável e direto."
            },
            { role: "user", content: userPrompt }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );

      const texto = resposta.data.choices?.[0]?.message?.content;
      if (texto) return res.json({ model, response: texto });
    } catch (erro) {
      console.warn(`Erro com modelo ${model}: ${erro.message}`);
    }
  }

  res.status(500).json({ error: "Todos os modelos falharam" });
});

app.listen(port, () => {
  console.log(`🧠 TPS backend rodando na porta ${port}`);
});
