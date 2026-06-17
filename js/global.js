

"use strict";


(function verificarAutenticacao() {
    const path = window.location.pathname.toLowerCase();
    
    if (path.includes('/pages/') && !path.includes('/login/')) {
        if (sessionStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = "../login/login.html";
        }
    }
})();

const DADOS_INICIAIS = {
    categorias: [
        { id: "1", nome: "Logística & Estoque" },
        { id: "2", nome: "Financeiro" },
        { id: "3", nome: "Comercial & Vendas" },
        { id: "4", nome: "TI & Sistemas" }
    ],
    produtos: [],
    vendas: [],
    movimentacoesGrafico: [],
    notas: [],
    contasPagar: [],
    movimentacoes: [],
    contatos: [],
    avaliacoes: []
};


window.iniciarBancoDeDados = function() {
    if (!localStorage.getItem("stockTechDB")) {
        localStorage.setItem("stockTechDB", JSON.stringify(DADOS_INICIAIS));
    }
};

window.lerBanco = function() {
    window.iniciarBancoDeDados();
    return JSON.parse(localStorage.getItem("stockTechDB"));
};

window.salvarBanco = function(dados) {
    localStorage.setItem("stockTechDB", JSON.stringify(dados));
};


function injetarSidebar() {
    const container = document.getElementById("sidebar-container");
    if (!container) return;

    
    
    container.outerHTML = `
    <!-- Overlay para Responsividade do Menu Lateral -->
    <div class="sidebar-overlay" id="sidebar-overlay"></div>

    <nav class="sidebar" id="sidebar">
        <div class="logo">
            <i class="fa-solid fa-box-archive"></i>
            <h2 class="logo-text">Stock<span>.tech</span></h2>
        </div>

        <div class="menu-container">
            <div class="categoria">
                <p class="titulo-categoria">Visão Geral</p>
                <ul>
                    <li><a href="../dashboard/dashboard.html" id="link-dashboard"><i class="fa-solid fa-chart-line"></i> <span>Dashboard</span></a></li>
                    <li><a href="../financeiro/financeiro.html" id="link-financeiro"><i class="fa-solid fa-money-bill-wave"></i> <span>Financeiro</span></a></li>
                </ul>
            </div>
            <div class="categoria">
                <p class="titulo-categoria">Estoque</p>
                <ul>
                    <li><a href="../movimentacoes/movimentacoes.html" id="link-movimentacoes"><i class="fa-solid fa-truck-ramp-box"></i> <span>Movimentações</span></a></li>
                    <li><a href="../produtos/produtos.html" id="link-produtos"><i class="fa-solid fa-box-open"></i> <span>Produtos</span></a></li>
                </ul>
            </div>
            <div class="categoria">
                <p class="titulo-categoria">Comercial</p>
                <ul>
                    <li><a href="../pedidos/pedidos.html" id="link-pedidos"><i class="fa-solid fa-cart-shopping"></i> <span>Pedido de Vendas</span></a></li>
                    <li><a href="../contatos/contatos.html" id="link-contatos"><i class="fa-solid fa-address-book"></i> <span>Contatos</span></a></li>
                </ul>
            </div>
            <div class="categoria">
                <p class="titulo-categoria">Ajuda</p>
                <ul>
                    <li><a href="../faq/faq.html" id="link-faq"><i class="fa-solid fa-circle-question"></i> <span>FAQ</span></a></li>
                </ul>
            </div>
        </div>

        <div class="sidebar-footer">
            <a href="#" class="btn-sair" id="btn-sair-global">
                <i class="fa-solid fa-right-from-bracket"></i> <span>Desconectar</span>
            </a>
        </div>
    </nav>
    `;

    
    const path = window.location.pathname.toLowerCase();
    if (path.includes("/dashboard/")) {
        document.getElementById("link-dashboard")?.classList.add("active");
    } else if (path.includes("/financeiro/")) {
        document.getElementById("link-financeiro")?.classList.add("active");
    } else if (path.includes("/movimentacoes/")) {
        document.getElementById("link-movimentacoes")?.classList.add("active");
    } else if (path.includes("/produtos/")) {
        document.getElementById("link-produtos")?.classList.add("active");
    } else if (path.includes("/pedidos/")) {
        document.getElementById("link-pedidos")?.classList.add("active");
    } else if (path.includes("/contatos/")) {
        document.getElementById("link-contatos")?.classList.add("active");
    } else if (path.includes("/faq/")) {
        document.getElementById("link-faq")?.classList.add("active");
    }
}

