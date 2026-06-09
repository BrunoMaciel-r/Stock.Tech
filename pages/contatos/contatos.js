/**
 * contatos.js — Lógica de contatos integrada com fallback offline (LocalStorage)
 */

"use strict";

const apiEndpoint = "http://localhost:3000/contatos";
let contatos = [];
let idEdicao = null;

const listaDiv = document.getElementById("listaContatos");
const pesquisaInput = document.getElementById("pesquisa-contatos");
const btnNovoContato = document.getElementById("btn-novo-contato");
const modalContato = document.getElementById("modalContato");

const fId = document.getElementById("contato-id");
const fNome = document.getElementById("nome");
const fTelefone = document.getElementById("telefone");
const fEmail = document.getElementById("email");

const btnSalvar = document.getElementById("btn-salvar-contato");
const btnCancelar = document.getElementById("btn-cancelar");
const btnFecharX = document.getElementById("btn-fechar-modal");

document.addEventListener("DOMContentLoaded", () => {
    carregarContatos();
    configurarEventos();
});

function configurarEventos() {
    pesquisaInput.addEventListener("input", aplicarFiltro);

    btnNovoContato.addEventListener("click", () => {
        idEdicao = null;
        document.getElementById("form-contato").reset();
        fId.value = "";
        document.getElementById("tituloModalContato").innerText = "Adicionar Contato";
        modalContato.classList.add("open");
    });

    const fechar = () => modalContato.classList.remove("open");
    btnFecharX.addEventListener("click", fechar);
    btnCancelar.addEventListener("click", fechar);

    btnSalvar.addEventListener("click", salvarContato);
}

async function carregarContatos() {
    try {
        // Tenta buscar da API local (json-server)
        const resposta = await fetch(apiEndpoint, { signal: AbortSignal.timeout(1000) });
        if (!resposta.ok) throw new Error("Erro na API");
        contatos = await resposta.json();
        console.log("Contatos carregados da API remota.");
    } catch (erro) {
        // Fallback: carrega do localStorage
        console.warn("API offline. Carregando contatos do LocalStorage.");
        const bd = window.lerBanco();
        contatos = bd.contatos || [];
    }

    renderizarGrade(contatos);
}

function renderizarGrade(lista) {
    listaDiv.innerHTML = "";

    if (lista.length === 0) {
        return; // O CSS cuidará do :empty
    }

    lista.forEach(c => {
        // Extrai iniciais para o avatar
        const partesNome = c.nome.trim().split(" ");
        const iniciais = partesNome.length >= 2 
            ? (partesNome[0][0] + partesNome[1][0]).toUpperCase()
            : c.nome.substring(0, 2).toUpperCase();

        const card = document.createElement("div");
        card.className = "contato-card";
        card.innerHTML = `
            <div class="contato-avatar">${iniciais}</div>
            <h3 class="contato-nome">${c.nome}</h3>
            <div class="contato-info">
                <div class="contato-item">
                    <i class="fa-solid fa-phone"></i>
                    <span>${c.telefone}</span>
                </div>
                <div class="contato-item">
                    <i class="fa-solid fa-envelope"></i>
                    <span>${c.email}</span>
                </div>
            </div>
            <div class="contato-acoes">
                <button class="btn-editar-card" onclick="editarContato('${c.id}')">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button class="btn-excluir-card" onclick="excluirContato('${c.id}')">
                    <i class="fa-solid fa-trash"></i> Excluir
                </button>
            </div>
        `;

        listaDiv.appendChild(card);
    });
}

function aplicarFiltro() {
    const termo = pesquisaInput.value.toLowerCase();
    const filtrados = contatos.filter(c =>
        (c.nome || "").toLowerCase().includes(termo) ||
        (c.telefone || "").toLowerCase().includes(termo) ||
        (c.email || "").toLowerCase().includes(termo)
    );
    renderizarGrade(filtrados);
}

async function salvarContato(e) {
    e.preventDefault();

    const nome = fNome.value.trim();
    const telefone = fTelefone.value.trim();
    const email = fEmail.value.trim();

    if (!nome || !telefone || !email) {
        window.mostrarToast("Preencha todos os campos obrigatórios!", "warning");
        return;
    }

    const contato = { nome, telefone, email };

    if (idEdicao) {
        // Modo Edição
        contato.id = idEdicao;
        
        // 1. Tenta atualizar na API
        try {
            const resposta = await fetch(`${apiEndpoint}/${idEdicao}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contato),
                signal: AbortSignal.timeout(1000)
            });
            if (!resposta.ok) throw new Error("Erro API");
            window.mostrarToast("Contato editado via API!");
        } catch (erro) {
            // Atualiza localmente
            const idx = contatos.findIndex(c => String(c.id) === String(idEdicao));
            if (idx !== -1) contatos[idx] = contato;
            
            const bd = window.lerBanco();
            bd.contatos = contatos;
            window.salvarBanco(bd);
            window.mostrarToast("Contato editado localmente!");
        }
    } else {
        // Modo Criação
        const novoId = Date.now().toString();
        contato.id = novoId;

        // 1. Tenta salvar na API
        try {
            const resposta = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(contato),
                signal: AbortSignal.timeout(1000)
            });
            if (!resposta.ok) throw new Error("Erro API");
            window.mostrarToast("Contato salvo via API!");
        } catch (erro) {
            // Salva localmente
            contatos.push(contato);
            const bd = window.lerBanco();
            bd.contatos = contatos;
            window.salvarBanco(bd);
            window.mostrarToast("Contato salvo localmente!");
        }
    }

    modalContato.classList.remove("open");
    carregarContatos();
}

window.editarContato = function(id) {
    const contato = contatos.find(c => String(c.id) === String(id));
    if (!contato) return;

    idEdicao = contato.id;
    fNome.value = contato.nome;
    fTelefone.value = contato.telefone;
    fEmail.value = contato.email;

    document.getElementById("tituloModalContato").innerText = "Editar Contato";
    modalContato.classList.add("open");
};

window.excluirContato = async function(id) {
    if (confirm("Tem certeza que deseja excluir este contato?")) {
        // 1. Tenta remover na API
        try {
            const resposta = await fetch(`${apiEndpoint}/${id}`, {
                method: "DELETE",
                signal: AbortSignal.timeout(1000)
            });
            if (!resposta.ok) throw new Error("Erro API");
            window.mostrarToast("Contato excluído via API!");
        } catch (erro) {
            // Remove localmente
            contatos = contatos.filter(c => String(c.id) !== String(id));
            const bd = window.lerBanco();
            bd.contatos = contatos;
            window.salvarBanco(bd);
            window.mostrarToast("Contato excluído localmente!");
        }

        carregarContatos();
    }
};
