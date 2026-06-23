

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes("novo-produto.html")) {
        iniciarFormularioProduto();
    } else {
        iniciarListagemProdutos();
    }
});


function iniciarListagemProdutos() {
    const grid = document.getElementById("produtosGrid");
    const filtroChips = document.getElementById("filtroChips");
    let filtroAtivo = "todos";

    
    const bd = window.lerBanco();
    const categorias = bd.categorias || [];
    
    categorias.forEach(cat => {
        const span = document.createElement("span");
        span.className = "chip";
        span.setAttribute("data-categoria", cat.nome);
        span.innerText = cat.nome;
        filtroChips.appendChild(span);
    });

    
    renderizarProdutos(bd.produtos || [], filtroAtivo);

    
    document.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            filtroAtivo = chip.getAttribute("data-categoria");
            
            const bdAtual = window.lerBanco();
            renderizarProdutos(bdAtual.produtos || [], filtroAtivo);
        });
    });

    
    function renderizarProdutos(lista, categoriaFiltro) {
        grid.innerHTML = "";

        const filtrados = categoriaFiltro === "todos" 
            ? lista 
            : lista.filter(p => p.categoria === categoriaFiltro);

        if (filtrados.length === 0) {
            return; 
        }

        const coresPlaceholder = ["placeholder-rosa", "placeholder-amarelo", "placeholder-azul", "placeholder-roxo", "placeholder-verde", "placeholder-laranja"];

        filtrados.forEach((prod, index) => {
            const card = document.createElement("div");
            card.className = "produto-card";

            const corClass = coresPlaceholder[index % coresPlaceholder.length];
            const precoVendaFmt = Number(prod.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            card.innerHTML = `
                <div class="produto-imagem ${corClass}">
                    <i class="fa-solid fa-box-open" style="font-size: 48px;"></i>
                </div>
                <h3 class="produto-nome">${prod.nome}</h3>
                <span class="produto-id">Cód: ${prod.codigo || '—'} | ID: ${prod.id}</span>
                <p class="produto-descricao">${prod.descricao || 'Sem descrição cadastrada para este produto.'}</p>
                <div class="produto-info-extra">
                    <span>Qtd: ${prod.quantidade} ${prod.unidade || 'UN'}</span>
                    <span>${precoVendaFmt}</span>
                </div>
                <div class="produto-acoes">
                    <button class="btn-editar" title="Editar"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-excluir" title="Excluir"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;

            
            card.querySelector(".btn-editar").addEventListener("click", () => {
                window.location.href = `novo-produto.html?id=${prod.id}`;
            });

            card.querySelector(".btn-excluir").addEventListener("click", () => {
                if (confirm(`Deseja realmente excluir o produto "${prod.nome}"?`)) {
                    excluirProduto(prod.id);
                }
            });

            grid.appendChild(card);
        });
    }

    function excluirProduto(id) {
        const bdAtual = window.lerBanco();
        bdAtual.produtos = bdAtual.produtos.filter(p => String(p.id) !== String(id));
        window.salvarBanco(bdAtual);
        window.mostrarToast("Produto excluído com sucesso!");
        
        
        renderizarProdutos(bdAtual.produtos, filtroAtivo);
    }
}


function iniciarFormularioProduto() {
    const form = document.getElementById("formProduto");
    const selectCat = document.getElementById("categoria");
    const btnNovaCat = document.getElementById("btnNovaCategoria");
    const novaCatBox = document.getElementById("novaCategoriaBox");
    const inputNovaCat = document.getElementById("inputNovaCategoria");
    const btnSalvarCat = document.getElementById("btnSalvarCategoria");
    
    const inputId = document.getElementById("produto-id");
    const inputNome = document.getElementById("nomeProduto");
    const inputCodigo = document.getElementById("codigoProduto");
    const inputCusto = document.getElementById("precoCusto");
    const inputVenda = document.getElementById("precoVenda");
    const inputQuantidade = document.getElementById("quantidade");
    const inputEstoqueMinimo = document.getElementById("estoqueMinimo");
    const inputUnidade = document.getElementById("unidade");
    const inputDescricao = document.getElementById("descricao");

    
    function carregarSelectCategorias(selecionar = "") {
        const bd = window.lerBanco();
        selectCat.innerHTML = '<option value="">Selecione...</option>';
        bd.categorias.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.nome;
            opt.innerText = cat.nome;
            if (cat.nome === selecionar) opt.selected = true;
            selectCat.appendChild(opt);
        });
    }
    carregarSelectCategorias();

    
    btnNovaCat.addEventListener("click", () => {
        novaCatBox.style.display = novaCatBox.style.display === "none" || novaCatBox.style.display === "" 
            ? "flex" 
            : "none";
    });

    btnSalvarCat.addEventListener("click", () => {
        const nomeNova = inputNovaCat.value.trim();
        if (!nomeNova) return;

        const bd = window.lerBanco();
        const existe = bd.categorias.some(c => c.nome.toLowerCase() === nomeNova.toLowerCase());

        if (existe) {
            window.mostrarToast("Categoria já existente!", "warning");
            return;
        }

        bd.categorias.push({
            id: Date.now().toString(),
            nome: nomeNova
        });

        window.salvarBanco(bd);
        carregarSelectCategorias(nomeNova);
        inputNovaCat.value = "";
        novaCatBox.style.display = "none";
        window.mostrarToast("Categoria criada!");
    });

    
    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get("id");

    if (prodId) {
        const bd = window.lerBanco();
        const produto = bd.produtos.find(p => String(p.id) === String(prodId));

        if (produto) {
            document.getElementById("tituloPagina").innerText = "Editar Produto";
            inputId.value = produto.id;
            inputNome.value = produto.nome;
            inputCodigo.value = produto.codigo || "";
            inputCusto.value = produto.precoCusto || "";
            inputVenda.value = produto.preco || "";
            inputQuantidade.value = produto.quantidade || "0";
            if (inputEstoqueMinimo) {
                inputEstoqueMinimo.value = typeof produto.estoqueMinimo !== 'undefined' ? produto.estoqueMinimo : "0";
            }
            inputUnidade.value = produto.unidade || "UN";
            inputDescricao.value = produto.descricao || "";
            
            carregarSelectCategorias(produto.categoria);
        }
    }

    
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const bd = window.lerBanco();
        const idVal = inputId.value;
        
        const dados = {
            id: idVal || Date.now().toString(),
            nome: inputNome.value.trim(),
            codigo: inputCodigo.value.trim(),
            precoCusto: parseFloat(inputCusto.value),
            preco: parseFloat(inputVenda.value),
            quantidade: parseInt(inputQuantidade.value),
            estoqueMinimo: inputEstoqueMinimo ? parseInt(inputEstoqueMinimo.value) || 0 : 0,
            categoria: selectCat.value,
            unidade: inputUnidade.value.trim() || "UN",
            descricao: inputDescricao.value.trim(),
            vendasNoMes: idVal ? (bd.produtos.find(p => String(p.id) === String(idVal))?.vendasNoMes || 0) : 0
        };

        if (idVal) {
            
            const idx = bd.produtos.findIndex(p => String(p.id) === String(idVal));
            if (idx !== -1) bd.produtos[idx] = dados;
        } else {
            
            bd.produtos.push(dados);
        }

        if (!idVal) {
            bd.movimentacoes = bd.movimentacoes || [];
            bd.movimentacoes.push({
                id: `MOV-${String(bd.movimentacoes.length + 1).padStart(3, "0")}`,
                nome: dados.nome,
                tipo: "entrada",
                categoria: dados.categoria,
                valor: dados.precoCusto * dados.quantidade,
                data: new Date().toISOString().split('T')[0],
                descricao: "Estoque inicial do produto cadastrado"
            });
        }

        window.salvarBanco(bd);
        window.mostrarToast(idVal ? "Produto editado com sucesso!" : "Produto cadastrado com sucesso!");

        
        setTimeout(() => {
            window.location.href = "produtos.html";
        }, 800);
    });
}