function injetarTopbar(titulo = "") {
    const container = document.getElementById("topbar-container");
    if (!container) return;

    if (!titulo) {
        
        titulo = document.title.split("·")[0].trim();
    }

    container.outerHTML = `
    <header class="topbar">
      <div class="topbar-left">
        <button class="icon-btn" id="btn-toggle-sidebar" title="Abrir Menu" style="margin-right: 15px;">
          <i class="fa-solid fa-bars"></i>
        </button>
        <h2 class="topbar-title">${titulo}</h2>
      </div>
      
      <div class="topbar-right">
        <!-- Notificações (Sininho) -->
        <div class="nav-item has-dropdown notification-dropdown-wrap">
          <button class="icon-btn" id="btn-notifications" title="Notificações" style="position: relative;">
            <i class="fa-solid fa-bell"></i>
            <span id="notification-badge" style="display: none; position: absolute; top: -5px; right: -5px; background: #d32f2f; color: white; border-radius: 50%; font-size: 10px; font-weight: bold; width: 16px; height: 16px; align-items: center; justify-content: center;">0</span>
          </button>
          <div class="dropdown-menu notification-menu" id="notification-menu" style="width: 300px; padding: 15px; border-radius: var(--r-md); box-shadow: var(--shadow-hover); position: absolute; top: 120%; right: 0; background-color: var(--card-bg); border: 1px solid var(--border-color); opacity: 0; visibility: hidden; transition: 0.2s; z-index: 200; transform: translateY(10px);">
             <div style="font-weight: 700; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; color: var(--text-dark); text-align: left;">
                Alertas do Sistema
             </div>
             <ul id="notification-list" style="list-style: none; padding: 0; margin: 0; max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: var(--text-muted); text-align: left;">
                <li>Sem novos alertas.</li>
             </ul>
          </div>
        </div>

        <div class="nav-item">
          <button class="icon-btn" id="btn-config" title="Configurações">
            <i class="fa-solid fa-gear"></i>
          </button>
        </div>

        <div class="nav-item has-dropdown user-chip-wrap">
          <div class="user-chip">
            <div class="chip-avatar" id="nav-avatar">AD</div>
            <span class="chip-name" id="nav-name">Admin</span>
          </div>
          <div class="dropdown-menu profile-menu">
            <div class="profile-header">
              <strong id="drop-name">Administrador Geral</strong>
              <small id="drop-email">admin@stocktech.com</small>
            </div>
            <div class="profile-body">
              <p id="drop-cargo">Gerente de Operações</p>
            </div>
          </div>
        </div>
      </div>
    </header>
    `;
}

function injetarModalConfig() {
    const container = document.getElementById("modal-config-container");
    if (!container) return;

    container.outerHTML = `
    <div class="modal-overlay" id="modal-config">
      <div class="modal-box modal-lg">
        <div class="modal-head">
          <h3>Configurações</h3>
          <button class="modal-close" id="btn-fechar-config-x">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div class="config-layout">
          <div class="config-nav">
            <button class="config-tab active" data-tab="tab-perfil">Meu Perfil</button>
            <button class="config-tab" data-tab="tab-aparencia">Aparência</button>
          </div>
          
          <div class="config-content">
            <!-- Aba: Perfil -->
            <div id="tab-perfil" class="config-pane active">
              <h4>Informações Pessoais</h4>
              <p class="text-muted mb-15">Atualize seus dados de contato.</p>
              
              <div class="form-group">
                <label class="form-label">Nome Completo</label>
                <input type="text" class="form-control" id="cfg-nome" value="Administrador Geral" />
              </div>
              <div class="form-group">
                <label class="form-label">E-mail</label>
                <input type="email" class="form-control" id="cfg-email" value="admin@stocktech.com" />
              </div>
              <div class="form-group">
                <label class="form-label">Cargo</label>
                <input type="text" class="form-control" id="cfg-cargo" value="Gerente de Operações" />
              </div>
            </div>

            <!-- Aba: Aparência -->
            <div id="tab-aparencia" class="config-pane" style="display: none;">
              <h4>Aparência do Sistema</h4>
              <p class="text-muted mb-15">Personalize o tema da plataforma.</p>
              
              <div class="form-group">
                <label class="form-label">Tema da Interface</label>
                <select class="form-control" id="cfg-tema">
                  <option value="light">Claro (Padrão)</option>
                  <option value="dark">Escuro (Dark Mode)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-foot">
          <button class="btn-ghost" id="btn-cancelar-config">Cancelar</button>
          <button class="btn-primary" id="btn-salvar-config">Salvar Mudanças</button>
        </div>
      </div>
    </div>
    `;
}


