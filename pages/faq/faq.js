/**
 * faq.js — Lógica de perguntas frequentes, ticket de suporte e avaliações
 */

"use strict";

let avaliacoes = [];
let idAvalEdicao = null;

document.addEventListener("DOMContentLoaded", () => {
    inicializarFaq();
    inicializarTicket();
    inicializarAvaliacoes();
});

// --- CONTROLE DOS ARTIGOS DO FAQ ---
function inicializarFaq() {
    // Alternar ler mais/menos
    document.querySelectorAll(".faq-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const card = btn.closest(".faq-card");
            card.classList.toggle("active");
            
            if (card.classList.contains("active")) {
                btn.innerText = "Ler menos";
            } else {
                btn.innerText = "Ler mais";
            }
        });
    });

    // Filtro de busca de artigos
    const searchInput = document.getElementById("faqSearch");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const busca = searchInput.value.toLowerCase().trim();
            document.querySelectorAll(".faq-card").forEach(card => {
                const titulo = card.getAttribute("data-titulo") || "";
                const texto = card.innerText.toLowerCase();
                
                if (busca === "" || titulo.includes(busca) || texto.includes(busca)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // Carregar mais artigos (simulação simples)
    const toggleFaqBtn = document.getElementById("toggleFaq");
    if (toggleFaqBtn) {
        // Inicialmente mostra 3 e esconde o resto
        const cards = document.querySelectorAll(".faq-card");
        let mostrandoTodos = false;

        function aplicarLimiteArtigos() {
            cards.forEach((card, index) => {
                if (mostrandoTodos || index < 3) {
                    card.style.opacity = "1";
                    card.style.pointerEvents = "all";
                    // Garante que não interfira com display none da busca
                    if (!searchInput.value) card.style.display = "flex"; 
                } else {
                    card.style.opacity = "0";
                    card.style.pointerEvents = "none";
                    setTimeout(() => {
                        if (!mostrandoTodos && index >= 3) card.style.display = "none";
                    }, 300);
                }
            });
        }
        
        aplicarLimiteArtigos();

        toggleFaqBtn.addEventListener("click", () => {
            mostrandoTodos = !mostrandoTodos;
            toggleFaqBtn.classList.toggle("active");
            toggleFaqBtn.innerText = mostrandoTodos ? "Mostrar menos artigos" : "Carregar mais artigos";
            
            aplicarLimiteArtigos();
        });
    }
}

// --- MODAL DE TICKET DE SUPORTE ---
function inicializarTicket() {
    const modal = document.getElementById("ticketModal");
    const abrirBtn = document.getElementById("abrirTicket");
    const fecharX = document.getElementById("fecharTicket");
    const cancelarBtn = document.getElementById("btnCancelarTicket");
    const form = document.getElementById("form-ticket");

    if (abrirBtn && modal) {
        abrirBtn.addEventListener("click", () => {
            form.reset();
            modal.classList.add("active");
        });
    }

    const fechar = () => modal?.classList.remove("active");
    fecharX?.addEventListener("click", fechar);
    cancelarBtn?.addEventListener("click", fechar);

    form?.addEventListener("submit", (e) => {
        e.preventDefault();
        window.mostrarToast("Ticket enviado com sucesso! Retornaremos no e-mail cadastrado.");
        fechar();
    });
}

// --- GERENCIADOR DE AVALIAÇÕES (Opinião de Usuários) ---
function inicializarAvaliacoes() {
    const listContainer = document.getElementById("listaAvaliacoes");
    const toggleFormBtn = document.getElementById("toggleFormulario");
    const formBox = document.getElementById("formularioAvaliacao");
    const btnCancelarAval = document.getElementById("btnCancelarAvaliacao");
    const btnEnviar = document.getElementById("btnEnviar");

    const fNome = document.getElementById("aval-nome");
    const fFuncao = document.getElementById("aval-funcao");
    const fTexto = document.getElementById("aval-texto");

    // Carrega dados iniciais do LocalStorage integrado
    function carregarAvaliacoes() {
        const bd = window.lerBanco();
        avaliacoes = bd.avaliacoes || [];
        renderizarAvaliacoes();
    }

    function salvarAvaliacoes() {
        const bd = window.lerBanco();
        bd.avaliacoes = avaliacoes;
        window.salvarBanco(bd);
    }

    function renderizarAvaliacoes() {
        listContainer.innerHTML = "";

        if (avaliacoes.length === 0) {
            listContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); font-size:13px; padding: 20px 0;">Seja o primeiro a avaliar a plataforma!</p>`;
            return;
        }

        avaliacoes.forEach((av, idx) => {
            const card = document.createElement("div");
            card.className = "avaliacao-card";
            card.innerHTML = `
                <h4>${av.nome}</h4>
                <div class="avaliacao-funcao">${av.funcao || "Usuário"}</div>
                <p class="avaliacao-texto">"${av.avaliacao}"</p>
                <div class="avaliacao-acoes">
                    <button class="btn-editar-aval" onclick="editarAvaliacao(${idx})" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-excluir-aval" onclick="excluirAvaliacao(${idx})" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }

    // Toggle formulário
    toggleFormBtn?.addEventListener("click", () => {
        idAvalEdicao = null;
        fNome.value = "";
        fFuncao.value = "";
        fTexto.value = "";
        
        formBox.style.display = formBox.style.display === "none" || formBox.style.display === "" 
            ? "block" 
            : "none";
    });

    btnCancelarAval?.addEventListener("click", (e) => {
        e.preventDefault();
        formBox.style.display = "none";
        idAvalEdicao = null;
    });

    btnEnviar?.addEventListener("click", (e) => {
        e.preventDefault();
        const nome = fNome.value.trim();
        const funcao = fFuncao.value.trim() || "Usuário";
        const texto = fTexto.value.trim();

        if (!nome || !texto) {
            window.mostrarToast("Por favor, preencha os campos obrigatórios!", "warning");
            return;
        }

        if (idAvalEdicao !== null) {
            // Edição
            avaliacoes[idAvalEdicao] = { nome, funcao, avaliacao: texto };
            window.mostrarToast("Avaliação atualizada!");
        } else {
            // Nova
            avaliacoes.push({ nome, funcao, avaliacao: texto });
            window.mostrarToast("Avaliação enviada!");
        }

        salvarAvaliacoes();
        carregarAvaliacoes();
        
        formBox.style.display = "none";
        idAvalEdicao = null;
    });

    // Expõe funções para edição/exclusão em nível global (usados nos onclicks dos cards)
    window.editarAvaliacao = function(index) {
        const av = avaliacoes[index];
        if (!av) return;

        idAvalEdicao = index;
        fNome.value = av.nome;
        fFuncao.value = av.funcao;
        fTexto.value = av.avaliacao;

        formBox.style.display = "block";
        formBox.scrollIntoView({ behavior: "smooth" });
    };

    window.excluirAvaliacao = function(index) {
        if (confirm("Tem certeza que deseja excluir sua avaliação?")) {
            avaliacoes.splice(index, 1);
            salvarAvaliacoes();
            carregarAvaliacoes();
            window.mostrarToast("Avaliação removida!");
        }
    };

    // Inicialização
    carregarAvaliacoes();
}
