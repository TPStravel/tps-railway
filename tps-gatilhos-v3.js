
// 🌍 Gatilhos Inteligentes V3 – Multilíngue (12 idiomas)

function traduzirFraseDestino(cidade) {
  const lang = new URLSearchParams(window.location.search).get('lang') || 'pt';
  switch (lang) {
    case 'en': return `I want to plan a trip to ${cidade}`;
    case 'pt': return `Quero planejar uma viagem para ${cidade}`;
    case 'es': return `Quiero planear un viaje a ${cidade}`;
    case 'fr': return `Je veux planifier un voyage à ${cidade}`;
    case 'de': return `Ich möchte eine Reise nach planen ${cidade}`;
    case 'it': return `Voglio pianificare un viaggio a ${cidade}`;
    case 'ko': return `나는 여행을 계획하고 싶어요 ${cidade}`;
    case 'ja': return `私は旅行を計画したいです ${cidade}`;
    case 'zh': return `我想计划一次去 ${cidade}`;
    case 'ru': return `Я хочу спланировать поездку в ${cidade}`;
    case 'ar': return `أريد التخطيط لرحلة إلى ${cidade}`;
    case 'hi': return `मैं वहां की यात्रा की योजना बनाना चाहता हूँ ${cidade}`;
    default: return `Quero planejar uma viagem para ${cidade}`;
  }
}


function dispararPerguntaAutomatica(texto) {
  const input = document.getElementById("messageInput");
  if (input) {
    input.value = texto;
    sendMessage(); // usa a função principal já existente
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Cidades dinâmicas com data-cidade
  const botoesCidade = document.querySelectorAll(".botao-cidade");
  botoesCidade.forEach((botao) => {
    const cidade = botao.getAttribute("data-cidade");
    if (cidade) {
      botao.addEventListener("click", () =>
        dispararPerguntaAutomatica(traduzirFraseDestino(cidade))
      );
    }
  });

  // Botões temáticos fixos
  const botoesFixos = {
    "botao-voos": "Quero ver opções de voos",
    "botao-abrigo": "Quero sugestões de hospedagem com bom custo-benefício",
    "botao-protecao": "Quero incluir seguro viagem internacional",
    "botao-caminhos": "Estou buscando um destino com propósito, talvez emocional"
  };

  for (const [id, texto] of Object.entries(botoesFixos)) {
    const botao = document.getElementById(id);
    if (botao) {
      botao.addEventListener("click", () => dispararPerguntaAutomatica(texto));
    }
  }
});
