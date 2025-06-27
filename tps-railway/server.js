// server.js - TPS Completo com LLaMA API (OpenRouter)
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Affiliate Links
const affiliateLinks = {
  'trip-flights': 'https://tp.media/r?marker=639764&trs=425649&p=8626&u=https%3A%2F%2Ftrip.com&campaign_id=121',
  'trip-hotels': 'https://tp.media/r?marker=639764&trs=425649&p=8626&u=https%3A%2F%2Ftrip.com&campaign_id=121',
  'kiwi': 'https://tp.media/click?shmarker=639764&promo_id=3413&source_type=link&type=click&campaign_id=111&trs=425649',
  'kiwi-nomad': 'https://tp.media/click?shmarker=639764&promo_id=4327&source_type=link&type=click&campaign_id=111&trs=425649',
  'localrent': 'https://tp.media/r?marker=639764&trs=425649&p=2043&u=https%3A%2F%2Flocalrent.com%2Fen&campaign_id=87',
  'tiqets': 'https://tp.media/r?marker=639764&trs=425649&p=2074&u=https%3A%2F%2Ftiqets.com&campaign_id=89',
  'pickups': 'https://tp.media/r?marker=639764&trs=425649&p=8919&u=https%3A%2F%2Fwelcomepickups.com&campaign_id=627',
  'kiwitaxi': 'https://tp.media/r?marker=639764&trs=425649&p=647&u=https%3A%2F%2Fkiwitaxi.com&campaign_id=1',
  'ekta-insurance': 'https://tp.media/r?marker=639764&trs=425649&p=5869&u=https%3A%2F%2Fektatraveling.com&campaign_id=225',
  'aviasales': 'https://tp.media/r?marker=639764&trs=425649&p=4114&u=https%3A%2F%2Faviasales.com&campaign_id=100',
  'compensair': 'https://tp.media/r?marker=639764&trs=425649&p=4129&u=https%3A%2F%2Fcompensair.com&campaign_id=86',
  'wayaway': 'https://tp.media/r?marker=639764&trs=425649&p=5976&u=https%3A%2F%2Fwayaway.io&campaign_id=200',
  'hotellook': 'https://tp.media/r?marker=639764&trs=425649&p=4115&u=https%3A%2F%2Fhotellook.com&campaign_id=101',
  'wegotrip': 'https://tp.media/r?marker=639764&trs=425649&p=4487&u=https%3A%2F%2Fwegotrip.com&campaign_id=150',
  'booking': 'https://www.awin1.com/cread.php?awinmid=18119&awinaffid=1949091&ued=https%3A%2F%2Fwww.booking.com%2Findex.html',
  'travel-insurance': 'https://www.awin1.com/cread.php?awinmid=80595&awinaffid=1949091&ued=https%3A%2F%2Fquote.compareyourtravelinsurance.co.uk%2F',
  'explorer-insurance': 'https://www.awin1.com/cread.php?awinmid=16057&awinaffid=1949091&ued=https%3A%2F%2Fwww.explorerinsurance.co.uk%2F',
  'tiqets-nl': 'https://www.awin1.com/cread.php?awinmid=8111&awinaffid=1949091&ued=https%3A%2F%2Fwww.tiqets.com%2Fnl%2F',
  'tiqets-de': 'https://www.awin1.com/cread.php?awinmid=8616&awinaffid=1949091&ued=https%3A%2F%2Fwww.tiqets.com%2Fnl%2F',
  'tiqets-es': 'https://www.awin1.com/cread.php?awinmid=12426&awinaffid=1949091&ued=https%3A%2F%2Fwww.tiqets.com%2Fnl%2F',
  'tiqets-fr': 'https://www.awin1.com/cread.php?awinmid=7437&awinaffid=1949091&ued=https%3A%2F%2Fwww.tiqets.com%2Fnl%2F',
  'traveltime-insurance': 'https://www.awin1.com/cread.php?awinmid=16062&awinaffid=1949091&ued=https%3A%2F%2Fwww.traveltimeinsurance.co.uk%2F'
};

