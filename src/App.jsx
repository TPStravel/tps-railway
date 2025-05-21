export default function App() {
  // Defina a variável idiomas antes de usá-la
  const idiomas = [
    { nome: 'Português', bandeira: '🇧🇷' },
    { nome: 'Inglês', bandeira: '🇬🇧' },
    { nome: 'Espanhol', bandeira: '🇪🇸' },
    // Adicione outros idiomas conforme necessário
  ];

  // Função que será chamada ao selecionar um idioma
  function onSelectIdioma(nome) {
    alert(`Idioma selecionado: ${nome}`);
  }

  // Verificação para garantir que a variável idiomas está definida
  if (!idiomas || idiomas.length === 0) {
    console.error("A variável 'idiomas' não foi definida corretamente ou está vazia.");
    return <div>Erro: A lista de idiomas não está disponível!</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 space-y-10">
      {/* LOGO */}
      <img
        src="/logo-canal-vivo.png"
        alt="Canal Vivo"
        className="w-32 sm:w-40 md:w-52 animate-fade-in-up"
      />

      {/* GRADE DE IDIOMAS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {idiomas.map((idioma, index) => (
          <button
            key={index}
            className="bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl text-xl flex flex-col items-center justify-center transition"
            onClick={() => onSelectIdioma(idioma.nome)}
          >
            <span className="text-3xl mb-2">{idioma.bandeira}</span>
            <span>{idioma.nome}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

