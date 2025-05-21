import React from "react";

export default function Intro() {
  return (
    <div className="relative w-full h-screen">
      {/* Vídeo de fundo */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
      >
        <source src="/bg-mistico.mp4" type="video/mp4" />
      </video>

      {/* Frases sobre o vídeo */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl text-center">
        <p>Sua frase simbólica aqui!</p>
      </div>
    </div>
  );
}
