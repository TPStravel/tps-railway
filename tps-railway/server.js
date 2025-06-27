// server.js - TPS Completo: Firebase + Login + Pagamento + LLaMA AI
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ CONFIGURAR FIREBASE ADMIN
if (!admin.apps.length) {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID
    });

    console.log("🔥 Firebase Admin inicializado");
  } catch (error) {
    console.error("❌ Erro Firebase:", error.message);
  }
}

const db = admin.firestore();
const auth = admin.auth();

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

// ✅ FUNÇÕES FIREBASE
async function verifyUserToken(token) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("❌ Token inválido:", error.message);
    return null;
  }
}

async function checkUserPayment(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      // Criar usuário se não existir
      await db.collection('users').doc(userId).set({
        createdAt: new Date(),
        plan: 'free',
        usageCount: 0,
        maxUsage: 5, // 5 usos grátis
        active: true
      });
      return { plan: 'free', usageCount: 0, maxUsage: 5, active: true };
    }
    return userDoc.data();
  } catch (error) {
    console.error("❌ Erro verificar pagamento:", error);
    return null;
  }
}

async function logGPTUsage(userId, prompt, response, model) {
  try {
    // Log da conversa
    await db.collection("gpt_logs").add({
      userId,
      prompt: prompt.substring(0, 200), // Primeiros 200 chars
      response: response.substring(0, 200),
      model,
      timestamp: new Date(),
      tokens: Math.ceil((prompt.length + response.length) / 4)
    });

    // Atualizar contador do usuário
    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      usageCount: admin.firestore.FieldValue.increment(1),
      lastUsed: new Date()
    });

    console.log(`📊 Log salvo para usuário: ${userId}`);
  } catch (error) {
    console.error("❌ Erro salvar log:", error);
  }
}

// ✅ SISTEMA DE PAGAMENTO/AUTENTICAÇÃO
app.post("/auth/verify", async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: "Token necessário" });
    }

    const user = await verifyUserToken(token);
    if (!user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const paymentStatus = await checkUserPayment(user.uid);
    
    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        plan: paymentStatus?.plan || 'free',
        usageCount: paymentStatus?.usageCount || 0,
        maxUsage: paymentStatus?.maxUsage || 5,
        active: paymentStatus?.active || true
      }
    });

  } catch (error) {
    console.error("❌ Erro verificação:", error);
    res.status(500).json({ error: "Erro interno" });
  }
});

// ✅ ENDPOINT GPT COM AUTENTICAÇÃO
app.post("/gpt-tps", async (req, res) => {
  try {
    const { message, token } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Mensagem necessária" });
    }

    // Verificar token se fornecido
    let userId = 'anonymous';
    let userPlan = 'free';
    let canUse = true;

    if (token) {
      const user = await verifyUserToken(token);
      if (user) {
        userId = user.uid;
        const paymentStatus = await checkUserPayment(userId);
        
        if (paymentStatus) {
          userPlan = paymentStatus.plan;
          
          // Verificar limites
          if (paymentStatus.plan === 'free' && paymentStatus.usageCount >= paymentStatus.maxUsage) {
            canUse = false;
          }
        }
      }
    }

    if (!canUse) {
      return res.status(402).json({ 
        error: "Limite de uso atingido. Faça upgrade para continuar.",
        needsPayment: true
      });
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
    
    // Log apenas se usuário autenticado
    if (token && userId !== 'anonymous') {
      await logGPTUsage(userId, message, reply, "llama-3.2-70b");
    }
    
    console.log(`🤖 Resposta gerada para: ${userId} (${userPlan})`);
    
    res.json({ 
      success: true,
      content: reply,
      model: "llama-3.2-70b",
      timestamp: new Date().toISOString(),
      userPlan
    });

  } catch (error) {
    console.error("❌ Erro GPT:", error);
    res.status(500).json({ 
      error: "Erro interno do servidor",
      fallback: "Desculpe, tivemos um problema. Tente novamente em alguns segundos."
    });
  }
});

