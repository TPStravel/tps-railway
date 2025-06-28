// server.js - TPS-GPT Sistema Completo Integrado
// 🎯 Combina: LLaMA AI + Respostas Simbólicas + Links Afiliados Reais
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// ===== IMPORTAR MÓDULOS TPS =====
import { analisarViagem } from './tps-travel-router.js';
import { getMensagemSimbolica } from './resposta-simbolica.js';
import { gerarLinksAfiliados, gerarLinksProtegidos, validarLinks } from './affiliate-links.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// ===== CORS Personalizado para Hostinger =====
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://canalvivo.org');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Preflight OK
  }
  next();
});

const PORT = process.env.PORT || 8080;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// ===== ENDPOINT PRINCIPAL TPS-GPT =====
app.post("/gpt-tps", async (req, res) => {
  try {
    console.log('🎯 Requisição TPS-GPT recebida:', req.body);
    
    // Compatibilidade: suporta tanto { message } quanto { messages: [{ content }] }
    const prompt = req.body.message || req.body.messages?.[0]?.content;
    const lang = req.body.lang || req.body.language || 'pt';
    
    if (!prompt) {
      return res.status(400).json({ 
        error: "Prompt/message é obrigatório",
        format: "{ message: 'text' } ou { messages: [{ content: 'text' }] }"
      });
    }

    console.log(`🔍 Analisando: "${prompt}" (idioma: ${lang})`);
    
    // ===== 1️⃣ ANÁLISE TPS: VIAGEM OU PERGUNTA GERAL? =====
    const planoViagem = analisarViagem(prompt, lang);
    
    if (planoViagem && planoViagem.destino) {
      console.log(`✈️ Plano de viagem detectado: ${planoViagem.destino.cidade}`);
      
      // ===== 2️⃣ GERAR RESPOSTA SIMBÓLICA =====
      const mensagemSimbolica = getMensagemSimbolica(planoViagem.destino, lang);
      
      // ===== 3️⃣ GERAR LINKS AFILIADOS =====
      const linksAfiliados = gerarLinksAfiliados(planoViagem.destino, planoViagem.servicos);
      const linksProtegidos = gerarLinksProtegidos(planoViagem.destino, planoViagem.servicos);
      const linksValidados = validarLinks({ ...linksAfiliados, ...linksProtegidos });
      
      // ===== 4️⃣ RESPOSTA FINAL TPS =====
      const respostaCompleta = `${mensagemSimbolica}

🔗 **Reserve sua viagem agora:**

${Object.keys(linksValidados).length > 0 ? 
  Object.entries(linksValidados).map(([nome, link]) => 
    `• **${formatarNomeLink(nome)}**: [Clique aqui](${link})`
  ).join('\n') 
  : '• Explore opções personalizadas com nossos parceiros'
}

💡 *Clique nos links acima para garantir os melhores preços e apoiar o TPS.*`;

      console.log(`✅ Resposta TPS gerada com ${Object.keys(linksValidados).length} links afiliados`);

      return res.json({
        success: true,
        type: 'travel-plan',
        content: respostaCompleta,
        metadata: {
          destino: planoViagem.destino,
          servicos: planoViagem.servicos,
          links_count: Object.keys(linksValidados).length,
          language: lang,
          timestamp: new Date().toISOString()
        }
      });
    }

    // ===== 5️⃣ FALLBACK: USAR LLaMA AI PARA PERGUNTAS GERAIS =====
    console.log('🤖 Não é viagem, usando LLaMA AI...');
    
    const respostaIA = await chamarLlamaAI(prompt, lang);
    
    return res.json({
      success: true,
      type: 'general-ai',
      content: respostaIA,
      metadata: {
        model: 'llama-3.2-70b',
        language: lang,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro no endpoint TPS-GPT:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      fallback: 'Desculpe, tivemos um problema técnico. Tente novamente em alguns segundos.',
      timestamp: new Date().toISOString()
    });
  }
});

// ===== FUNÇÃO: CHAMAR LLaMA AI =====
async function chamarLlamaAI(prompt, lang = 'pt') {
  try {
    console.log('🧠 Conectando com LLaMA AI...');
    
    // Definir idioma do sistema
    const promptSistema = definirPromptSistema(lang);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://app.canalvivo.org",
        "X-Title": "TPS Travel Professional System"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-70b-instruct:free",
        messages: [
          {
            role: "system",
            content: promptSistema
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("❌ Erro OpenRouter:", data.error);
      throw new Error(data.error.message || 'Erro na API OpenRouter');
    }

    const resposta = data.choices?.[0]?.message?.content || "❗ Resposta vazia da IA.";
    
    console.log(`✅ LLaMA respondeu: ${resposta.substring(0, 100)}...`);
    return resposta;

  } catch (error) {
    console.error('❌ Erro ao chamar LLaMA:', error);
    throw error;
  }
}

// ===== FUNÇÃO: DEFINIR PROMPT DO SISTEMA POR IDIOMA =====
function definirPromptSistema(lang) {
  const prompts = {
    pt: `Você é um especialista em viagens do TPS (Travel Professional System).

INSTRUÇÕES:
- Responda SEMPRE em português brasileiro
- Seja especialista, mas amigável e conversacional
- Inclua emojis relevantes 
- Faça sugestões práticas de destinos, hotéis, atividades
- Quando apropriado, sugira nossos parceiros de viagem
- Mantenha respostas entre 150-400 palavras
- Foque em experiências transformadoras de viagem
- Se mencionar cidade específica, dê dicas locais detalhadas
- Sempre termine com uma pergunta para manter engajamento`,

    en: `You are a travel expert from TPS (Travel Professional System).

INSTRUCTIONS:
- Always respond in English
- Be expert but friendly and conversational
- Include relevant emojis
- Make practical suggestions for destinations, hotels, activities
- When appropriate, suggest our travel partners
- Keep responses between 150-400 words
- Focus on transformative travel experiences
- If mentioning specific cities, give detailed local tips
- Always end with a question to maintain engagement`,

    es: `Eres un experto en viajes del TPS (Travel Professional System).

INSTRUCCIONES:
- Responde SIEMPRE en español
- Sé experto pero amigable y conversacional
- Incluye emojis relevantes
- Haz sugerencias prácticas de destinos, hoteles, actividades
- Cuando sea apropiado, sugiere nuestros socios de viaje
- Mantén respuestas entre 150-400 palabras
- Enfócate en experiencias de viaje transformadoras`,

    fr: `Vous êtes un expert en voyages du TPS (Travel Professional System).

INSTRUCTIONS:
- Répondez TOUJOURS en français
- Soyez expert mais amical et conversationnel
- Incluez des emojis pertinents
- Faites des suggestions pratiques de destinations, hôtels, activités
- Le cas échéant, suggérez nos partenaires de voyage
- Gardez les réponses entre 150-400 mots`,

    de: `Sie sind ein Reiseexperte von TPS (Travel Professional System).

ANWEISUNGEN:
- Antworten Sie IMMER auf Deutsch
- Seien Sie fachkundig, aber freundlich und gesprächig
- Fügen Sie relevante Emojis hinzu
- Machen Sie praktische Vorschläge für Reiseziele, Hotels, Aktivitäten
- Schlagen Sie gegebenenfalls unsere Reisepartner vor`
  };

  return prompts[lang] || prompts['pt'];
}

// ===== FUNÇÃO: FORMATAR NOME DO LINK =====
function formatarNomeLink(nome) {
  const formatacao = {
    'vooTrip': '✈️ Voos Trip.com',
    'vooKiwi': '✈️ Voos Kiwi.com', 
    'vooAviasales': '✈️ Comparar Voos',
    'vooWayaway': '✈️ Voos + Cashback',
    'hotelBooking': '🏨 Hotéis Booking.com',
    'hotelTrip': '🏨 Hotéis Trip.com',
    'hotelHotellook': '🏨 Comparar Hotéis',
    'carroLocalrent': '🚗 Aluguel Local',
    'transferPickups': '🚕 Transfer Aeroporto',
    'transferKiwitaxi': '🚖 Táxi/Transfer',
    'tiqets': '🎫 Ingressos Tiqets',
    'wegotrip': '🎭 Tours Culturais',
    'seguroEkta': '🛡️ Seguro Viagem EKTA',
    'compensacaoVoo': '💰 Reembolso Voo Atrasado'
  };

  return formatacao[nome] || nome.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

// ===== ENDPOINT: STATUS E HEALTH CHECK =====
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'TPS-GPT Sistema Completo funcionando',
    timestamp: new Date().toISOString(),
    version: '8.0.0-integrated',
    features: {
      travel_router: true,
      symbolic_responses: true,
      affiliate_links: true,
      llama_ai: !!process.env.OPENROUTER_API_KEY,
      multilingual: true
    },
    modules: {
      'tps-travel-router': 'Análise inteligente de viagem',
      'resposta-simbolica': 'Mensagens emocionais multilíngues', 
      'affiliate-links': 'Monetização com links reais'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openrouter: !!process.env.OPENROUTER_API_KEY,
    modules_loaded: true
  });
});

