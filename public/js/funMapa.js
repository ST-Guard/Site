console.log("FUNMAP.JS CARREGOU");

function fnNavegar(caminho) {
    window.location.href = caminho;
}

const idUsuario = sessionStorage.getItem("ID_USUARIO");
const idEmpresa = sessionStorage.getItem("FK_EMPRESA");
const nomeEmpresa = sessionStorage.getItem("NOME_EMPRESA") || "Steam";

let regioesEmpresa = [];
let regioesGestor = [];
let dadosGestoraOp = null;

function iniciarMapa() {
    console.log("Iniciando mapa...");
    fecharPopupRegiao();
    carregarMapaOperacional();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarMapa);
} else {
    iniciarMapa();
}

async function carregarMapaOperacional() {
    try {
        console.log("ENTROU NA carregarMapaOperacional");
        console.log("ID_USUARIO:", idUsuario);
        console.log("FK_EMPRESA:", idEmpresa);
        console.log("NOME_EMPRESA:", nomeEmpresa);

        if (!idUsuario || idUsuario === "undefined") {
            console.error("ID_USUARIO não encontrado no sessionStorage");
            return;
        }

        if (!idEmpresa || idEmpresa === "undefined") {
            console.error("FK_EMPRESA não encontrado no sessionStorage");
            return;
        }

        const respostaEmpresa = await fetch(`/dashOperacional/listarRegioesDaEmpresa/${idEmpresa}`);

        if (!respostaEmpresa.ok) {
            const erro = await respostaEmpresa.text();
            console.error("Erro ao buscar regiões da empresa:", erro);
            return;
        }

        regioesEmpresa = await respostaEmpresa.json();
        console.log("Regiões da empresa:", regioesEmpresa);

        const respostaGestor = await fetch(`/dashOperacional/listarRegioes/${idUsuario}`);

        if (!respostaGestor.ok) {
            const erro = await respostaGestor.text();
            console.error("Erro ao buscar regiões do gestor:", erro);
            return;
        }

        regioesGestor = await respostaGestor.json();
        console.log("Regiões do gestor:", regioesGestor);

        const respostaJson = await fetch("/dashOperacional/buscarGestoraOpJson");

        if (!respostaJson.ok) {
            const erro = await respostaJson.text();
            console.error("Erro ao buscar JSON da gestora:", erro);

            dadosGestoraOp = null;
            renderizarMapa();
            return;
        }

        dadosGestoraOp = await respostaJson.json();
        console.log("JSON gestora OP:", dadosGestoraOp);

        renderizarMapa();

    } catch (erro) {
        console.error("Erro ao carregar mapa operacional:", erro);
    }
}

function renderizarMapa() {
    const todosEstadosDoMapa = document.querySelectorAll("#map .state");

    if (!todosEstadosDoMapa || todosEstadosDoMapa.length === 0) {
        console.error("Nenhum estado encontrado no SVG. Verifique se existe #map .state no HTML.");
        return;
    }

    const regioesEmpresaFormatadas = regioesEmpresa.map(regiao => {
        return {
            idRegiao: regiao.idRegiao,
            uf: String(regiao.uf).toLowerCase(),
            cidade: regiao.cidade
        };
    });

    const regioesGestorFormatadas = regioesGestor.map(regiao => {
        return {
            idRegiao: regiao.idRegiao,
            uf: String(regiao.uf).toLowerCase(),
            cidade: regiao.cidade
        };
    });

    console.log("EMPRESA FORMATADA:", regioesEmpresaFormatadas);
    console.log("GESTOR FORMATADO:", regioesGestorFormatadas);

    todosEstadosDoMapa.forEach(estadoMapa => {
        const ufMapa = estadoMapa.dataset.state.toLowerCase();

        limparClassesRegiao(estadoMapa);

        const regiaoDaEmpresa = regioesEmpresaFormatadas.find(regiao => regiao.uf === ufMapa);
        const regiaoDoGestor = regioesGestorFormatadas.find(regiao => regiao.uf === ufMapa);

        console.log("UF MAPA:", ufMapa, {
            regiaoDaEmpresa,
            regiaoDoGestor
        });

        // Caso 1: empresa NÃO tem datacenter nessa região
        if (!regiaoDaEmpresa) {
            estadoMapa.classList.add("regiao-sem-datacenter");

            aplicarEstiloVisualDireto(estadoMapa, false, false, null);

            estadoMapa.onclick = function (event) {
                event.preventDefault();
                alert("Esta empresa não possui datacenters nesta região.");
            };

            return;
        }

        // Caso 2/3: empresa tem datacenter nessa região
        const scoreRegiao = buscarScoreRegiaoNoJson(ufMapa);
        const statusRegiao = converterScoreParaStatus(scoreRegiao);

        console.log("SCORE DO JSON PARA", ufMapa, "=", scoreRegiao);
        console.log("STATUS CALCULADO PARA", ufMapa, "=", statusRegiao);

        aplicarSaudeNoMapa(estadoMapa, statusRegiao);

        // Caso 2: empresa tem datacenter, mas gestor NÃO tem acesso
        if (!regiaoDoGestor) {
            estadoMapa.classList.add("regiao-bloqueada");

            aplicarEstiloVisualDireto(estadoMapa, true, false, scoreRegiao);

            estadoMapa.onclick = function (event) {
                event.preventDefault();
                alert("Você não possui acesso aos datacenters desta região.");
            };

            return;
        }

        // Caso 3: empresa tem datacenter e gestor tem acesso
        estadoMapa.classList.add("regiao-permitida");

        aplicarEstiloVisualDireto(estadoMapa, true, true, scoreRegiao);

        estadoMapa.onclick = function (event) {
            event.preventDefault();

            sessionStorage.setItem("ID_REGIAO", regiaoDoGestor.idRegiao);
            sessionStorage.setItem("UF", regiaoDoGestor.uf);
            sessionStorage.setItem("CIDADE", regiaoDoGestor.cidade);

            abrirPopupEscolhaRegiao(regiaoDoGestor, scoreRegiao);
        };
    });
}

