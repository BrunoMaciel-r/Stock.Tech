console.log("Arquivo auth.js carregado com sucesso!");


const USUARIOS_PADRAO = [
    {
        nome: "Administrador Geral",
        email: "admin@admin.com",
        senha: "123",
        cargo: "Gerente de Operações"
    }
];

function obterUsuarios() {
    if (!localStorage.getItem("stockTechUsers")) {
        localStorage.setItem("stockTechUsers", JSON.stringify(USUARIOS_PADRAO));
    }
    return JSON.parse(localStorage.getItem("stockTechUsers"));
}

function salvarUsuarios(usuarios) {
    localStorage.setItem("stockTechUsers", JSON.stringify(usuarios));
}

document.addEventListener('DOMContentLoaded', () => {
    
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        console.log("Usuário já autenticado. Redirecionando para o dashboard...");
        window.location.href = '../dashboard/dashboard.html';
        return;
    }

    
    obterUsuarios();

    
    const linkCadastro = document.getElementById('link-ir-cadastro');
    const linkLogin = document.getElementById('link-ir-login');
    const formLogin = document.getElementById('login-form');
    const formRegister = document.getElementById('register-form');
    const titulo = document.getElementById('login-title');

    
    if (linkCadastro && linkLogin && formLogin && formRegister && titulo) {
        linkCadastro.addEventListener('click', (e) => {
            e.preventDefault();
            formLogin.style.display = 'none';
            formRegister.style.display = 'flex';
            titulo.innerText = 'Criar Conta';
        });

        linkLogin.addEventListener('click', (e) => {
            e.preventDefault();
            formRegister.style.display = 'none';
            formLogin.style.display = 'block';
            titulo.innerText = 'Acessar Painel';
        });
    }

    
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const campoEmail = document.getElementById('email');
            const campoSenha = document.getElementById('senha');

            if (!campoEmail || !campoSenha) {
                console.error("ERRO: Não encontrei os IDs 'email' ou 'senha' no HTML.");
                alert("Erro interno: Campos de entrada não encontrados.");
                return;
            }

            const emailDigitado = campoEmail.value.trim().toLowerCase();
            const senhaDigitada = campoSenha.value.trim();

            console.log("Tentativa de login: " + emailDigitado);

            
            const usuarios = obterUsuarios();
            const usuarioEncontrado = usuarios.find(u => u.email.toLowerCase() === emailDigitado && u.senha === senhaDigitada);

            if (usuarioEncontrado) {
                console.log("Login aprovado! Redirecionando...");
                
                
                sessionStorage.setItem('isLoggedIn', 'true');
                
                
                localStorage.setItem("st_nome", usuarioEncontrado.nome);
                localStorage.setItem("st_email", usuarioEncontrado.email);
                localStorage.setItem("st_cargo", usuarioEncontrado.cargo || "Usuário");
                
                
                window.location.href = '../dashboard/dashboard.html';
            } else {
                console.log("Login negado: Credenciais incorretas.");
                alert("E-mail ou senha incorretos! Tente admin@admin.com e senha 123, ou cadastre uma nova conta.");
            }
        });
    }

    
    if (formRegister) {
        formRegister.addEventListener('submit', function(e) {
            e.preventDefault();

            const campoNome = document.getElementById('reg-nome');
            const campoEmail = document.getElementById('reg-email');
            const campoSenha = document.getElementById('reg-senha');

            if (!campoNome || !campoEmail || !campoSenha) {
                console.error("ERRO: Campos de cadastro não encontrados.");
                alert("Erro interno: Campos de cadastro não encontrados.");
                return;
            }

            const nomeDigitado = campoNome.value.trim();
            const emailDigitado = campoEmail.value.trim();
            const senhaDigitada = campoSenha.value.trim();

            const usuarios = obterUsuarios();

            
            const emailExiste = usuarios.some(u => u.email.toLowerCase() === emailDigitado.toLowerCase());

            if (emailExiste) {
                alert("Este e-mail já está sendo utilizado! Por favor, utilize outro.");
                return;
            }

            
            const novoUsuario = {
                nome: nomeDigitado,
                email: emailDigitado,
                senha: senhaDigitada,
                cargo: "Administrador" 
            };

            usuarios.push(novoUsuario);
            salvarUsuarios(usuarios);

            alert("Cadastro realizado com sucesso! Agora você já pode entrar na plataforma.");

            
            campoNome.value = '';
            campoEmail.value = '';
            campoSenha.value = '';

            
            formRegister.style.display = 'none';
            formLogin.style.display = 'block';
            titulo.innerText = 'Acessar Painel';

            const loginEmail = document.getElementById('email');
            if (loginEmail) {
                loginEmail.value = emailDigitado;
            }
            const loginSenha = document.getElementById('senha');
            if (loginSenha) {
                loginSenha.focus();
            }
        });
    }
});