// ✅ UPGRADE DE PLANO
app.post("/payment/upgrade", async (req, res) => {
  try {
    const { token, plan } = req.body;
    
    const user = await verifyUserToken(token);
    if (!user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const plans = {
      'basic': { maxUsage: 100, price: 'R$ 29/mês' },
      'pro': { maxUsage: 500, price: 'R$ 79/mês' },
      'unlimited': { maxUsage: 999999, price: 'R$ 199/mês' }
    };

    if (!plans[plan]) {
      return res.status(400).json({ error: "Plano inválido" });
    }

    // Atualizar usuário
    await db.collection('users').doc(user.uid).update({
      plan: plan,
      maxUsage: plans[plan].maxUsage,
      upgradedAt: new Date(),
      active: true
    });

    res.json({
      success: true,
      message: `Upgrade para ${plan} realizado com sucesso!`,
      newPlan: plan,
      maxUsage: plans[plan].maxUsage
    });

  } catch (error) {
    console.error("❌ Erro upgrade:", error);
    res.status(500).json({ error: "Erro no upgrade" });
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

// ✅ PÁGINA PRINCIPAL COM LOGIN
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <title>TPS - Travel Professional System</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-auth-compat.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh; 
            color: white;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 3rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
        .auth-container { 
            background: rgba(255, 255, 255, 0.1); 
            border-radius: 20px; 
            padding: 25px; 
            margin-bottom: 30px; 
            backdrop-filter: blur(10px);
        }
        .chat-container {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 25px;
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
            display: none;
        }
        .chat-area {
            min-height: 400px;
            max-height: 500px;
            overflow-y: auto;
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }
        .message {
            background: rgba(255, 255, 255, 0.1);
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 12px;
        }
        .message.user { background: rgba(0, 123, 255, 0.3); margin-left: 40px; }
        .message.assistant { background: rgba(40, 167, 69, 0.3); margin-right: 40px; }
        .input-area { display: flex; gap: 10px; }
        .message-input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 16px;
        }
        .message-input::placeholder { color: rgba(255, 255, 255, 0.7); }
        .btn {
            background: linear-gradient(135deg, #28a745, #20c997);
            border: none;
            padding: 12px 20px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            margin: 5px;
        }
        .btn:hover { transform: translateY(-2px); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .user-info {
            background: rgba(0, 255, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            border: 1px solid #00ff00;
        }
        .hidden { display: none; }
        @media (max-width: 768px) {
            .message.user { margin-left: 20px; }
            .message.assistant { margin-right: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧭 TPS</h1>
            <h2>Travel Professional System</h2>
            <p>Sistema Profissional de Viagens com IA</p>
        </div>

        <div id="authContainer" class="auth-container">
            <h3>🔐 Login Necessário</h3>
            <p>Faça login para usar o sistema TPS com IA.</p>
            <button class="btn" onclick="loginWithGoogle()">🚀 Login com Google</button>
            <p style="margin-top: 15px; font-size: 0.9rem;">
                ✅ 5 consultas grátis<br>
                💎 Planos pagos disponíveis
            </p>
        </div>

        <div id="userInfo" class="user-info hidden">
            <div id="userDetails"></div>
            <button class="btn" onclick="logout()">🚪 Logout</button>
        </div>

        <div id="chatContainer" class="chat-container">
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
    </div>

    <script>
        // Configuração Firebase
        const firebaseConfig = {
            apiKey: "your-api-key",
            authDomain: "canal-vivo-chat.firebaseapp.com",
            projectId: "canal-vivo-chat"
        };
        
        firebase.initializeApp(firebaseConfig);
        
        let currentUser = null;
        let userToken = null;

        // Verificar estado de autenticação
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                currentUser = user;
                userToken = await user.getIdToken();
                await verifyUser();
                showChat();
            } else {
                showAuth();
            }
        });

        async function loginWithGoogle() {
            try {
                const provider = new firebase.auth.GoogleAuthProvider();
                await firebase.auth().signInWithPopup(provider);
            } catch (error) {
                console.error('Erro login:', error);
                alert('Erro no login: ' + error.message);
            }
        }

        async function logout() {
            await firebase.auth().signOut();
            showAuth();
        }

        async function verifyUser() {
            try {
                const response = await fetch('/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: userToken })
                });

                const data = await response.json();
                
                if (data.success) {
                    document.getElementById('userDetails').innerHTML = \`
                        <strong>👤 \${data.user.email}</strong><br>
                        📊 Plano: \${data.user.plan.toUpperCase()}<br>
                        💬 Uso: \${data.user.usageCount}/\${data.user.maxUsage}
                    \`;
                }
            } catch (error) {
                console.error('Erro verificação:', error);
            }
        }

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
                    body: JSON.stringify({ 
                        message, 
                        token: userToken 
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    addMessage(data.content, false);
                    await verifyUser(); // Atualizar contador
                } else if (data.needsPayment) {
                    addMessage('❗ ' + data.error + '\\n\\n💎 Faça upgrade do seu plano para continuar!', false);
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

        function showAuth() {
            document.getElementById('authContainer').style.display = 'block';
            document.getElementById('userInfo').classList.add('hidden');
            document.getElementById('chatContainer').style.display = 'none';
        }

        function showChat() {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('userInfo').classList.remove('hidden');
            document.getElementById('chatContainer').style.display = 'block';
        }

        document.getElementById('messageInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        console.log('🚀 TPS com Firebase Auth carregado!');
    </script>
</body>
</html>
  `);
});

// ✅ STATUS E HEALTH CHECK
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    message: 'TPS Railway com Firebase funcionando',
    timestamp: new Date().toISOString(),
    version: '6.0.0-firebase',
    features: {
      firebase_auth: !!admin.apps.length,
      openrouter_ai: !!process.env.OPENROUTER_API_KEY,
      payment_system: true,
      affiliate_links: Object.keys(affiliateLinks).length
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    firebase: !!admin.apps.length,
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
  console.log(`🚀 TPS Firebase v6.0 ativo na porta ${PORT}`);
  console.log(`🔥 Firebase: ${admin.apps.length > 0 ? '✅' : '❌'}`);
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