

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
const fProduto = document.getElementById("venda-produto");
const fQuantidade = document.getElementById("venda-quantidade");
const fEstoqueDisp = document.getElementById("venda-estoque-disp");

let vendas = [];
let produtosDisp = [];
let idEdicao = null;

document.addEventListener("DOMContentLoaded", () => {
    carregarDados();
    configurarEventos();
});

function carregarDados() {
    const bd = window.lerBanco();
    vendas = bd.vendas || [];
    produtosDisp = bd.produtos || [];
    renderizarTabela();
    atualizarResumo();
    carregarProdutos();
}

function carregarProdutos() {
    if (!fProduto) return;
    fProduto.innerHTML = '<option value="">Selecione um produto</option>';
    produtosDisp.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.nome}`;
        opt.dataset.preco = p.preco || 0;
        opt.dataset.custo = p.precoCusto || 0;
        opt.dataset.estoque = p.quantidade || 0;
        opt.dataset.nome = p.nome;
        fProduto.appendChild(opt);
    });
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

    const calcTotal = () => {
        const opt = fProduto.options[fProduto.selectedIndex];
        if (!opt || !opt.value) {
            fEstoqueDisp.textContent = "";
            return;
        }
        const preco = parseFloat(opt.dataset.preco) || 0;
        const estq = parseInt(opt.dataset.estoque) || 0;
        fEstoqueDisp.textContent = `(Estoque: ${estq})`;
        fEstoqueDisp.style.color = estq > 0 ? 'var(--primary)' : 'var(--danger)';
        
        const qtd = parseInt(fQuantidade.value) || 0;
        if (qtd > 0) {
            fValor.value = (preco * qtd).toFixed(2);
        }
    };

    fProduto.addEventListener("change", calcTotal);
    fQuantidade.addEventListener("input", calcTotal);
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

    
    filtradas.sort((a, b) => b.id.localeCompare(a.id));

    filtradas.forEach(v => {
        const valorFmt = Number(v.valorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const dataFmt = v.data ? new Date(v.data + 'T00:00:00').toLocaleDateString("pt-BR") : "—";
        const badgeClass = `badge-${v.status}`;
        const prodObj = produtosDisp.find(p => String(p.id) === String(v.produtoId));
        const prodNome = prodObj ? prodObj.nome : 'Produto Genérico';
        const qtdStr = v.quantidade ? ` (${v.quantidade}x)` : '';

        tbodyVendas.innerHTML += `
            <tr>
                <td><strong>#${v.id}</strong></td>
                <td>${v.cliente}<br><small style="color:var(--text-muted);">${prodNome}${qtdStr}</small></td>
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
    const produtoId = fProduto.value;
    const quantidade = parseInt(fQuantidade.value) || 0;

    if (!cliente || isNaN(valor) || !produtoId || quantidade <= 0) {
        window.mostrarToast("Por favor, preencha todos os campos corretamente!", "warning");
        return;
    }

    const bd = window.lerBanco();
    const prodIdx = bd.produtos.findIndex(p => String(p.id) === String(produtoId));
    if (prodIdx === -1) return;

    const produto = bd.produtos[prodIdx];
    const custoUn = parseFloat(produto.precoCusto) || 0;
    const lucroReal = valor - (custoUn * quantidade);

    if (idEdicao) {
        
        const idx = vendas.findIndex(v => String(v.id) === String(idEdicao));
        if (idx !== -1) {
            const vendaAntiga = vendas[idx];
            
            if (vendaAntiga.produtoId === produtoId) {
                const diff = quantidade - (vendaAntiga.quantidade || 0);
                if (produto.quantidade < diff) {
                    window.mostrarToast("Estoque insuficiente para a nova quantidade!", "danger");
                    return;
                }
                bd.produtos[prodIdx].quantidade -= diff;
                bd.produtos[prodIdx].vendasNoMes = (bd.produtos[prodIdx].vendasNoMes || 0) + diff;
            } else {
                const oldProdIdx = bd.produtos.findIndex(p => String(p.id) === String(vendaAntiga.produtoId));
                if (oldProdIdx !== -1) {
                    bd.produtos[oldProdIdx].quantidade += (vendaAntiga.quantidade || 0);
                    bd.produtos[oldProdIdx].vendasNoMes = Math.max(0, (bd.produtos[oldProdIdx].vendasNoMes || 0) - (vendaAntiga.quantidade || 0));
                }
                
                if (produto.quantidade < quantidade) {
                    window.mostrarToast("Estoque insuficiente!", "danger");
                    return;
                }
                bd.produtos[prodIdx].quantidade -= quantidade;
                bd.produtos[prodIdx].vendasNoMes = (bd.produtos[prodIdx].vendasNoMes || 0) + quantidade;
            }

            vendas[idx] = {
                ...vendas[idx],
                cliente,
                produtoId,
                quantidade,
                valorTotal: valor,
                lucro: lucroReal, 
                pagamento,
                status
            };
            
            if (bd.movimentacoes) {
                const movIdx = bd.movimentacoes.findIndex(m => m.refPedido === String(idEdicao));
                if (movIdx !== -1) {
                    bd.movimentacoes[movIdx].nome = `Venda - Cliente ${cliente}`;
                    bd.movimentacoes[movIdx].valor = valor;
                }
            }
            window.salvarBanco(bd);
            window.mostrarToast("Pedido de venda atualizado!");
        }
    } else {
        if (produto.quantidade < quantidade) {
            window.mostrarToast("Estoque insuficiente!", "danger");
            return;
        }
        bd.produtos[prodIdx].quantidade -= quantidade;
        bd.produtos[prodIdx].vendasNoMes = (bd.produtos[prodIdx].vendasNoMes || 0) + quantidade;

        const novoId = (vendas.length + 1).toString();
        const novaVenda = {
            id: novoId,
            cliente,
            produtoId,
            quantidade,
            data: new Date().toISOString().split('T')[0],
            valorTotal: valor,
            lucro: lucroReal,
            pagamento,
            status
        };
        vendas.push(novaVenda);

        
        bd.movimentacoes = bd.movimentacoes || [];
        bd.movimentacoes.push({
            id: `MOV-${String(bd.movimentacoes.length + 1).padStart(3, "0")}`,
            refPedido: novoId,
            nome: `Venda - Cliente ${cliente}`,
            tipo: "venda",
            categoria: "Comercial & Vendas",
            valor: valor,
            data: novaVenda.data,
            descricao: `Pedido #${novoId} registrado via Comercial`
        });

        
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
    fProduto.value = venda.produtoId || "";
    fQuantidade.value = venda.quantidade || "";
    fValor.value = venda.valorTotal;
    fPagamento.value = venda.pagamento || "Pix";
    fStatus.value = venda.status;

    const opt = fProduto.options[fProduto.selectedIndex];
    if (opt && opt.value) {
        const estq = parseInt(opt.dataset.estoque) || 0;
        fEstoqueDisp.textContent = `(Estoque: ${estq})`;
        fEstoqueDisp.style.color = estq > 0 ? 'var(--primary)' : 'var(--danger)';
    }

    modalNovaVenda.classList.add("open");
};

window.excluirVenda = function(id) {
    window.confirmarExclusao("Essa ação removerá o registro de venda e o estoque será devolvido.", function () {
        const venda = vendas.find(v => String(v.id) === String(id));
        vendas = vendas.filter(v => String(v.id) !== String(id));
        
        const bd = window.lerBanco();
        if (venda && venda.produtoId) {
            const prodIdx = bd.produtos.findIndex(p => String(p.id) === String(venda.produtoId));
            if (prodIdx !== -1) {
                bd.produtos[prodIdx].quantidade += (venda.quantidade || 0);
                bd.produtos[prodIdx].vendasNoMes = Math.max(0, (bd.produtos[prodIdx].vendasNoMes || 0) - (venda.quantidade || 0));
            }
        }
        
        bd.movimentacoes = (bd.movimentacoes || []).filter(m => m.refPedido !== String(id));
        window.salvarBanco(bd);
        
        salvarDados();
        carregarDados();
        window.mostrarToast("Pedido removido e estoque devolvido!");
    });
};
