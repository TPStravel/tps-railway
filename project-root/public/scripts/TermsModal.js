// TermsModal.js
document.addEventListener("DOMContentLoaded", function() {
    // Verificar se os termos foram aceitos
    if (localStorage.getItem('termsAccepted') === 'true') {
        return; // Não mostrar o modal se os termos já foram aceitos
    }

    // Criando o modal de termos de uso
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Termos de Uso</h2>
            <p>Aqui estão os termos e condições do nosso site...</p>
            <button id="acceptTerms">Aceitar</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Quando o usuário clicar em "Aceitar"
    const acceptButton = document.getElementById('acceptTerms');
    acceptButton.addEventListener('click', () => {
        modal.style.display = 'none';
        // Salvar a aceitação dos termos no localStorage
        localStorage.setItem('termsAccepted', 'true');
    });
});
