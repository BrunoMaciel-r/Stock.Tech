"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const inviteEmail = sessionStorage.getItem('st_inviteEmail');
    if (!inviteEmail) {
        window.location.href = '../login/login.html';
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem('stockTechUsers') || '[]');
    const usuarioIndex = usuarios.findIndex(u => u.email.toLowerCase() === inviteEmail.toLowerCase());
    
    if (usuarioIndex === -1 || usuarios[usuarioIndex].status !== 'pendente') {
        window.location.href = '../login/login.html';
        return;
    }

    const form = document.getElementById('set-senha-form');
    const senhaInput = document.getElementById('senha');
    const confirmarInput = document.getElementById('confirmar-senha');
    const nomeInput = document.getElementById('nome');

    // Toggle senha
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            if (isPassword) {
                btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            } else {
                btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
        });
    });

    // Validar senhas
    function checarSenhasIguais() {
        if (!senhaInput || !confirmarInput) return;
        const msgError = document.getElementById('error-senha-match');
        if (confirmarInput.value.length === 0) {
            msgError.classList.remove('visible');
            return;
        }
        if (senhaInput.value !== confirmarInput.value) {
            msgError.classList.add('visible');
            confirmarInput.classList.add('input-error');
        } else {
            msgError.classList.remove('visible');
            confirmarInput.classList.remove('input-error');
        }
    }

    if (senhaInput) senhaInput.addEventListener('input', checarSenhasIguais);
    if (confirmarInput) confirmarInput.addEventListener('input', checarSenhasIguais);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const senha = senhaInput.value.trim();
        const confirmar = confirmarInput.value.trim();
        const nome = nomeInput.value.trim();
        const errorGlobal = document.getElementById('form-error');

        if (!nome || !senha || !confirmar) {
            errorGlobal.textContent = 'Preencha todos os campos.';
            errorGlobal.classList.add('visible');
            errorGlobal.style.display = 'block';
            return;
        }

        if (senha.length < 4) {
            errorGlobal.textContent = 'A senha deve ter pelo menos 4 caracteres.';
            errorGlobal.classList.add('visible');
            errorGlobal.style.display = 'block';
            return;
        }

        if (senha !== confirmar) {
            return; // msgError already visible
        }

        // Atualizar usuário
        usuarios[usuarioIndex].senha = senha;
        usuarios[usuarioIndex].nome = nome;
        usuarios[usuarioIndex].status = 'ativo';
        localStorage.setItem('stockTechUsers', JSON.stringify(usuarios));

        // Auto-login
        const user = usuarios[usuarioIndex];
        sessionStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem("st_nome", user.nome);
        localStorage.setItem("st_email", user.email);
        localStorage.setItem("st_cargo", user.cargo);
        localStorage.setItem("st_orgId", user.orgId);
        localStorage.setItem("st_plano", user.plano || "basic");
        
        sessionStorage.removeItem('st_inviteEmail');

        // Redirecionamento por cargo
        if (user.cargo === 'Caixa') {
            window.location.href = '../pedidos/pedidos.html';
        } else {
            window.location.href = '../dashboard/dashboard.html';
        }
    });
});
