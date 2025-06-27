import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { callGPTWithFallback } from "./gpt-fallback-handler.js";
import rateLimit from "express-rate-limit";
import amadeusFlightsRoute from "./routes/amadeus-flights.js";

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
    const resposta = await callGPTWithFallback(prompt);
    res.json({ content: resposta });
  } catch (error) {
    console.error("Erro ao gerar resposta:", error);
    res.status(500).json({ error: "Erro ao gerar resposta com fallback." });
  }
});

});

// Fallback manual (opcional)
app.get("/", (_, res) => {
  res.send("🟢 Backend do TPS ativo.");
});

// Rota de teste da Amadeus
app.get("/amadeus-test", async (req, res) => {
  try {
    const authResponse = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET,
      })
    });

    const data = await authResponse.json();

    if (data.access_token) {
      res.status(200).json({ success: true, message: "Token gerado com sucesso ✅", token: data.access_token });
    } else {
      res.status(401).json({ success: false, message: "Erro ao gerar token", detalhes: data });
    }

  } catch (error) {
    console.error("Erro Amadeus:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use("/amadeus-flights", amadeusFlightsRoute);
// Teste de conexão com Amadeus - Geração de Token
app.get("/amadeus-test", async (req, res) => {
  try {
    const authResponse = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.AMADEUS_API_KEY,
        client_secret: process.env.AMADEUS_API_SECRET
      })
    });

    const authData = await authResponse.json();
    if (process.env.NODE_ENV !== 'production') {
      console.log("🔑 Token Amadeus:", authData.access_token);
    }

    res.json({
      success: true,
      message: "Token gerado com sucesso ✅"
      // token: authData.access_token // 🔐 Mantido apenas para debug local se quiser
    });


  } catch (error) {
    console.error("Erro ao gerar token Amadeus:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando em http://0.0.0.0:${PORT}`);
});
