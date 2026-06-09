/**
 * pedidos.js — Lógica comportamental e de dados do módulo Comercial (Pedido de Vendas)
 */

"use strict";

const tbodyVendas = document.getElementById("tbody-vendas");
const searchVendas = document.getElementById("search-vendas");
const filterStatus = document.getElementById("filter-status");

const resumoTotalPedidos = document.getElementById("resumo-total-pedidos");
const resumoFaturamento = document.getElementById("resumo-faturamento");

const modalNovaVenda = document.getElementById("modal-nova-venda");
const btnNovaVenda = document.getElementById("btn-nova-venda");
const btnFecharVenda = document.getElementById("btn-fechar-venda");
const btnCancelarVenda = document.getElementById("btn-cancelar-venda");
const btnRegistrarVenda = document.getElementById("btn-registrar-venda");

const fCliente = document.getElementById("venda-cliente");
const fValor = document.getElementById("venda-valor");
const fPagamento = document.getElementById("venda-pagamento");
const fStatus = document.getElementById("venda-status");

let vendas = [];
let idEdicao = null;

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    configurarEventos();
});

function carregarDados() {
    const bd = window.lerBanco();
    vendas = bd.vendas || [];
    renderizarTabela();
    atualizarResumo();
}

function salvarDados() {
    const bd = window.lerBanco();
    bd.vendas = vendas;
    window.salvarBanco(bd);
}

function configurarEventos() {
    searchVendas.addEventListener("input", renderizarTabela);
    filterStatus.addEventListener("change", renderizarTabela);

    btnNovaVenda.addEventListener("click", () => {
        idEdicao = null;
        document.getElementById("form-venda").reset();
        modalNovaVenda.classList.add("open");
    });

    const fechar = () => modalNovaVenda.classList.remove("open");
    btnFecharVenda.addEventListener("click", fechar);
    btnCancelarVenda.addEventListener("click", fechar);

    btnRegistrarVenda.addEventListener("click", salvarVenda);
}

function renderizarTabela() {
    tbodyVendas.innerHTML = "";

    const busca = searchVendas.value.toLowerCase();
    const statusVal = filterStatus.value;

    const filtradas = vendas.filter(v => {
        const clienteMatch = (v.cliente || "").toLowerCase().includes(busca) ||
                             (v.id || "").toLowerCase().includes(busca);
        const statusMatch = statusVal === "todos" || v.status === statusVal;
        return clienteMatch && statusMatch;
    });

    if (filtradas.length === 0) {
        tbodyVendas.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">Nenhum pedido de venda registrado.</td></tr>`;
        return;
    }

    // Ordena pelo id mais recente (decrescente)
    filtradas.sort((a, b) => b.id.localeCompare(a.id));

    filtradas.forEach(v => {
        const valorFmt = Number(v.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const dataFmt = v.data ? new Date(v.data + 'T00:00:00').toLocaleDateString("pt-BR") : "—";
        const badgeClass = `badge-${v.status}`;

        tbodyVendas.innerHTML += `
            <tr>
                <td><strong>#${v.id}</strong></td>
                <td>${v.cliente}</td>
                <td>${dataFmt}</td>
                <td>${valorFmt}</td>
                <td>${v.pagamento || "Pix"}</td>
                <td><span class="badge ${badgeClass}">${v.status === 'concluido' ? 'Concluído' : 'Pendente'}</span></td>
                <td style="text-align:center; white-space:nowrap;">
                    <button class="btn-edit" onclick="editarVenda('${v.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-delete" onclick="excluirVenda('${v.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function atualizarResumo() {
    const totalPedidos = vendas.length;
    const faturamento = vendas
        .filter(v => v.status === 'concluido')
        .reduce((sum, v) => sum + (parseFloat(v.valorTotal) || 0), 0);

    resumoTotalPedidos.innerText = totalPedidos;
    resumoFaturamento.innerText = faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function salvarVenda(e) {
    e.preventDefault();

    const cliente = fCliente.value.trim();
    const valor = parseFloat(fValor.value);
    const pagamento = fPagamento.value;
    const status = fStatus.value;

    if (!cliente || isNaN(valor)) {
        window.mostrarToast("Por favor, preencha os campos obrigatórios!", "warning");
        return;
    }

    if (idEdicao) {
        // Editar
        const idx = vendas.findIndex(v => String(v.id) === String(idEdicao));
        if (idx !== -1) {
            vendas[idx] = {
                ...vendas[idx],
                cliente,
                valorTotal: valor,
                lucro: valor * 0.25, // Lucro aproximado de 25%
                pagamento,
                status
            };
            window.mostrarToast("Pedido de venda atualizado!");
        }
    } else {
        // Criar novo
        const novoId = (vendas.length + 1).toString();
        const novaVenda = {
            id: novoId,
            cliente,
            data: new Date().toISOString().split('T')[0],
            valorTotal: valor,
            lucro: valor * 0.25,
            pagamento,
            status
        };
        vendas.push(novaVenda);

        // --- Adiciona no DB unificado a movimentação de estoque/financeira correspondente ---
        const bd = window.lerBanco();
        bd.movimentacoes = bd.movimentacoes || [];
        bd.movimentacoes.push({
            id: `MOV-${String(bd.movimentacoes.length + 1).padStart(3, "0")}`,
            nome: `Venda - Cliente ${cliente}`,
            tipo: "venda",
            categoria: "Comercial & Vendas",
            valor: valor,
            data: novaVenda.data,
            descricao: `Pedido #${novoId} registrado via Comercial`
        });

        // Adiciona à lista de métricas de vendas do gráfico principal
        bd.movimentacoesGrafico = bd.movimentacoesGrafico || [];
        const dataDia = new Date().toLocaleDateString("pt-BR", {day: "2-digit", month: "2-digit"});
        const diaExistente = bd.movimentacoesGrafico.find(m => m.data === dataDia);
        if (diaExistente) {
            diaExistente.qtd += 1;
        } else {
            bd.movimentacoesGrafico.push({ data: dataDia, qtd: 1 });
        }

        window.salvarBanco(bd);
        window.mostrarToast("Pedido de venda registrado!");
    }

    salvarDados();
    carregarDados();
    modalNovaVenda.classList.remove("open");
}

window.editarVenda = function(id) {
    const venda = vendas.find(v => String(v.id) === String(id));
    if (!venda) return;

    idEdicao = venda.id;
    fCliente.value = venda.cliente;
    fValor.value = venda.valorTotal;
    fPagamento.value = venda.pagamento || "Pix";
    fStatus.value = venda.status;

    modalNovaVenda.classList.add("open");
};

window.excluirVenda = function(id) {
    if (confirm("Tem certeza que deseja remover este registro de venda?")) {
        vendas = vendas.filter(v => String(v.id) !== String(id));
        salvarDados();
        carregarDados();
        window.mostrarToast("Pedido de venda removido!");
    }
};