// 🤖 API LLaMA com OpenRouter
app.post("/gpt-tps", async (req, res) => {
  const userMessage = req.body.message;
  const userLang = req.body.lang || 'pt';

  if (!userMessage) {
    return res.status(400).json({ error: "Mensagem não fornecida" });
  }

  try {
    // Prompt específico para viagens em múltiplos idiomas
    const systemPrompt = getSystemPrompt(userLang);
    const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

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
            content: systemPrompt
          },
          {
            role: "user", 
            content: userMessage
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.error("OpenRouter Error:", data.error);
      return res.status(500).json({ 
        error: "Erro na API OpenRouter",
        details: data.error.message 
      });
    }

    const reply = data.choices?.[0]?.message?.content || "❗ Resposta vazia da IA.";
    
    // Log para analytics
    console.log(`🤖 LLaMA Response [${userLang}]:`, reply.substring(0, 100) + "...");
    
    res.json({ 
      content: reply,
      language: userLang,
      model: "llama-3.2-70b",
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("❌ Erro LLaMA API:", err);
    res.status(500).json({ 
      error: "Erro ao se comunicar com a IA",
      fallback: getFallbackResponse(userMessage, userLang)
    });
  }
});

// Função para prompts do sistema por idioma
function getSystemPrompt(lang) {
  const prompts = {
    pt: `Você é um especialista em viagens do TPS (Travel Professional System). 

INSTRUÇÕES:
- Responda SEMPRE em português brasileiro
- Seja especialista, mas amigável e conversacional
- Inclua emojis relevantes 
- Faça sugestões práticas de destinos, hotéis, atividades
- Quando apropriado, sugira usar nossos parceiros: Trip.com, Booking.com, Kiwi, Tiqets, etc.
- Mantenha respostas entre 100-300 palavras
- Foque em experiências transformadoras de viagem
- Se o usuário mencionar cidade específica, dê dicas locais detalhadas`,

    en: `You are a travel expert from TPS (Travel Professional System).

INSTRUCTIONS:
- Always respond in English
- Be expert but friendly and conversational  
- Include relevant emojis
- Make practical suggestions for destinations, hotels, activities
- When appropriate, suggest using our partners: Trip.com, Booking.com, Kiwi, Tiqets, etc.
- Keep responses between 100-300 words
- Focus on transformative travel experiences
- If user mentions specific city, give detailed local tips`,

    es: `Eres un experto en viajes de TPS (Travel Professional System).

INSTRUCCIONES:
- Responde SIEMPRE en español
- Sé experto pero amigable y conversacional
- Incluye emojis relevantes
- Haz sugerencias prácticas de destinos, hoteles, actividades  
- Cuando sea apropiado, sugiere usar nuestros socios: Trip.com, Booking.com, Kiwi, Tiqets, etc.
- Mantén respuestas entre 100-300 palabras
- Enfócate en experiencias transformadoras de viaje
- Si el usuario menciona ciudad específica, da consejos locales detallados`
  };

  return prompts[lang] || prompts['pt'];
}

// Respostas de fallback por idioma
function getFallbackResponse(message, lang) {
  const fallbacks = {
    pt: "🌍 Que destino interessante! Como especialista em viagens, posso ajudar você a planejar uma experiência incrível. Conte-me mais sobre o que procura!",
    en: "🌍 What an interesting destination! As a travel expert, I can help you plan an incredible experience. Tell me more about what you're looking for!",
    es: "🌍 ¡Qué destino tan interesante! Como experto en viajes, puedo ayudarte a planear una experiencia increíble. ¡Cuéntame más sobre lo que buscas!"
  };
  
  return fallbacks[lang] || fallbacks['pt'];
}

// Página principal com chat integrado
app.get('/', (req, res) => {
  const lang = req.query.lang || 'pt';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="${lang}">
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh; 
                color: white;
                overflow-x: hidden;
            }
            
            .container { 
                max-width: 1400px; 
                margin: 0 auto; 
                padding: 20px; 
            }
            
            .header { 
                text-align: center; 
                margin-bottom: 40px; 
                padding: 30px 0;
            }
            
            .header h1 { 
                font-size: 3.5rem; 
                margin-bottom: 15px; 
                text-shadow: 3px 3px 6px rgba(0,0,0,0.4);
                background: linear-gradient(45deg, #fff, #00ff88);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .language-selector {
                margin: 20px 0;
                text-align: center;
            }
            
            .lang-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 8px 16px;
                margin: 0 5px;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 0.9rem;
            }
            
            .lang-btn:hover {
                background: rgba(0, 255, 136, 0.3);
                border-color: #00ff88;
            }
            
            .lang-btn.active {
                background: #00ff88;
                color: #000;
            }
            
            .status { 
                background: rgba(0, 255, 0, 0.2); 
                padding: 25px; 
                border-radius: 20px; 
                margin-bottom: 40px; 
                text-align: center; 
                border: 2px solid #00ff00;
                backdrop-filter: blur(10px);
            }
            
            .chat-container {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 25px;
                padding: 30px;
                margin-bottom: 40px;
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            
            .chat-area {
                min-height: 400px;
                max-height: 600px;
                overflow-y: auto;
                margin-bottom: 20px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 15px;
                scrollbar-width: thin;
                scrollbar-color: #00ff88 transparent;
            }
            
            .message {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px 20px;
                border-radius: 15px;
                margin-bottom: 15px;
                animation: slideIn 0.3s ease;
                line-height: 1.5;
            }
            
            .message.user {
                background: rgba(0, 123, 255, 0.3);
                margin-left: 50px;
                border-left: 4px solid #007bff;
            }
            
            .message.assistant {
                background: rgba(40, 167, 69, 0.3);
                margin-right: 50px;
                border-left: 4px solid #28a745;
            }
            
            .typing {
                background: rgba(255, 193, 7, 0.3);
                margin-right: 50px;
                border-left: 4px solid #ffc107;
                animation: pulse 1.5s infinite;
            }
            
            .input-area {
                display: flex;
                gap: 15px;
                align-items: center;
            }
            
            .message-input {
                flex: 1;
                padding: 15px 20px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 25px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 16px;
                backdrop-filter: blur(10px);
            }
            
            .message-input::placeholder {
                color: rgba(255, 255, 255, 0.7);
            }
            
            .send-button {
                background: linear-gradient(135deg, #28a745, #20c997);
                border: none;
                padding: 15px 25px;
                border-radius: 25px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 16px;
                min-width: 120px;
            }
            
            .send-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 25px rgba(40, 167, 69, 0.4);
            }
            
            .send-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            .quick-actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin: 30px 0;
            }
            
            .quick-btn {
                background: rgba(255, 255, 255, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 15px 20px;
                border-radius: 15px;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
                font-size: 0.9rem;
            }
            
            .quick-btn:hover {
                background: rgba(0, 255, 136, 0.3);
                border-color: #00ff88;
                transform: translateY(-2px);
            }
            
            .services { 
                display: grid; 
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
                gap: 25px; 
                margin-top: 40px; 
            }
            
            .service-card { 
                background: rgba(255, 255, 255, 0.1); 
                padding: 30px; 
                border-radius: 20px; 
                text-align: center; 
                cursor: pointer; 
                transition: all 0.4s ease; 
                border: 2px solid transparent;
                backdrop-filter: blur(10px);
                position: relative;
                overflow: hidden;
            }
            
            .service-card:hover { 
                transform: translateY(-10px) scale(1.02);
                border-color: #00ff88; 
                box-shadow: 0 20px 60px rgba(0, 255, 136, 0.3);
            }
            
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 0.8; }
                50% { opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .header h1 {
                    font-size: 2.5rem;
                }
                
                .message.user {
                    margin-left: 20px;
                }
                
                .message.assistant {
                    margin-right: 20px;
                }
                
                .services {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🧭 TPS</h1>
                <h2>Travel Professional System</h2>
                <p>Powered by LLaMA AI • 12 Languages • 19 Travel Partners</p>
                
                <div class="language-selector">
                    <button class="lang-btn ${lang === 'pt' ? 'active' : ''}" onclick="changeLanguage('pt')">🇧🇷 PT</button>
                    <button class="lang-btn ${lang === 'en' ? 'active' : ''}" onclick="changeLanguage('en')">🇺🇸 EN</button>
                    <button class="lang-btn ${lang === 'es' ? 'active' : ''}" onclick="changeLanguage('es')">🇪🇸 ES</button>
                    <button class="lang-btn ${lang === 'fr' ? 'active' : ''}" onclick="changeLanguage('fr')">🇫🇷 FR</button>
                    <button class="lang-btn ${lang === 'de' ? 'active' : ''}" onclick="changeLanguage('de')">🇩🇪 DE</button>
                    <button class="lang-btn ${lang === 'it' ? 'active' : ''}" onclick="changeLanguage('it')">🇮🇹 IT</button>
                </div>
            </div>

            <div class="status">
                <h3>✅ Sistema Online • LLaMA AI Ativa • 19 Parceiros</h3>
                <p>Servidor: Railway | Porto: ${PORT} | ${new Date().toLocaleString('pt-BR')}</p>
                <p><strong>🤖 IA Conversacional</strong> | <strong>🌍 Multilíngue</strong> | <strong>💰 Comissões Ativas</strong></p>
            </div>

            <div class="chat-container">
                <div class="chat-area" id="chatArea">
                    <div class="message assistant">
                        <strong>🤖 TPS AI Assistant:</strong><br>
                        Olá! Sou seu especialista em viagens com IA. Para onde você gostaria de viajar?
                    </div>
                </div>

                <div class="quick-actions">
                    <button class="quick-btn" onclick="sendQuickMessage('Quero viajar para Paris')">🗼 Paris</button>
                    <button class="quick-btn" onclick="sendQuickMessage('Planejando viagem para Tóquio')">🗾 Tóquio</button>
                    <button class="quick-btn" onclick="sendQuickMessage('Destino romântico para lua de mel')">💕 Romântico</button>
                    <button class="quick-btn" onclick="sendQuickMessage('Viagem de aventura')">🏔️ Aventura</button>
                    <button class="quick-btn" onclick="sendQuickMessage('Preciso de seguro viagem')">🛡️ Seguro</button>
                    <button class="quick-btn" onclick="sendQuickMessage('Hotéis baratos')">🏨 Hotéis</button>
                </div>

                <div class="input-area">
                    <input type="text" class="message-input" id="messageInput" 
                           placeholder="Digite sua pergunta sobre viagens...">
                    <button class="send-button" id="sendButton" onclick="sendMessage()">
                        📤 Enviar
                    </button>
                </div>
            </div>

            <div class="services">
                <div class="service-card" onclick="window.open('/redirect/trip-flights', '_blank')">
                    <h3>✈️ Passagens Aéreas</h3>
                    <p>Compare preços e encontre as melhores ofertas de voos</p>
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">Trip.com • Kiwi • Aviasales</div>
                </div>

                <div class="service-card" onclick="window.open('/redirect/booking', '_blank')">
                    <h3>🏨 Hotéis & Hospedagem</h3>
                    <p>Reserve acomodações em qualquer lugar do mundo</p>
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">Booking.com • Hotellook</div>
                </div>

                <div class="service-card" onclick="window.open('/redirect/tiqets', '_blank')">
                    <h3>🎫 Atrações & Experiências</h3>
                    <p>Ingressos para museus, tours e atrações</p>
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">Tiqets • WeGoTrip</div>
                </div>

                <div class="service-card" onclick="window.open('/redirect/ekta-insurance', '_blank')">
                    <h3>🛡️ Seguro Viagem</h3>
                    <p>Proteção completa para suas viagens</p>
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">EKTA • Explorer</div>
                </div>

                <div class="service-card" onclick="window.open('/redirect/localrent', '_blank')">
                    <h3>🚗 Aluguel & Transporte</h3>
                    <p>Carros, transfers e transporte local</p>
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">Localrent • Kiwitaxi</div>
                </div>

                <div class="service-card" onclick="window.open('/redirect/compensair', '_blank')">
                    <h3>💰 Cashback & Compensação</h3>
                    <p>Reembolsos por voos atrasados e cashback</p>
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 10px;">Compensair • WayAway</div>
                </div>
            </div>
        </div>

        <script>
            const currentLang = new URLSearchParams(window.location.search).get('lang') || 'pt';
            let isTyping = false;

            // Função principal para enviar mensagens
            async function sendMessage() {
                const input = document.getElementById('messageInput');
                const message = input.value.trim();
                
                if (!message || isTyping) return;

                addMessage(message, true);
                input.value = '';
                
                // Desabilitar botão durante processamento
                const sendButton = document.getElementById('sendButton');
                sendButton.disabled = true;
                sendButton.textContent = '⏳ Processando...';
                
                // Mostrar indicador de digitação
                showTypingIndicator();

                try {
                    const response = await fetch('/gpt-tps', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            message: message,
                            lang: currentLang
                        })
                    });

                    const data = await response.json();
                    
                    hideTypingIndicator();
                    
                    if (data.error) {
                        addMessage('❗ ' + data.error + (data.fallback ? '\\n\\n' + data.fallback : ''), false);
                    } else {
                        addMessage(data.content, false);
                    }

                } catch (error) {
                    hideTypingIndicator();
                    console.error('Erro:', error);
                    addMessage('❗ Erro de conexão. Tente novamente em alguns segundos.', false);
                }

                // Reabilitar botão
                sendButton.disabled = false;
                sendButton.textContent = '📤 Enviar';
            }

            // Adicionar mensagens ao chat
            function addMessage(text, isUser) {
                const chatArea = document.getElementById('chatArea');
                const messageDiv = document.createElement('div');
                messageDiv.className = \`message \${isUser ? 'user' : 'assistant'}\`;
                
                const prefix = isUser ? '👤 Você:' : '🤖 TPS AI:';
                messageDiv.innerHTML = \`<strong>\${prefix}</strong><br>\${text.replace(/\\n/g, '<br>')}\`;
                
                chatArea.appendChild(messageDiv);
                chatArea.scrollTop = chatArea.scrollHeight;
            }

            // Indicador de digitação
            function showTypingIndicator() {
                const chatArea = document.getElementById('chatArea');
                const typingDiv = document.createElement('div');
                typingDiv.className = 'message typing';
                typingDiv.id = 'typingIndicator';
                typingDiv.innerHTML = '<strong>🤖 TPS AI:</strong><br>Pensando... 💭';
                
                chatArea.appendChild(typingDiv);
                chatArea.scrollTop = chatArea.scrollHeight;
                isTyping = true;
            }

            function hideTypingIndicator() {
                const indicator = document.getElementById('typingIndicator');
                if (indicator) {
                    indicator.remove();
                }
                isTyping = false;
            }

            // Mensagens rápidas
            function sendQuickMessage(text) {
                document.getElementById('messageInput').value = text;
                sendMessage();
            }

            // Mudança de idioma
            function changeLanguage(lang) {
                const currentUrl = new URL(window.location);
                currentUrl.searchParams.set('lang', lang);
                window.location.href = currentUrl.toString();
            }

            // Enter para enviar
            document.getElementById('messageInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && !isTyping) {
                    sendMessage();
                }
            });

            console.log('🚀 TPS com LLaMA AI carregado!');
            console.log(\`🌍 Idioma: \${currentLang}\`);
            console.log('🤖 IA LLaMA 3.2-70B ativa');
            console.log('💰 19 parceiros integrados');
        </script>
    </body>
    </html>
  `);
});

