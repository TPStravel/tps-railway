// firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Configuração do seu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBCZ0yjh9F7xLkn_VFb0c135sPaacpZJjU",
  authDomain: "canal-vivo-4cd4a.firebaseapp.com",
  projectId: "canal-vivo-4cd4a",
  storageBucket: "canal-vivo-4cd4a.appspot.com",
  messagingSenderId: "1083445191655",
  appId: "1:1083445191655:web:c6c7915b0f2979c1e0af34z"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Detecta idioma na URL
const lang = new URLSearchParams(window.location.search).get("lang") || "pt";

// Salva no Firestore
try {
  await addDoc(collection(db, "acessos_pagina4"), {
    lang: lang,
    timestamp: serverTimestamp()
  });
  console.log("Acesso registrado com sucesso no Firestore.");
} catch (e) {
  console.error("Erro ao registrar acesso:", e);
}
