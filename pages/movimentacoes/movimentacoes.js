

"use strict";

const container = document.getElementById("cardsContainer");
const pesquisa = document.getElementById("pesquisa");
const filtroTipo = document.getElementById("filtroTipo");
const btnLimpar = document.getElementById("btnLimpar");

const btnNovaMov = document.getElementById("btnNovaMovimentacao");
const modalMov = document.getElementById("modalMovimentacao");
const fecharModalMov = document.getElementById("fecharModalMov");
const cancelarMov = document.getElementById("cancelarMov");
const salvarMov = document.getElementById("salvarMov");



const movId = document.getElementById("movId");
const movNome = document.getElementById("movNome");
const movTipo = document.getElementById("movTipo");
const movCategoria = document.getElementById("movCategoria");
const movValor = document.getElementById("movValor");
const movData = document.getElementById("movData");
const movDescricao = document.getElementById("movDescricao");

let movimentacoes = [];


document.addEventListener("DOMContentLoaded", iniciarSistema);

function iniciarSistema() {
    carregarDadosLocal();
    renderizarCards(movimentacoes);
    iniciarEventos();
}

function carregarDadosLocal() {
    const bd = window.lerBanco();
    movimentacoes = bd.movimentacoes || [];
}

function salvarDadosLocal() {
    const bd = window.lerBanco();
    bd.movimentacoes = movimentacoes;
    window.salvarBanco(bd);
}

function iniciarEventos() {
    pesquisa.addEventListener("input", aplicarFiltros);
    filtroTipo.addEventListener("change", aplicarFiltros);
    btnLimpar.addEventListener("click", limparFiltros);
    btnNovaMov.addEventListener("click", abrirModalNova);
    
    fecharModalMov.addEventListener("click", fecharModalMovimentacao);
    cancelarMov.addEventListener("click", fecharModalMovimentacao);
    salvarMov.addEventListener("click", salvarMovimentacao);


}

function renderizarCards(lista) {
    container.innerHTML = "";

    if (!lista.length) {
        container.innerHTML = `
            <div class="mov-card" style="justify-content:center;">
                <span style="color:var(--text-muted);">Nenhuma movimentação encontrada.</span>
            </div>
        `;
        return;
    }

    
    const listaOrdenada = [...lista].sort((a, b) => (b.data || '').localeCompare(a.data || ''));

    listaOrdenada.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("mov-card");
        
        const valorFmt = Number(item.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const dataFmt = item.data ? new Date(item.data + 'T00:00:00').toLocaleDateString("pt-BR") : "-";

        card.innerHTML = `
            <div class="mov-left">
                <div class="mov-info">
                    <span class="mov-nome">${item.nome}</span>
                    <div style="display:flex; align-items:center; gap:8px; margin-top:3px;">
                        <span class="badge ${item.tipo}">${formatarTipo(item.tipo)}</span>
                        <small>${item.categoria || "Geral"}</small>
                    </div>
                </div>
            </div>

            <div class="mov-right">
                <div class="mov-extra" style="text-align:right;">
                    <span class="mov-valor">${valorFmt}</span>
                    <span class="mov-data">${dataFmt}</span>
                </div>

                <span class="produto-id" style="min-width:90px; text-align:right;">${item.id}</span>

                <div class="acoes-card">
                    <i class="fa-solid fa-pen-to-square btn-editar" title="Editar" data-id="${item.id}"></i>
                    <i class="fa-solid fa-trash btn-excluir" title="Excluir" data-id="${item.id}"></i>
                </div>
            </div>
        `;

        card.querySelector(".btn-editar").addEventListener("click", () => editarMovimentacao(item.id));
        card.querySelector(".btn-excluir").addEventListener("click", () => excluirMovimentacao(item.id));

        container.appendChild(card);
    });
}

function formatarTipo(tipo) {
    const tipos = {
        entrada: "Entrada",
        venda: "Venda",
        devolucao: "Devolução"
    };
    return tipos[tipo] || tipo;
}

function aplicarFiltros() {
    const termo = pesquisa.value.toLowerCase();
    const tipo = filtroTipo.value;

    const filtrados = movimentacoes.filter(item => {
        const nomeMatch = (item.nome || "").toLowerCase().includes(termo) || 
                          (item.categoria || "").toLowerCase().includes(termo) ||
                          (item.id || "").toLowerCase().includes(termo);

        const tipoMatch = tipo === "todos" || item.tipo === tipo;

        return nomeMatch && tipoMatch;
    });

    renderizarCards(filtrados);
}

function limparFiltros() {
    pesquisa.value = "";
    filtroTipo.value = "todos";
    renderizarCards(movimentacoes);
}

function abrirModalNova() {
    limparFormulario();
    document.getElementById("tituloModalMov").innerText = "Nova Movimentação";
    
    
    movData.value = new Date().toISOString().split('T')[0];
    
    modalMov.classList.add("open");
}

function fecharModalMovimentacao() {
    modalMov.classList.remove("open");
}

function salvarMovimentacao() {
    const nomeVal = movNome.value.trim();
    const tipoVal = movTipo.value;
    const catVal = movCategoria.value.trim() || "Geral";
    const valorVal = parseFloat(movValor.value);
    const dataVal = movData.value;
    const descVal = movDescricao.value.trim();

    if (!nomeVal || isNaN(valorVal) || !dataVal) {
        window.mostrarToast("Preencha todos os campos obrigatórios!", "warning");
        return;
    }

    const idVal = movId.value || gerarId();

    const dados = {
        id: idVal,
        nome: nomeVal,
        tipo: tipoVal,
        categoria: catVal,
        valor: valorVal,
        data: dataVal,
        descricao: descVal
    };

    const index = movimentacoes.findIndex(item => String(item.id) === String(idVal));

    if (index !== -1) {
        movimentacoes[index] = dados;
        window.mostrarToast("Movimentação atualizada!");
    } else {
        movimentacoes.push(dados);
        
        
        
        
        
        window.mostrarToast("Movimentação registrada!");
    }

    salvarDadosLocal();
    carregarDadosLocal();
    renderizarCards(movimentacoes);
    fecharModalMovimentacao();
    limparFormulario();
}

function editarMovimentacao(id) {
    const item = movimentacoes.find(mov => String(mov.id) === String(id));
    if (!item) return;

    movId.value = item.id;
    movNome.value = item.nome;
    movTipo.value = item.tipo;
    movCategoria.value = item.categoria || "Geral";
    movValor.value = item.valor;
    movData.value = item.data;
    movDescricao.value = item.descricao || "";

    document.getElementById("tituloModalMov").innerText = "Editar Movimentação";
    modalMov.classList.add("open");
}

function excluirMovimentacao(id) {
    window.confirmarExclusao("Essa ação não poderá ser desfeita e afetará o saldo financeiro do sistema.", function () {
        movimentacoes = movimentacoes.filter(item => String(item.id) !== String(id));
        salvarDadosLocal();
        carregarDadosLocal();
        renderizarCards(movimentacoes);
        window.mostrarToast("Movimentação removida!");
    });
}

function limparFormulario() {
    movId.value = "";
    movNome.value = "";
    movTipo.value = "entrada";
    movCategoria.value = "";
    movValor.value = "";
    movData.value = "";
    movDescricao.value = "";
}

function gerarId() {
    const num = movimentacoes.length + 1;
    return `MOV-${String(num).padStart(3, "0")}`;
}
