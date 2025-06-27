// server.js - TPS Simples: LLaMA AI sem Firebase (para testar)
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ✅ AFFILIATE LINKS
const affiliateLinks = {
  'trip-flights': 'https://tp.media/r?marker=639764&trs=425649&p=8626&u=https%3A%2F%2Ftrip.com&campaign_id=121',
  'trip-hotels': 'https://tp.media/r?marker=639764&trs=425649&p=8626&u=https%3A%2F%2Ftrip.com&campaign_id=121',
  'kiwi': 'https://tp.media/click?shmarker=639764&promo_id=3413&source_type=link&type=click&campaign_id=111&trs=425649',
  'booking': 'https://www.awin1.com/cread.php?awinmid=18119&awinaffid=1949091&ued=https%3A%2F%2Fwww.booking.com%2Findex.html',
  'tiqets': 'https://tp.media/r?marker=639764&trs=425649&p=2074&u=https%3A%2F%2Ftiqets.com&campaign_id=89'
};

// ✅ ENDPOINT GPT (SIMPLES, SEM AUTENTICAÇÃO)
app.post("/gpt-tps", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Mensagem necessária" });
    }

    // Chamar LLaMA AI
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://app.canalvivo.org",
        "X-Title": "TPS Travel System"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.2-70b-instruct:free",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em viagens do TPS (Travel Professional System).

