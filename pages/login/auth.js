/**
 * auth.js — Autenticação e Cadastro do Stock.Tech
 * Gerencia login, registro, cargos (Administrador/Caixa/Estoquista) e validação de formulários.
 */

"use strict";

console.log('auth.js carregado');

// ═══════════════════════════════════════════════
//  Funções de Persistência
// ═══════════════════════════════════════════════

function obterUsuarios() {
    return JSON.parse(localStorage.getItem("stockTechUsers") || "[]");
}

function salvarUsuarios(usuarios) {
    localStorage.setItem("stockTechUsers", JSON.stringify(usuarios));
}

// ═══════════════════════════════════════════════
//  Seleção de Plano (global — chamada pelo onclick do HTML)
// ═══════════════════════════════════════════════

window.selecionarPlano = function(plano) {
    document.querySelectorAll('.plan-select-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById('plan-card-' + plano);
    if (card) card.classList.add('selected');
    
    const input = document.getElementById('reg-plano');
    if (input) input.value = plano;

    // Limpar erro do plano
    const errPlano = document.getElementById('error-plano');
    if (errPlano) errPlano.classList.remove('visible');
};

// ═══════════════════════════════════════════════
//  Toggle Mostrar/Ocultar Senha
// ═══════════════════════════════════════════════

function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            if (isPassword) {
                btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
                btn.title = 'Ocultar senha';
            } else {
                btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
                btn.title = 'Mostrar senha';
            }
        });
    });
}

// ═══════════════════════════════════════════════
//  Helpers de Erro
// ═══════════════════════════════════════════════

function mostrarErroGlobal(elementId, mensagem) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = mensagem;
        el.classList.add('visible');
        el.style.display = 'block';
    }
}

function limparErroGlobal(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = '';
        el.classList.remove('visible');
        el.style.display = 'none';
    }
}

function mostrarErroCampo(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.classList.add('visible');
}

function limparErroCampo(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.classList.remove('visible');
}

function marcarCampoErro(input) {
    if (input) input.classList.add('input-error');
}

function limparCampoErro(input) {
    if (input) input.classList.remove('input-error');
}

function logarUsuario(usuario) {
    sessionStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem("st_nome", usuario.nome || "Usuário");
    localStorage.setItem("st_email", usuario.email);
    localStorage.setItem("st_cargo", usuario.cargo);
    localStorage.setItem("st_orgId", usuario.orgId);
    localStorage.setItem("st_plano", usuario.plano || "basic");
    
    // Redirecionamento por cargo
    if (usuario.cargo === 'Caixa') {
        window.location.href = '../pedidos/pedidos.html';
    } else {
        window.location.href = '../dashboard/dashboard.html';
    }
}

