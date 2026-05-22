"use strict";

const $ = (id) => document.getElementById(id);

/* ==========================================
   INICIALIZAÇÃO
========================================== */

window.onload = () => {
    aplicarConfiguracoesIniciais();
    configurarAbas();
    carregarAvaliacoes();
    configurarFAQ();
    configurarFAQLoadMore();
    configurarFormulario();
};

/* ==========================================
   CONFIGURAÇÕES
========================================== */

function aplicarConfiguracoesIniciais() {

    const nome =
        localStorage.getItem("st_nome")
        || "Pedro";

    const email =
        localStorage.getItem("st_email")
        || "pedro@stocktech.com";

    const cargo =
        localStorage.getItem("st_cargo")
        || "Gerente de Operações";

    const tema =
        localStorage.getItem("st_tema")
        || "light";

    if ($("nav-name"))
        $("nav-name").innerText =
            nome.split(" ")[0];

    if ($("nav-avatar"))
        $("nav-avatar").innerText =
            nome.substring(0, 2).toUpperCase();

    if ($("drop-name"))
        $("drop-name").innerText = nome;

    if ($("drop-email"))
        $("drop-email").innerText = email;

    if ($("drop-cargo"))
        $("drop-cargo").innerText = cargo;

    if ($("cfg-nome"))
        $("cfg-nome").value = nome;

    if ($("cfg-email"))
        $("cfg-email").value = email;

    if ($("cfg-cargo"))
        $("cfg-cargo").value = cargo;

    if ($("cfg-tema"))
        $("cfg-tema").value = tema;

    aplicarTema(tema);
}

function aplicarTema(tema) {

    if (tema === "dark") {

        document.body.setAttribute(
            "data-theme",
            "dark"
        );

    } else {

        document.body.removeAttribute(
            "data-theme"
        );
    }
}

/* ==========================================
   MODAL CONFIG
========================================== */

if ($("btn-config")) {

    $("btn-config").addEventListener(
        "click",
        () => {
            $("modal-config")
                ?.classList.add("open");
        }
    );
}

function fecharModalConfig() {

    $("modal-config")
        ?.classList.remove("open");
}

$("btn-fechar-config")
?.addEventListener(
    "click",
    fecharModalConfig
);

$("btn-cancelar-config")
?.addEventListener(
    "click",
    fecharModalConfig
);

$("btn-salvar-config")
?.addEventListener(
    "click",
    () => {

        localStorage.setItem(
            "st_nome",
            $("cfg-nome").value
        );

        localStorage.setItem(
            "st_email",
            $("cfg-email").value
        );

        localStorage.setItem(
            "st_cargo",
            $("cfg-cargo").value
        );

        localStorage.setItem(
            "st_tema",
            $("cfg-tema").value
        );

        aplicarConfiguracoesIniciais();

        fecharModalConfig();

        mostrarToast(
            "Configurações salvas!"
        );
    }
);

/* ==========================================
   ABAS CONFIGURAÇÃO
========================================== */

function configurarAbas() {

    const tabs =
        document.querySelectorAll(
            ".config-tab"
        );

    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".config-tab")
                    .forEach(btn => {
                        btn.classList.remove("active");
                    });

                document
                    .querySelectorAll(".config-pane")
                    .forEach(pane => {

                        pane.classList.remove("active");
                        pane.style.display = "none";
                    });

                tab.classList.add("active");

                const alvo =
                    document.getElementById(
                        tab.dataset.tab
                    );

                if (alvo) {

                    alvo.style.display = "block";
                    alvo.classList.add("active");
                }
            }
        );
    });
}

/* ==========================================
   TOAST
========================================== */

function mostrarToast(msg) {

    const container =
        $("toast-container");

    if (!container) return;

    const div =
        document.createElement("div");

    div.className = "toast";
    div.innerHTML = msg;

    container.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 3000);
}

/* ==========================================
   FAQ
========================================== */

