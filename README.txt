CANAL VIVO – ESTRUTURA DE PASTAS E ARQUIVOS
--------------------------------------------

📁 Raiz do Projeto
├── index.html                  → Página principal do portal
├── intro.html                 → Segunda tela de entrada (escolha de mundo)
├── portal4.html               → Tela com os 4 mundos (Temarix, TPS, Bocana, Liminax)
├── temarix-portal.html        → Página simbólica do Temarix
├── tps-portal.html            → Página funcional do TPS
├── bocana-portal.html         → Página aberta do Bocana
├── liminax-portal.html        → Página simbólica de acolhimento (Liminax)
├── (outros arquivos .html conforme expansão)

📁 public/
├── favicon.ico                → Ícone do navegador
├── manifest.json              → Configuração PWA
├── service-worker.js          → PWA offline handler
├── firebase.init.js           → Integração com Firebase
├── Mistic-Video.mp4           → Vídeo de fundo (se utilizado)
├── icon-512.png               → Ícone PWA
├── logo-canal-vivo.png        → Logomarca principal

📁 img/
├── logo.png                   → Imagem usada nos headers ou rodapés

📁 api/                         (somente se usar Node.js ou Vercel)
├── amadeus-flights.js         → Script de busca de voos
├── amadeus-token.js           → Geração de token Amadeus
├── amadeus-proxy.js           → Proxy seguro para chamadas
├── .env.local                 → Configurações sensíveis (NÃO subir para servidor)

📄 vercel.json                 → Configuração de rota/funções para Vercel