function buscarScoreRegiaoNoJson(ufMapa) {
    if (!dadosGestoraOp || !dadosGestoraOp.empresas) {
        return null;
    }

    const empresa = dadosGestoraOp.empresas[nomeEmpresa];

    if (!empresa || !empresa.regioes) {
        return null;
    }

    const regioesJson = empresa.regioes;
    const ufMaiuscula = ufMapa.toUpperCase();

    if (!regioesJson[ufMaiuscula]) {
        return null;
    }

    return regioesJson[ufMaiuscula].score;
}

function converterScoreParaStatus(score) {
    if (score === null || score === undefined) {
        return null;
    }

    const scoreNumerico = Number(score);

    if (Number.isNaN(scoreNumerico)) {
        return null;
    }

    if (scoreNumerico >= 80) {
        return "Saudável";
    }

    if (scoreNumerico >= 60) {
        return "Atenção";
    }

    return "Crítico";
}

function aplicarSaudeNoMapa(estadoMapa, statusRegiao) {
    if (!statusRegiao) {
        estadoMapa.classList.add("regiao-sem-status");
        return;
    }

    const status = statusRegiao
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (status === "saudavel") {
        estadoMapa.classList.add("regiao-saudavel");
    } else if (status === "atencao") {
        estadoMapa.classList.add("regiao-atencao");
    } else if (status === "critico") {
        estadoMapa.classList.add("regiao-critica");
    } else {
        estadoMapa.classList.add("regiao-sem-status");
    }
}

function obterCoresPorScore(score) {
    if (score === null || score === undefined || Number.isNaN(Number(score))) {
        return {
            estado: "#9eb9d8",
            glow: "#244770"
        };
    }

    const saude = Number(score);

    if (saude > 90) {
        return {
            estado: "#b6ffb6",
            glow: "#00ba60"
        };
    }

    if (saude > 75) {
        return {
            estado: "#ffeaab",
            glow: "#e8c82c"
        };
    }

    return {
        estado: "#ffa39b",
        glow: "#ff0033"
    };
}