window.aplicarConfiguracoesIniciais = function() {
    const nome = localStorage.getItem("st_nome") || "Administrador Geral";
    const email = localStorage.getItem("st_email") || "admin@stocktech.com";
    const cargo = localStorage.getItem("st_cargo") || "Gerente de Operações";
    const tema = localStorage.getItem("st_tema") || "light";

    const navName = document.getElementById("nav-name");
    const navAvatar = document.getElementById("nav-avatar");
    const dropName = document.getElementById("drop-name");
    const dropEmail = document.getElementById("drop-email");
    const dropCargo = document.getElementById("drop-cargo");

    if (navName) navName.innerText = nome.split(" ")[0];
    if (navAvatar) navAvatar.innerText = nome.substring(0, 2).toUpperCase();
    if (dropName) dropName.innerText = nome;
    if (dropEmail) dropEmail.innerText = email;
    if (dropCargo) dropCargo.innerText = cargo;

    const cfgNome = document.getElementById("cfg-nome");
    const cfgEmail = document.getElementById("cfg-email");
    const cfgCargo = document.getElementById("cfg-cargo");
    const cfgTema = document.getElementById("cfg-tema");

    if (cfgNome) cfgNome.value = nome;
    if (cfgEmail) cfgEmail.value = email;
    if (cfgCargo) cfgCargo.value = cargo;
    if (cfgTema) cfgTema.value = tema;

    if (tema === "dark") {
        document.body.setAttribute("data-theme", "dark");
    } else {
        document.body.removeAttribute("data-theme");
    }
};

