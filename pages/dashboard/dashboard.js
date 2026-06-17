

"use strict";

let todasAsNotas = [];
let idEdicao = null;
let meuGrafico = null;
let ordenacaoColuna = "data"; 
let ordenacaoDirecao = "desc"; 

const $ = id => document.getElementById(id);


document.addEventListener("DOMContentLoaded", () => {
    
    carregarCategorias();
    
    
    configurarOrdenacao(); 
    
    
    buscarNotasBancoLocal();
    
    
    carregarDashboard(); 

    
    const filtroDias = $("filtro-dias");
    if (filtroDias) {
        filtroDias.addEventListener("change", (e) => {
            const dias = e.target.value;
            document.querySelectorAll('.kpi-dias-label').forEach(label => {
                label.innerText = `(${dias}D)`;
            });
            carregarDashboard();
        });
    }

    
    const btnAtualizar = $("btn-atualizar");
    if (btnAtualizar) {
        btnAtualizar.addEventListener("click", () => {
            window.mostrarToast("Métricas e notas atualizadas!");
            carregarDashboard();
            buscarNotasBancoLocal();
        });
    }

    
    const inputBusca = $("input-busca");
    if (inputBusca) {
        inputBusca.addEventListener("input", aplicarFiltrosERenderizar);
    }

    const filterUrgencia = $("filter-urgencia");
    if (filterUrgencia) {
        filterUrgencia.addEventListener("change", aplicarFiltrosERenderizar);
    }

    
    const formNota = $("form-nota");
    if (formNota) {
        formNota.addEventListener("submit", function (e) {
            e.preventDefault(); 
            const bd = window.lerBanco();
            
            const dadosFormulario = {
                titulo: $("f-titulo").value,
                categoria: $("f-categoria").value,
                status: $("f-status").value,
                urgencia: $("f-urgencia").value,
                descricao: $("f-descricao").value,
                criadoEm: idEdicao 
                    ? todasAsNotas.find(n => n.id === idEdicao).criadoEm 
                    : new Date().toISOString()
            };

            if (idEdicao) {
                const index = bd.notas.findIndex(n => n.id === idEdicao);
                dadosFormulario.id = idEdicao; 
                bd.notas[index] = dadosFormulario; 
            } else {
                dadosFormulario.id = Date.now().toString(); 
                bd.notes = bd.notes || []; 
                bd.notas.push(dadosFormulario); 
            }

            window.salvarBanco(bd); 
            fecharModal();
            buscarNotasBancoLocal();
            window.mostrarToast(idEdicao ? "Nota atualizada!" : "Nova nota adicionada!"); 
        });
    }

    
    document.querySelectorAll('.btn-urgency').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-urgency').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const fUrgencia = $("f-urgencia");
            if (fUrgencia) {
                fUrgencia.value = btn.getAttribute('data-val');
            }
        });
    });

    
    const btnNovaNota = $("btn-nova-nota");
    if (btnNovaNota) {
        btnNovaNota.addEventListener("click", () => {
            $("modal-titulo-txt").innerText = "Nova Nota";
            $("modal-nota").classList.add("open");
        });
    }

    
    const btnFecharModal = $("btn-fechar-modal");
    if (btnFecharModal) {
        btnFecharModal.addEventListener("click", fecharModal);
    }

    const btnCancelar = $("btn-cancelar");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", (e) => {
            e.preventDefault();
            fecharModal();
        });
    }
});

function carregarDashboard() {
    const bd = window.lerBanco();
    const filtroDiasElement = $("filtro-dias");
    const diasSelecionados = filtroDiasElement ? parseInt(filtroDiasElement.value) : 7;

    
    renderizarKPIs(bd.produtos, bd.vendas);
    
    
    renderizarTopProdutos(bd.produtos);
    
    
    renderizarGrafico(bd.movimentacoesGrafico, diasSelecionados);

    
    verificarEstoqueCritico(bd.produtos);

    
    const agora = new Date();
    const horaAtualizacao = $("hora-atualizacao");
    if (horaAtualizacao) {
        const horas = agora.getHours();
        const minutos = agora.getMinutes().toString().padStart(2, '0');
        horaAtualizacao.innerText = `Hoje às ${horas}:${minutos}`;
    }
}

