import React, { useState } from "react";

export default function App() {
  // Definindo a lista de 12 idiomas
  const idiomas = [
    { nome: 'Português', bandeira: '🇧🇷', codigo: 'pt' },
    { nome: 'Inglês', bandeira: '🇬🇧', codigo: 'en' },
    { nome: 'Espanhol', bandeira: '🇪🇸', codigo: 'es' },
    { nome: 'Francês', bandeira: '🇫🇷', codigo: 'fr' },
    { nome: 'Alemão', bandeira: '🇩🇪', codigo: 'de' },
    { nome: 'Italiano', bandeira: '🇮🇹', codigo: 'it' },
    { nome: 'Japonês', bandeira: '🇯🇵', codigo: 'ja' },
    { nome: 'Chinês', bandeira: '🇨🇳', codigo: 'zh' },
    { nome: 'Russo', bandeira: '🇷🇺', codigo: 'ru' },
    { nome: 'Árabe', bandeira: '🇸🇦', codigo: 'ar' },
    { nome: 'Holandês', bandeira: '🇳🇱', codigo: 'nl' },
    { nome: 'Sueco', bandeira: '🇸🇪', codigo: 'sv' },
  ];

  // Estado para idioma selecionado
  const [idiomaSelecionado, setIdiomaSelecionado] = useState('pt');

  // Função para seleção de idioma
  const onSelectIdioma = (codigo) => {
    setIdiomaSelecionado(codigo);
    alert(`Idioma selecionado: ${codigo}`);
    // Aqui você pode adicionar a lógica para carregar o conteúdo do idioma selecionado
  };

  // Verificação de segurança para garantir que a lista de idiomas não esteja vazia
  if (!idiomas || idiomas.length === 0) {
    console.error("A variável 'idiomas' não foi definida corretamente ou está vazia.");
    return <div>Erro: A lista de idiomas não está disponível!</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 space-y-10">
      {/* Logo */}
      <img
        src="/logo-canal-vivo.png"  // Certifique-se de que o logo está no diretório correto
        alt="Canal Vivo"
        className="w-32 sm:w-40 md:w-52 animate-fade-in-up"
      />

      {/* Grade de Idiomas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {idiomas.map((idioma, index) => (
          <button
            key={index}
            className="bg-gray-800 hover:bg-gray-700 p-4 rounded-2xl text-xl flex flex-col items-center justify-center transition"
            onClick={() => onSelectIdioma(idioma.codigo)}
          >
            <span className="text-3xl mb-2">{idioma.bandeira}</span>
            <span>{idioma.nome}</span>
          </button>
        ))}
      </div>

      {/* Rodapé */}
      <footer className="mt-10 text-center text-sm text-gray-500">
        © 2025 Canal Vivo. Todos os direitos reservados.
      </footer>
    </div>
  );
}
