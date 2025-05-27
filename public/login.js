// ===== login.js =====

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDReBGhb2gZNv7KA86HJXTeiLimWTrurp8",
  authDomain: "canal-vivo-chat.firebaseapp.com",
  projectId: "canal-vivo-chat"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const userStatus = document.getElementById("user-status");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = loginForm["email"].value;
  const password = loginForm["password"].value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const lang = new URLSearchParams(window.location.search).get("lang") || "pt";

    await setDoc(doc(db, "usuarios", user.uid), {
      email: user.email,
      uid: user.uid,
      idioma: lang,
      dataLogin: serverTimestamp()
    });

    loginForm.reset();

    // Forçar exibição da aba Chat após login
    document.querySelectorAll('.conteudo').forEach(div => div.classList.remove('ativo'));
    document.querySelectorAll('.aba').forEach(btn => btn.classList.remove('ativa'));
    document.getElementById('chat').classList.add('ativo');
    document.querySelector('[onclick*="chat"]').classList.add('ativa');

  } catch (error) {
    alert("Erro ao entrar: " + error.message);
  }
});

logoutBtn.addEventListener("click", () => {
  signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginForm.style.display = "none";
    logoutBtn.style.display = "block";
    userStatus.innerText = `Bem-vindo, ${user.email}`;
  } else {
    loginForm.style.display = "block";
    logoutBtn.style.display = "none";
    userStatus.innerText = "";
  }
});