INSTRUÇÕES:
- Responda SEMPRE em português brasileiro
- Seja especialista, mas amigável e conversacional
- Inclua emojis relevantes 
- Faça sugestões práticas de destinos, hotéis, atividades
- Quando apropriado, sugira nossos parceiros: Trip.com, Booking.com, Kiwi, Tiqets
- Mantenha respostas entre 150-400 palavras
- Foque em experiências transformadoras de viagem
- Se mencionar cidade específica, dê dicas locais detalhadas
- Sempre termine com uma pergunta para manter engajamento`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("❌ OpenRouter Error:", data.error);
      return res.status(500).json({ 
        error: "Erro na IA. Tente novamente.",
        details: data.error.message 
      });
    }

    const reply = data.choices?.[0]?.message?.content || "❗ Resposta vazia da IA.";
    
    console.log(`🤖 Resposta gerada: ${reply.substring(0, 50)}...`);
    
    res.json({ 
      success: true,
      content: reply,
      model: "llama-3.2-70b",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("❌ Erro GPT:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      fallback: "Desculpe, tivemos um problema. Tente novamente em alguns segundos."
    });
  }
});

// ✅ REDIRECIONAMENTO AFILIADOS
app.get('/redirect/:partner', (req, res) => {
  const { partner } = req.params;
  const targetUrl = affiliateLinks[partner];
  
  if (!targetUrl) {
    return res.status(404).json({ 
      error: 'Parceiro não encontrado',
      available: Object.keys(affiliateLinks)
    });
  }

  console.log(`🔗 Redirecionamento: ${partner}`);
  res.redirect(302, targetUrl);
});

// ✅ PÁGINA PRINCIPAL - DESIGN CANAL VIVO
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <title>TPS - Travel Professional System</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
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
        }
        
        .logo {
            font-size: 8rem;
            font-weight: 300;
            letter-spacing: -0.1em;
            color: #4fc3f7;
            text-shadow: 0 0 30px rgba(79, 195, 247, 0.3);
            margin-bottom: 20px;
            animation: pulse 2s ease-in-out infinite alternate;
        }
        
        @keyframes pulse {
            from { text-shadow: 0 0 30px rgba(79, 195, 247, 0.3); }
            to { text-shadow: 0 0 50px rgba(79, 195, 247, 0.6); }
        }
        
        .brand {
            font-size: 3rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            margin-bottom: 40px;
            text-transform: uppercase;
        }
        
        .subtitle {
            font-size: 1.3rem;
            font-weight: 300;
            color: #4fc3f7;
            margin-bottom: 20px;
        }
        
        .description {
            font-size: 1.1rem;
            color: #b0bec5;
            margin-bottom: 30px;
            max-width: 500px;
            line-height: 1.6;
        }
        
        .chat-container {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 30px;
            margin-top: 40px;
            max-width: 600px;
            width: 90%;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .chat-area {
            min-height: 300px;
            max-height: 400px;
            overflow-y: auto;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .message {
            background: rgba(255, 255, 255, 0.1);
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .message.user { 
            background: rgba(79, 195, 247, 0.2); 
            margin-left: 40px; 
            border: 1px solid rgba(79, 195, 247, 0.3);
        }
        
        .message.assistant { 
            background: rgba(76, 175, 80, 0.2); 
            margin-right: 40px; 
            border: 1px solid rgba(76, 175, 80, 0.3);
        }
        
        .input-area { 
            display: flex; 
            gap: 15px; 
            align-items: center;
        }
        
        .message-input {
            flex: 1;
            padding: 15px 20px;
            border: 2px solid rgba(79, 195, 247, 0.3);
            border-radius: 25px;
            background: rgba(255, 255, 255, 0.05);
            color: white;
            font-size: 16px;
            outline: none;
            transition: all 0.3s ease;
        }
        
        .message-input:focus {
            border-color: #4fc3f7;
            box-shadow: 0 0 20px rgba(79, 195, 247, 0.3);
        }
        
        .message-input::placeholder { 
            color: rgba(255, 255, 255, 0.6); 
        }
        
        .btn {
            background: linear-gradient(135deg, #4fc3f7, #29b6f6);
            border: none;
            padding: 15px 25px;
            border-radius: 25px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 5px 20px rgba(79, 195, 247, 0.4);
        }
        
        .btn:disabled { 
            opacity: 0.6; 
            cursor: not-allowed; 
            transform: none;
        }
        
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
            max-width: 800px;
        }
        
        .feature {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
        }
        
        .feature:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.1);
        }
        
        .feature-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .footer {
            margin-top: 50px;
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.6);
        }
        
        @media (max-width: 768px) {
            .logo { font-size: 5rem; }
            .brand { font-size: 2rem; }
            .subtitle { font-size: 1.1rem; }
            .message.user { margin-left: 20px; }
            .message.assistant { margin-right: 20px; }
            .input-area { flex-direction: column; }
            .btn { width: 100%; }
        }
    </style>
</head>
<body>
    <div class="logo">V</div>
    
    <div class="brand">TPS</div>
    
    <div class="subtitle">Travel Professional System</div>
    
    <div class="description">
        Sistema profissional de viagens com Inteligência Artificial.<br>
        Onde a tecnologia encontra sua alma viajante.
    </div>

    <div class="feature-grid">
        <div class="feature">
            <div class="feature-icon">🤖</div>
            <h3>IA Especializada</h3>
            <p>Consultoria de viagem com LLaMA AI</p>
        </div>
        <div class="feature">
            <div class="feature-icon">✈️</div>
            <h3>Parceiros Premium</h3>
            <p>Trip.com, Booking, Kiwi, Tiqets</p>
        </div>
        <div class="feature">
            <div class="feature-icon">🌍</div>
            <h3>Global</h3>
            <p>Destinos em todo o mundo</p>
        </div>
        <div class="feature">
            <div class="feature-icon">💎</div>
            <h3>Profissional</h3>
            <p>Experiências transformadoras</p>
        </div>
    </div>

    <div class="chat-container">
        <div class="chat-area" id="chatArea">
            <div class="message assistant">
                <strong>🤖 TPS AI:</strong><br>
                Olá! Sou seu especialista em viagens com IA. Para onde você gostaria de viajar? ✈️
            </div>
        </div>

        <div class="input-area">
            <input type="text" class="message-input" id="messageInput" 
                   placeholder="Digite sua pergunta sobre viagens...">
            <button class="btn" id="sendButton" onclick="sendMessage()">
                📤 Enviar
            </button>
        </div>
    </div>
    
    <div class="footer">
        Powered by Canal Vivo • LLaMA AI • Railway
    </div>

    <script>
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message) return;

            addMessage(message, true);
            input.value = '';
            
            const sendButton = document.getElementById('sendButton');
            sendButton.disabled = true;
            sendButton.textContent = '⏳ Processando...';

            try {
                const response = await fetch('/gpt-tps', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });

                const data = await response.json();
                
                if (data.success) {
                    addMessage(data.content, false);
                } else {
                    addMessage('❗ ' + (data.error || 'Erro desconhecido'), false);
                }

            } catch (error) {
                console.error('Erro:', error);
                addMessage('❗ Erro de conexão. Tente novamente.', false);
            }

            sendButton.disabled = false;
            sendButton.textContent = '📤 Enviar';
        }

        function addMessage(text, isUser) {
            const chatArea = document.getElementById('chatArea');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${isUser ? 'user' : 'assistant'}\`;
            
            const prefix = isUser ? '👤 Você:' : '🤖 TPS AI:';
            messageDiv.innerHTML = \`<strong>\${prefix}</strong><br>\${text.replace(/\\n/g, '<br>')}\`;
            
            chatArea.appendChild(messageDiv);
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        console.log('🚀 TPS com design Canal Vivo carregado!');
    </script>
</body>
</html>
  `);
});

// ✅ STATUS E HEALTH CHECK
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'TPS Railway simples funcionando',
    timestamp: new Date().toISOString(),
    version: '7.0.0-simple',
    features: {
      firebase_auth: false,
      openrouter_ai: !!process.env.OPENROUTER_API_KEY,
      payment_system: false,
      affiliate_links: Object.keys(affiliateLinks).length
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openrouter: !!process.env.OPENROUTER_API_KEY
  });
});

// ✅ ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// ✅ INICIALIZAÇÃO
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TPS Simples v7.0 ativo na porta ${PORT}`);
  console.log(`🤖 OpenRouter: ${process.env.OPENROUTER_API_KEY ? '✅' : '❌'}`);
  console.log(`💰 ${Object.keys(affiliateLinks).length} parceiros ativos`);
  console.log(`🌐 Acesso: https://app.canalvivo.org`);
});

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