function aplicarEstiloVisualDireto(estadoMapa, existeNaEmpresa, gestorTemAcesso, scoreRegiao) {
    const shape = estadoMapa.querySelector(".shape");
    const icon = estadoMapa.querySelector(".icon_state");
    const label = estadoMapa.querySelector(".label_icon_state");

    if (!shape) {
        return;
    }

    const cores = obterCoresPorScore(scoreRegiao);
    const corEstado = cores.estado;
    const corGlow = cores.glow;

    // Região não existe para a empresa no banco
    if (!existeNaEmpresa) {
        shape.style.setProperty("fill", "#d9d9d9", "important");
        shape.style.setProperty("opacity", "0.45", "important");
        shape.style.setProperty("filter", "grayscale(1) brightness(1.08)", "important");

        if (icon) {
            icon.style.setProperty("opacity", "0.18", "important");
            icon.style.setProperty("filter", "grayscale(1)", "important");
        }

        if (label) {
            label.style.setProperty("opacity", "0.25", "important");
            label.style.setProperty("filter", "grayscale(1)", "important");
        }

        return;
    }

    // Região existe para a empresa, mas gestor não tem acesso
    if (!gestorTemAcesso) {
        shape.style.setProperty("fill", corEstado, "important");
        shape.style.setProperty("opacity", "0.32", "important");
        shape.style.setProperty("filter", "grayscale(0.8) brightness(1.12)", "important");

        if (icon) {
            icon.style.setProperty("fill", corGlow, "important");
            icon.style.setProperty("opacity", "0.35", "important");
            icon.style.setProperty("filter", "grayscale(0.8)", "important");
        }

        if (label) {
            label.style.setProperty("opacity", "0.45", "important");
            label.style.setProperty("filter", "grayscale(1)", "important");
            label.style.setProperty("fill", "#ffffff", "important");
        }

        return;
    }

    // Região permitida para o gestor
    shape.style.setProperty("fill", corEstado, "important");
    shape.style.setProperty("opacity", "1", "important");
    shape.style.setProperty("filter", "none", "important");

    if (icon) {
        icon.style.setProperty("fill", corGlow, "important");
        icon.style.setProperty("opacity", "1", "important");
        icon.style.setProperty(
            "filter",
            `drop-shadow(0 0 6px ${corGlow}) drop-shadow(0 0 14px ${corGlow}) drop-shadow(0 0 24px ${corGlow})`,
            "important"
        );
    }

    if (label) {
        label.style.setProperty("opacity", "1", "important");
        label.style.setProperty("filter", "none", "important");
        label.style.setProperty("fill", "#ffffff", "important");
    }
}

function limparClassesRegiao(estadoMapa) {
    estadoMapa.classList.remove(
        "regiao-sem-datacenter",
        "regiao-sem-status",
        "regiao-saudavel",
        "regiao-atencao",
        "regiao-critica",
        "regiao-bloqueada",
        "regiao-permitida"
    );

    limparEstiloVisualDireto(estadoMapa);

    estadoMapa.onclick = null;
}

function limparEstiloVisualDireto(estadoMapa) {
    const shape = estadoMapa.querySelector(".shape");
    const icon = estadoMapa.querySelector(".icon_state");
    const label = estadoMapa.querySelector(".label_icon_state");

    if (shape) {
        shape.style.removeProperty("fill");
        shape.style.removeProperty("opacity");
        shape.style.removeProperty("filter");
        shape.style.removeProperty("stroke");
        shape.style.removeProperty("stroke-width");
    }

    if (icon) {
        icon.style.removeProperty("fill");
        icon.style.removeProperty("opacity");
        icon.style.removeProperty("filter");
        icon.style.removeProperty("transform");
    }

    if (label) {
        label.style.removeProperty("fill");
        label.style.removeProperty("opacity");
        label.style.removeProperty("filter");
    }
}

function abrirPopupEscolhaRegiao(regiao, scoreRegiao) {
    fecharPopupRegiao();

    const uf = String(regiao.uf).toLowerCase();
    const boxRegiao = document.getElementById(`box_${uf}`);

    if (!boxRegiao) {
        console.error(`Não existe popup para a região: box_${uf}`);
        return;
    }

    const spanSaude = boxRegiao.querySelector(".valor-saude");

    if (spanSaude) {
        if (scoreRegiao === null || scoreRegiao === undefined) {
            spanSaude.innerHTML = "-";
        } else {
            spanSaude.innerHTML = scoreRegiao;
        }
    }

    boxRegiao.style.display = "block";
    boxRegiao.style.opacity = "1";
    boxRegiao.style.visibility = "visible";
}

function fecharPopupRegiao() {
    const todasBoxes = document.querySelectorAll(".parca .estado");

    todasBoxes.forEach(box => {
        box.style.display = "none";
        box.style.opacity = "0";
        box.style.visibility = "hidden";
    });
}

function selecionarDatacenters() {
    window.location.href = "dashOperacionalGestor.html";
}

function selecionarAlerta() {
    window.location.href = "dashAlertas.html";
}

function limparSessao() {
    sessionStorage.clear();
}