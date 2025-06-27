import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Chat GPT endpoint
app.post("/gpt-tps", async (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Mensagem não fornecida" });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-70b-instruct:free",
        messages: [{ role: "user", content: message }],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Erro na resposta";
    
    res.json({ content: reply });

  } catch (error) {
    console.error("Erro:", error);
    res.status(500).json({ error: "Erro na IA" });
  }
});

// Página principal
app.get('/', (req, res) => {
  res.send(`
    <h1>TPS funcionando!</h1>
    <p>Servidor ativo na porta ${PORT}</p>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});