// CookieConsent.js
document.addEventListener("DOMContentLoaded", function() {
    // Verificar se o usuário já deu consentimento
    if (localStorage.getItem('cookieConsent') === 'accepted') {
        return; // Não mostrar o banner se o consentimento foi dado
    }

    // Criando o banner de cookies
    const cookieConsent = document.createElement('div');
    cookieConsent.classList.add('cookie-consent');
    cookieConsent.innerHTML = `
        <p>Este site usa cookies para melhorar a experiência. Ao continuar navegando, você concorda com nossa política de cookies.</p>
        <button id="acceptCookies">Aceitar</button>
    `;
    document.body.appendChild(cookieConsent);

    // Quando o usuário clicar em "Aceitar"
    const acceptCookies = document.getElementById('acceptCookies');
    acceptCookies.addEventListener('click', () => {
        cookieConsent.style.display = 'none';
        // Salvar o consentimento no localStorage
        localStorage.setItem('cookieConsent', 'accepted');
    });
});
