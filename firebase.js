// firebase.js

// Importa os módulos necessários do Firebase (versão CDN compatível)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Configuração oficial do Firebase para seu app "ChatCanalVivo"
const firebaseConfig = {
  apiKey: "AIzaSyC2U94OzZW5seqBlqs88cs7rgSmzBEAnjQ",
  authDomain: "canal-vivo-chat.firebaseapp.com",
  projectId: "canal-vivo-chat",
  storageBucket: "canal-vivo-chat.appspot.com",
  messagingSenderId: "975226660544",
  appId: "1:975226660544:web:56b55bb3e2a58be035ef25",
  measurementId: "G-SCFHQFGYHQ"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os módulos necessários para uso no restante do projeto
export const db = getFirestore(app);
export const auth = getAuth(app);