function configurarFAQ() {

    document
        .querySelectorAll(".faq-btn")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    const card =
                        btn.closest(".faq-card");

                    if (!card) return;

                    card.classList.toggle("active");

                    btn.innerText =
                        card.classList.contains("active")
                            ? "Ler menos"
                            : "Ler mais";
                }
            );
        });

    const search = $("faqSearch");

    if (search) {

        search.addEventListener(
            "input",
            () => {

                const value =
                    search.value.toLowerCase();

                document
                    .querySelectorAll(".faq-card")
                    .forEach(card => {

                        card.style.display =
                            card.innerText
                                .toLowerCase()
                                .includes(value)
                                ? "flex"
                                : "none";
                    });
            }
        );
    }
}

/* ==========================================
   FAQ LOAD MORE
========================================== */

function configurarFAQLoadMore() {

    const btn =
        $("toggleFaq");

    const cards =
        document.querySelectorAll(".faq-card");

    if (!btn) return;

    const limite = 3;
    let aberto = false;

    function atualizarFAQ() {

        cards.forEach(
            (card, index) => {

                if (index < limite) {

                    card.style.display = "flex";

                } else {

                    card.style.display =
                        aberto
                            ? "flex"
                            : "none";
                }
            }
        );

        btn.innerText =
            aberto
                ? "Fechar artigos"
                : "Carregar mais artigos";
    }

    btn.addEventListener(
        "click",
        () => {

            aberto = !aberto;
            atualizarFAQ();
        }
    );

    atualizarFAQ();
}

/* ==========================================
   CRUD AVALIAÇÕES
========================================== */

const API_URL =
    "http://localhost:3000/avaliacoes";

async function carregarAvaliacoes() {

    try {

        const resposta =
            await fetch(API_URL);

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar avaliações"
            );
        }

        const avaliacoes =
            await resposta.json();

        const lista =
            $("listaAvaliacoes");

        if (!lista) return;

        lista.innerHTML = "";

        avaliacoes.forEach(item => {

            lista.innerHTML += `
                <div class="avaliacao-card">
                    <h3>${item.nome}</h3>
                    <small>${item.funcao}</small>
                    <p>${item.avaliacao}</p>
                </div>
            `;
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar avaliações:",
            erro
        );

        mostrarToast(
            "Erro ao carregar avaliações"
        );
    }
}

$("btnEnviar")
?.addEventListener(
    "click",
    async () => {

        const nome =
            $("nome")?.value.trim();

        const funcao =
            $("funcao")?.value.trim();

        const avaliacao =
            $("avaliacao")?.value.trim();

        if (
            !nome ||
            !funcao ||
            !avaliacao
        ) {

            alert(
                "Preencha todos os campos!"
            );

            return;
        }

        try {

            const resposta =
                await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        nome,
                        funcao,
                        avaliacao
                    })
                });

            if (!resposta.ok) {

                throw new Error(
                    "Erro ao enviar"
                );
            }

            $("nome").value = "";
            $("funcao").value = "";
            $("avaliacao").value = "";

            mostrarToast(
                "Avaliação enviada!"
            );

            carregarAvaliacoes();

        } catch (erro) {

            console.error(
                "Erro ao enviar avaliação:",
                erro
            );

            alert(
                "Erro ao enviar avaliação!\nVerifique se o JSON Server está rodando."
            );
        }
    }
);

/* ==========================================
   MOSTRAR / ESCONDER FORM
========================================== */

function configurarFormulario() {

    const toggleFormulario =
        $("toggleFormulario");

    const formulario =
        $("formularioAvaliacao");

    if (
        !toggleFormulario ||
        !formulario
    ) return;

    toggleFormulario.addEventListener(
        "click",
        () => {

            formulario.classList.toggle(
                "active"
            );

            if (
                formulario.classList.contains(
                    "active"
                )
            ) {

                toggleFormulario.innerText =
                    "Fechar avaliação";

            } else {

                toggleFormulario.innerText =
                    "Fazer avaliação";
            }
        }
    );
}