// API de redirecionamento
app.get('/redirect/:partner', (req, res) => {
  const { partner } = req.params;
  const targetUrl = affiliateLinks[partner];
  
  if (!targetUrl) {
    return res.status(404).json({ 
      error: 'Parceiro não encontrado',
      available_partners: Object.keys(affiliateLinks)
    });
  }

  // Log de clique
  console.log('🔗 Redirecionamento:', {
    partner,
    timestamp: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  });

  res.redirect(302, targetUrl);
});

// API de status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'TPS com LLaMA AI funcionando perfeitamente',
    timestamp: new Date().toISOString(),
    version: '4.0.0-llama',
    features: {
      llama_ai: true,
      openrouter_integration: true,
      multilingual_support: true,
      affiliate_tracking: true,
      partners_active: Object.keys(affiliateLinks).length
    },
    ai_model: 'meta-llama/llama-3.2-70b-instruct:free',
    languages: ['pt', 'en', 'es', 'fr', 'de', 'it'],
    partners: Object.keys(affiliateLinks).length
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime(),
    llama_ai: !!process.env.OPENROUTER_API_KEY,
    partners: Object.keys(affiliateLinks).length,
    timestamp: new Date().toISOString()
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint não encontrado',
    available_endpoints: [
      'GET / - Página principal com chat LLaMA',
      'POST /gpt-tps - API do LLaMA',
      'GET /api/status - Status do sistema',
      'GET /redirect/:partner - Redirecionamento de afiliação',
      'GET /health - Health check'
    ]
  });
});

// Inicialização
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 TPS Server v4.0-llama ativo na porta ${PORT}`);
  console.log(`🤖 LLaMA AI: ${process.env.OPENROUTER_API_KEY ? '✅ Configurado' : '❌ Chave não encontrada'}`);
  console.log(`💰 ${Object.keys(affiliateLinks).length} parceiros ativos`);
  console.log(`🌍 Multilíngue: PT, EN, ES, FR, DE, IT`);
  console.log(`🌐 Acesso: https://app.canalvivo.org`);
  console.log(`📊 Status: https://app.canalvivo.org/api/status`);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Promise rejeitada:', err);
});