// ===== ENDPOINT: ESTATÍSTICAS DE LINKS =====
app.get('/api/affiliate-stats', (req, res) => {
  try {
    // Simular estatísticas (em produção, viria de banco de dados)
    const stats = {
      parceiros_ativos: 15,
      links_gerados_hoje: 0,
      destinos_suportados: 25,
      idiomas_suportados: 12,
      conversao_media: '2.3%',
      receita_estimada: 'R$ 0,00'
    };
    
    res.json({
      success: true,
      estatisticas: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PÁGINA PRINCIPAL - REDIRECIONAR PARA TPS-GPT.HTML =====
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <title>TPS - Travel Professional System</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh; 
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 20px;
        }
        .logo { font-size: 6rem; font-weight: 300; color: #4fc3f7; margin-bottom: 20px; }
        .title { font-size: 2rem; font-weight: 700; margin-bottom: 40px; }
        .description { font-size: 1.2rem; margin-bottom: 40px; max-width: 600px; line-height: 1.6; }
        .btn { 
            background: linear-gradient(135deg, #4fc3f7, #29b6f6);
            border: none; padding: 20px 40px; border-radius: 30px; color: white;
            font-weight: 600; font-size: 18px; cursor: pointer; text-decoration: none;
            transition: all 0.3s ease; display: inline-block; margin: 10px;
        }
        .btn:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(79, 195, 247, 0.4); }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 40px; max-width: 800px; }
        .feature { background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 15px; }
        .status { margin-top: 40px; padding: 20px; background: rgba(76, 175, 80, 0.2); border-radius: 10px; }
    </style>
</head>
<body>
    <div class="logo">TPS</div>
    <div class="title">Travel Professional System</div>
    <div class="description">
        Sistema completo de viagens com IA avançada, respostas simbólicas emocionais e links afiliados reais para monetização.
    </div>
    
    <div>
        <a href="/tps-gpt.html" class="btn">🚀 Acessar TPS-GPT</a>
        <a href="/api/status" class="btn">📊 Status do Sistema</a>
    </div>
    
    <div class="features">
        <div class="feature">
            <h3>🧠 IA Inteligente</h3>
            <p>Detecta destinos e serviços automaticamente</p>
        </div>
        <div class="feature">
            <h3>🎨 Respostas Simbólicas</h3>
            <p>Mensagens emocionais em 12 idiomas</p>
        </div>
        <div class="feature">
            <h3>💰 Monetização</h3>
            <p>15+ parceiros com links afiliados reais</p>
        </div>
        <div class="feature">
            <h3>🌍 Global</h3>
            <p>25+ destinos principais suportados</p>
        </div>
    </div>
    
    <div class="status">
        <strong>✅ Sistema TPS-GPT v8.0 Integrado - Todos os módulos ativos</strong><br>
        Análise de Viagem • Respostas Simbólicas • Links Afiliados • LLaMA AI
    </div>
</body>
</html>
  `);
});

// ===== ERROR HANDLING =====
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err);
  res.status(500).json({ 
    success: false,
    error: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// ===== INICIALIZAÇÃO =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TPS-GPT v8.0 Integrado ativo na porta ${PORT}`);
  console.log(`🤖 OpenRouter: ${process.env.OPENROUTER_API_KEY ? '✅' : '❌'}`);
  console.log(`🌐 Acesso: https://app.canalvivo.org`);
  console.log(`📊 Status: /api/status`);
  console.log(`💰 Stats: /api/affiliate-stats`);
  console.log(`✅ Módulos carregados: travel-router, resposta-simbolica, affiliate-links`);
});

// ===== GRACEFUL SHUTDOWN =====
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM recebido, fechando servidor...');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não capturada:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Promise rejeitada:', err);
});