window.mostrarToast = function(msg, tipo = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const div = document.createElement("div");
    div.className = "toast";
    if (tipo === "error" || tipo === "danger") {
        div.style.background = "#d32f2f";
        div.style.borderLeftColor = "#fca5a5";
        div.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${msg}`;
    } else if (tipo === "warning") {
        div.style.background = "#f57c00";
        div.style.borderLeftColor = "#ffcc80";
        div.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
    } else {
        div.innerHTML = `<i class="fa-solid fa-check"></i> ${msg}`;
    }
    
    container.appendChild(div);
    
    setTimeout(() => {
        div.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => div.remove(), 310);
    }, 3000); 
};


document.addEventListener("DOMContentLoaded", () => {
    
    window.iniciarBancoDeDados();

    
    injetarSidebar();
    injetarTopbar();
    injetarModalConfig();

    
    window.aplicarConfiguracoesIniciais();

    
    const btnToggle = document.getElementById("btn-toggle-sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const sidebar = document.getElementById("sidebar");

    if (btnToggle && sidebar && overlay) {
        btnToggle.addEventListener("click", () => {
            sidebar.classList.add("open");
            overlay.classList.add("active");
        });

        overlay.addEventListener("click", () => {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        });
    }

    const btnConfig = document.getElementById("btn-config");
    const modalConfig = document.getElementById("modal-config");
    if (btnConfig && modalConfig) {
        btnConfig.addEventListener("click", () => {
            modalConfig.classList.add("open");
        });
    }

    const fecharConfigX = document.getElementById("btn-fechar-config-x");
    const cancelarConfig = document.getElementById("btn-cancelar-config");
    if (modalConfig) {
        const fechar = () => modalConfig.classList.remove("open");
        fecharConfigX?.addEventListener("click", fechar);
        cancelarConfig?.addEventListener("click", fechar);
    }

    const btnSalvar = document.getElementById("btn-salvar-config");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", () => {
            const nomeVal = document.getElementById("cfg-nome")?.value || "Administrador Geral";
            const emailVal = document.getElementById("cfg-email")?.value || "admin@stocktech.com";
            const cargoVal = document.getElementById("cfg-cargo")?.value || "Gerente de Operações";
            const temaVal = document.getElementById("cfg-tema")?.value || "light";

            localStorage.setItem("st_nome", nomeVal);
            localStorage.setItem("st_email", emailVal);
            localStorage.setItem("st_cargo", cargoVal);
            localStorage.setItem("st_tema", temaVal);
            
            window.aplicarConfiguracoesIniciais();
            modalConfig?.classList.remove("open");
            window.mostrarToast("Configurações salvas!");
        });
    }

    
    document.querySelectorAll('.config-tab').forEach(botao => {
        botao.addEventListener('click', () => {
            document.querySelectorAll('.config-tab').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.config-pane').forEach(p => {
                p.style.display = 'none';
            });
            
            botao.classList.add('active');
            const targetTab = document.getElementById(botao.getAttribute('data-tab'));
            if (targetTab) {
                targetTab.style.display = 'block';
            }
        });
    });

    const btnSair = document.getElementById("btn-sair-global");
    if (btnSair) {
        btnSair.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("Deseja realmente desconectar?")) {
                window.mostrarToast("Desconectando...");
                sessionStorage.removeItem('isLoggedIn');
                setTimeout(() => {
                    window.location.href = "../login/login.html";
                }, 500);
            }
        });
    }

    
    atualizarNotificacoesEstoque();
});

function atualizarNotificacoesEstoque() {
    const bd = window.lerBanco();
    const produtos = bd.produtos || [];
    
    
    const criticos = produtos.filter(p => {
        const min = typeof p.estoqueMinimo !== 'undefined' ? Number(p.estoqueMinimo) : 0;
        return Number(p.quantidade) <= min;
    });

    const badge = document.getElementById("notification-badge");
    const list = document.getElementById("notification-list");
    const menuNotif = document.getElementById("notification-menu");

    if (!list) return;

    if (criticos.length > 0) {
        if (badge) {
            badge.innerText = criticos.length;
            badge.style.display = "inline-flex";
        }

        list.innerHTML = "";
        criticos.forEach(p => {
            const min = typeof p.estoqueMinimo !== 'undefined' ? p.estoqueMinimo : 0;
            list.innerHTML += `
                <li style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; display: flex; gap: 6px; flex-direction: column;">
                   <span style="color: #d32f2f; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                      <i class="fa-solid fa-circle-exclamation"></i> Estoque Crítico
                   </span> 
                   <span>O produto <strong>${p.nome}</strong> está com apenas <strong>${p.quantidade} un.</strong> no estoque (mínimo de ${min} un.).</span>
                </li>`;
        });

        
        if (!sessionStorage.getItem("alertaEstoqueToastExibido")) {
            setTimeout(() => {
                window.mostrarToast(`Atenção: Existem ${criticos.length} produto(s) com estoque crítico!`, "warning");
                sessionStorage.setItem("alertaEstoqueToastExibido", "true");
            }, 1000);
        }
    } else {
        if (badge) badge.style.display = "none";
        list.innerHTML = `<li style="text-align: center; padding: 10px 0; color: var(--text-muted);">Nenhum alerta crítico no momento.</li>`;
    }

    
    const wrap = document.querySelector(".notification-dropdown-wrap");
    if (wrap && menuNotif) {
        wrap.addEventListener("mouseenter", () => {
            menuNotif.style.opacity = "1";
            menuNotif.style.visibility = "visible";
            menuNotif.style.transform = "translateY(0)";
        });
        wrap.addEventListener("mouseleave", () => {
            menuNotif.style.opacity = "0";
            menuNotif.style.visibility = "hidden";
            menuNotif.style.transform = "translateY(10px)";
        });
    }
}