// ═══════════════════════════════════════════════
//  Inicialização
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        const cargo = localStorage.getItem('st_cargo');
        if (cargo === 'Caixa') {
            window.location.href = '../pedidos/pedidos.html';
        } else {
            window.location.href = '../dashboard/dashboard.html';
        }
        return;
    }

    setupPasswordToggles();

    // Alternância Login <-> Cadastro
    const linkCadastro = document.getElementById('link-ir-cadastro');
    const linkLogin = document.getElementById('link-ir-login');
    const formLogin = document.getElementById('login-form');
    const formRegister = document.getElementById('register-form');
    const titulo = document.getElementById('login-title');
    const subtitulo = document.getElementById('login-subtitle');

    if (linkCadastro && linkLogin && formLogin && formRegister && titulo) {
        linkCadastro.addEventListener('click', (e) => {
            e.preventDefault();
            formLogin.style.display = 'none';
            formRegister.style.display = 'flex';
            titulo.innerText = 'Criar Conta';
            if (subtitulo) subtitulo.innerText = 'Preencha os dados para começar';
            limparErroGlobal('login-error');
            limparErroGlobal('register-error');
        });

        linkLogin.addEventListener('click', (e) => {
            e.preventDefault();
            formRegister.style.display = 'none';
            formLogin.style.display = 'block';
            titulo.innerText = 'Acessar Painel';
            if (subtitulo) subtitulo.innerText = 'Entre com suas credenciais para continuar';
            limparErroGlobal('login-error');
            limparErroGlobal('register-error');
        });
    }

    // ═══════════════════════════════════════════════
    //  LOGIN
    // ═══════════════════════════════════════════════

    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            limparErroGlobal('login-error');
            
            const campoEmail = document.getElementById('email');
            const campoSenha = document.getElementById('senha');

            if (!campoEmail || !campoSenha) return;

            limparCampoErro(campoEmail);
            limparCampoErro(campoSenha);

            const emailDigitado = campoEmail.value.trim().toLowerCase();
            const senhaDigitada = campoSenha.value.trim();

            if (!emailDigitado || !senhaDigitada) {
                mostrarErroGlobal('login-error', 'Preencha todos os campos para continuar.');
                if (!emailDigitado) marcarCampoErro(campoEmail);
                if (!senhaDigitada) marcarCampoErro(campoSenha);
                return;
            }

            const usuarios = obterUsuarios();
            const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === emailDigitado);

            if (!usuarioEncontrado) {
                mostrarErroGlobal('login-error', 'Conta não encontrada. Verifique o e-mail ou cadastre-se.');
                marcarCampoErro(campoEmail);
                return;
            }

            if (usuarioEncontrado.status === 'pendente') {
                // Usuário foi convidado, mas ainda não definiu senha
                sessionStorage.setItem('st_inviteEmail', usuarioEncontrado.email);
                window.location.href = '../set-senha/set-senha.html';
                return;
            }

            if (usuarioEncontrado.senha === senhaDigitada) {
                logarUsuario(usuarioEncontrado);
            } else {
                mostrarErroGlobal('login-error', 'Senha incorreta. Tente novamente.');
                marcarCampoErro(campoSenha);
            }
        });
    }

    // ═══════════════════════════════════════════════
    //  CADASTRO
    // ═══════════════════════════════════════════════

    const regSenha = document.getElementById('reg-senha');
    const regConfirmar = document.getElementById('reg-confirmar-senha');

    function checarSenhasIguais() {
        if (!regSenha || !regConfirmar) return;
        if (regConfirmar.value.length === 0) {
            limparErroCampo('error-senha-match');
            limparCampoErro(regConfirmar);
            return;
        }
        if (regSenha.value !== regConfirmar.value) {
            mostrarErroCampo('error-senha-match');
            marcarCampoErro(regConfirmar);
        } else {
            limparErroCampo('error-senha-match');
            limparCampoErro(regConfirmar);
        }
    }

    if (regSenha) regSenha.addEventListener('input', checarSenhasIguais);
    if (regConfirmar) regConfirmar.addEventListener('input', checarSenhasIguais);

    document.querySelectorAll('#register-form input').forEach(input => {
        input.addEventListener('input', () => {
            limparCampoErro(input);
            limparErroGlobal('register-error');
        });
    });
    document.querySelectorAll('#login-form input').forEach(input => {
        input.addEventListener('input', () => {
            limparCampoErro(input);
            limparErroGlobal('login-error');
        });
    });

    if (formRegister) {
        formRegister.addEventListener('submit', function(e) {
            e.preventDefault();
            limparErroGlobal('register-error');

            const campoNome = document.getElementById('reg-nome');
            const campoEmail = document.getElementById('reg-email');
            const campoUsuario = document.getElementById('reg-usuario');
            const campoSenha = document.getElementById('reg-senha');
            const campoConfirmar = document.getElementById('reg-confirmar-senha');
            const campoPlano = document.getElementById('reg-plano');

            if (!campoNome || !campoEmail || !campoUsuario || !campoSenha || !campoConfirmar || !campoPlano) return;

            [campoNome, campoEmail, campoUsuario, campoSenha, campoConfirmar].forEach(limparCampoErro);
            limparErroCampo('error-senha-match');
            limparErroCampo('error-plano');

            const nome = campoNome.value.trim();
            const email = campoEmail.value.trim();
            const usuario = campoUsuario.value.trim();
            const senha = campoSenha.value.trim();
            const confirmar = campoConfirmar.value.trim();
            const plano = campoPlano.value;

            let temErro = false;
            if (!nome) { marcarCampoErro(campoNome); temErro = true; }
            if (!email) { marcarCampoErro(campoEmail); temErro = true; }
            if (!usuario) { marcarCampoErro(campoUsuario); temErro = true; }
            if (!senha) { marcarCampoErro(campoSenha); temErro = true; }
            if (!confirmar) { marcarCampoErro(campoConfirmar); temErro = true; }

            if (temErro) {
                mostrarErroGlobal('register-error', 'Preencha todos os campos obrigatórios.');
                return;
            }

            if (senha.length < 4) {
                marcarCampoErro(campoSenha);
                mostrarErroGlobal('register-error', 'A senha deve ter pelo menos 4 caracteres.');
                return;
            }

            if (senha !== confirmar) {
                marcarCampoErro(campoConfirmar);
                mostrarErroCampo('error-senha-match');
                mostrarErroGlobal('register-error', 'As senhas não coincidem.');
                return;
            }

            if (!plano) {
                mostrarErroCampo('error-plano');
                mostrarErroGlobal('register-error', 'Selecione um plano para continuar.');
                return;
            }

            const usuarios = obterUsuarios();
            const usuarioExistente = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (usuarioExistente) {
                if (usuarioExistente.status === 'pendente') {
                    // Usuário foi convidado, então apenas redireciona para criar senha
                    sessionStorage.setItem('st_inviteEmail', usuarioExistente.email);
                    window.location.href = '../set-senha/set-senha.html';
                    return;
                }
                marcarCampoErro(campoEmail);
                mostrarErroGlobal('register-error', 'Este e-mail já está em uso. Tente outro ou faça login.');
                return;
            }

            const usuarioDup = usuarios.some(u => u.usuario && u.usuario.toLowerCase() === usuario.toLowerCase());
            if (usuarioDup) {
                marcarCampoErro(campoUsuario);
                mostrarErroGlobal('register-error', 'Este nome de usuário já está em uso. Escolha outro.');
                return;
            }

            // O usuário que compra o plano é o Administrador do seu sistema
            const novoUsuario = {
                nome: nome,
                email: email,
                usuario: usuario,
                senha: senha,
                plano: plano,
                cargo: 'Administrador',
                status: 'ativo'
            };

            // Salvar dados temporários para a página de pagamento
            sessionStorage.setItem('st_pendingUser', JSON.stringify(novoUsuario));
            
            // Redirecionar para a página de pagamento fictício
            window.location.href = '../pagamento/pagamento.html';
        });
    }
});