function renderizarKPIs(produtos, vendas) {
    const totalProdutos = produtos.length;
    const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);
    const totalVendido = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
    const lucroTotal = vendas.reduce((acc, v) => acc + v.lucro, 0);

    const kpiProdutos = $("kpi-produtos");
    const kpiEstoque = $("kpi-estoque");
    const kpiVendas = $("kpi-vendas");
    const kpiLucro = $("kpi-lucro");

    if (kpiProdutos) kpiProdutos.innerText = totalProdutos;
    if (kpiEstoque) {
        kpiEstoque.innerText = valorTotalEstoque.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
    if (kpiVendas) {
        kpiVendas.innerText = totalVendido.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
    if (kpiLucro) {
        kpiLucro.innerText = lucroTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
}

function renderizarTopProdutos(produtos) {
    const lista = $("lista-top-produtos");
    if (!lista) return;

    const topProdutos = [...produtos]
        .sort((a, b) => b.vendasNoMes - a.vendasNoMes)
        .slice(0, 4);
    
    lista.innerHTML = ""; 
    topProdutos.forEach(prod => {
        lista.innerHTML += `<li><span>${prod.nome}</span> <span class="prod-vendas">${prod.vendasNoMes} un.</span></li>`;
    });
}

function renderizarGrafico(movimentacoes, dias) {
    const canvas = $('graficoMovimentacoes');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dadosFiltrados = movimentacoes.slice(-dias); 

    if (meuGrafico) {
        meuGrafico.destroy(); 
    }

    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dadosFiltrados.map(item => item.data),
            datasets: [{
                label: 'Qtd. Movimentada',
                data: dadosFiltrados.map(item => item.qtd),
                borderColor: '#1b5e20',
                backgroundColor: 'rgba(27, 94, 32, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function carregarCategorias() {
    const select = $("f-categoria");
    if (!select) return;

    select.innerHTML = '<option value="">Selecione...</option>';
    window.lerBanco().categorias.forEach(cat => {
        select.innerHTML += `<option value="${cat.nome}">${cat.nome}</option>`;
    });
}

function buscarNotasBancoLocal() {
    todasAsNotas = window.lerBanco().notas || [];
    aplicarFiltrosERenderizar(); 
    atualizarCabecalhosOrdenacao();
}

function aplicarFiltrosERenderizar() {
    const tbody = $("notas-tbody");
    if (!tbody) return;
    
    const busca = $("input-busca") ? $("input-busca").value.toLowerCase() : "";
    const urgencia = $("filter-urgencia") ? $("filter-urgencia").value : "";

    const filtradas = todasAsNotas.filter(n =>
        (n.titulo.toLowerCase().includes(busca) || n.categoria.toLowerCase().includes(busca)) &&
        (urgencia === "" || n.urgencia === urgencia)
    );

    filtradas.sort((a, b) => {
        let valA = "";
        let valB = "";

        if (ordenacaoColuna === "data") {
            valA = new Date(a.criadoEm);
            valB = new Date(b.criadoEm);
        } else if (ordenacaoColuna === "titulo") {
            valA = a.titulo.toLowerCase();
            valB = b.titulo.toLowerCase();
        } else if (ordenacaoColuna === "categoria") {
            valA = a.categoria.toLowerCase();
            valB = b.categoria.toLowerCase();
        } else if (ordenacaoColuna === "status") {
            valA = a.status.toLowerCase();
            valB = b.status.toLowerCase();
        } else if (ordenacaoColuna === "urgencia") {
            valA = a.urgencia.toLowerCase();
            valB = b.urgencia.toLowerCase();
        }

        if (valA < valB) {
            return ordenacaoDirecao === "asc" ? -1 : 1;
        }
        if (valA > valB) {
            return ordenacaoDirecao === "asc" ? 1 : -1;
        }
        return 0;
    });

    tbody.innerHTML = ""; 

    if (filtradas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">Nenhuma nota encontrada...</td></tr>`;
        return;
    }

    filtradas.forEach(nota => {
        const dataFmt = new Date(nota.criadoEm).toLocaleDateString("pt-BR");
        const clSts = `badge-${nota.status.toLowerCase().replace(' ', '')}`;

        tbody.innerHTML += `
            <tr>
                <td>
                    <strong>${nota.titulo}</strong><br>
                    <small style="color: gray;">${nota.descricao.substring(0, 40)}...</small>
                </td>
                <td>${nota.categoria}</td>
                <td>
                    <span class="urgency-text" data-urgency="${nota.urgencia}">${nota.urgencia}</span>
                </td>
                <td>
                    <span class="badge ${clSts}">${nota.status}</span>
                </td>
                <td>${dataFmt}</td>
                <td style="text-align: center;">
                    <button class="btn-row" onclick="editarNota('${nota.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-row del" onclick="excluirNota('${nota.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

function configurarOrdenacao() {
    document.querySelectorAll("th.sortable").forEach(th => {
        th.addEventListener("click", () => {
            const col = th.getAttribute("data-sort");
            if (ordenacaoColuna === col) {
                ordenacaoDirecao = (ordenacaoDirecao === "asc" ? "desc" : "asc");
            } else {
                ordenacaoColuna = col;
                ordenacaoDirecao = (col === "data" ? "desc" : "asc");
            }
            aplicarFiltrosERenderizar();
            atualizarCabecalhosOrdenacao();
        });
    });
}

function atualizarCabecalhosOrdenacao() {
    document.querySelectorAll("th.sortable").forEach(th => {
        const col = th.getAttribute("data-sort");
        const icon = th.querySelector(".sort-icon");
        
        if (col === ordenacaoColuna) {
            th.classList.add("active-sort");
            
            let pointingDown = true;
            if (col === "data") {
                pointingDown = (ordenacaoDirecao === "desc");
            } else {
                pointingDown = (ordenacaoDirecao === "asc");
            }
            
            if (pointingDown) {
                th.classList.remove("pointing-up");
                th.classList.add("pointing-down");
                if (icon) {
                    icon.className = "fa-solid fa-chevron-down sort-icon";
                }
            } else {
                th.classList.remove("pointing-down");
                th.classList.add("pointing-up");
                if (icon) {
                    icon.className = "fa-solid fa-chevron-up sort-icon";
                }
            }
        } else {
            th.classList.remove("active-sort", "pointing-down", "pointing-up");
            if (icon) {
                icon.className = "fa-solid fa-chevron-down sort-icon";
            }
        }
    });
}

window.editarNota = function (id) {
    const nota = todasAsNotas.find(n => String(n.id) === String(id));
    if (!nota) return;
    
    idEdicao = nota.id;
    
    $("modal-titulo-txt").innerText = "Editar Nota";
    $("f-titulo").value = nota.titulo;
    $("f-categoria").value = nota.categoria;
    $("f-status").value = nota.status;
    $("f-descricao").value = nota.descricao;
    $("f-urgencia").value = nota.urgencia;

    document.querySelectorAll('.btn-urgency').forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('data-val') === nota.urgencia) {
            b.classList.add('active');
        }
    });

    $("modal-nota").classList.add("open");
};

window.excluirNota = function (id) {
    if (confirm("Deseja realmente excluir esta nota?")) {
        const bd = window.lerBanco();
        bd.notas = bd.notas.filter(n => String(n.id) !== String(id)); 
        window.salvarBanco(bd); 
        window.mostrarToast("Nota excluída com sucesso.");
        buscarNotasBancoLocal(); 
    }
};

function fecharModal() {
    $("modal-nota").classList.remove("open");
    $("form-nota").reset();
    idEdicao = null;
    
    document.querySelectorAll('.btn-urgency').forEach(b => b.classList.remove('active'));
    const btnBaixa = document.querySelector('.btn-urgency[data-val="Baixa"]');
    if (btnBaixa) {
        btnBaixa.classList.add('active');
    }
    
    const fUrgencia = $("f-urgencia");
    if (fUrgencia) {
        fUrgencia.value = "Baixa";
    }
}

function verificarEstoqueCritico(produtos) {
    const container = $("estoque-alerta-container");
    const lista = $("lista-estoque-critico");
    if (!container || !lista) return;

    
    const criticos = (produtos || []).filter(p => {
        const min = typeof p.estoqueMinimo !== 'undefined' ? Number(p.estoqueMinimo) : 0;
        return Number(p.quantidade) <= min;
    });

    if (criticos.length > 0) {
        lista.innerHTML = "";
        criticos.forEach(p => {
            const min = typeof p.estoqueMinimo !== 'undefined' ? p.estoqueMinimo : 0;
            lista.innerHTML += `<li>O produto <strong>${p.nome}</strong> está com apenas <strong>${p.quantidade} un.</strong> em estoque (mínimo exigido: ${min} un.).</li>`;
        });
        container.style.display = "block";
    } else {
        container.style.display = "none";
    }
}
