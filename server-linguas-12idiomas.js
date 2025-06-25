
const express = require("express");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const getSystemPrompt = (lang) => {
  const prompts = {
    "en": "You are a helpful travel assistant. Reply in English.",
    "pt": "Você é um assistente de viagem simpático. Responda em português.",
    "es": "Eres un asistente de viajes útil. Responde en español.",
    "fr": "Vous êtes un assistant de voyage serviable. Répondez en français.",
    "de": "Du bist ein hilfreicher Reiseassistent. Antworte auf Deutsch.",
    "it": "Sei un assistente di viaggio utile. Rispondi in italiano.",
    "ko": "당신은 친절한 여행 도우미입니다. 한국어로 대답하세요.",
    "ja": "あなたは親切な旅行アシスタントです。日本語で答えてください。",
    "zh": "你是一个有帮助的旅行助手。请用中文回答。",
    "ru": "Вы полезный помощник в путешествиях. Отвечайте по-русски.",
    "ar": "أنت مساعد سفر مفيد. يرجى الرد باللغة العربية.",
    "hi": "आप एक सहायक यात्रा सहायक हैं। कृपया हिंदी में उत्तर दें।"
  };
  return prompts[lang] || prompts["en"];
};

app.post("/gpt-tps", async (req, res) => {
  const { prompt, language } = req.body;
  if (!prompt) return res.status(400).json({ result: "❌ Prompt não fornecido." });

  const systemPrompt = getSystemPrompt(language || "en");
  console.log("📩 Prompt recebido:", prompt);
  console.log("🌐 Idioma:", language, "| 📥 systemPrompt:", systemPrompt);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const tipo = response.headers.get("content-type") || "";
    const raw = await response.text();

    if (!response.ok || !tipo.includes("application/json")) {
      console.error("❌ Erro na resposta:", raw.slice(0, 200));
      return res.json({ result: "❌ Erro ao contatar IA. Verifique conexão ou chave." });
    }

    const data = JSON.parse(raw);
    const saida = data?.choices?.[0]?.message?.content || "⚠️ Resposta vazia.";
    return res.json({ result: saida });

  } catch (err) {
    console.error("❌ Erro geral:", err.message);
    return res.json({ result: "❌ Erro de conexão com a IA." });
  }
});

app.get("/test", (req, res) => {
  res.send("✅ Backend multilíngue (12 idiomas) TPS ativo.");
});

app.listen(3000, () => {
  console.log("🌐 GPT-TPS multilíngue (12 idiomas) rodando em http://localhost:3000");
});
