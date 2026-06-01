
async function carregarDadosDashAlerta() {
    try {
        const respostaURL = await fetch('/alertas/obter-url-s3');
        const { url } = await respostaURL.json();

        const respostaS3 = await fetch(url);

        if (!respostaS3.ok) {
            throw new Error('Erro ao carregar dados do s3');
        }

        const dadosDashboard = await respostaS3.json();

        console.log("Dados recebidos:", dadosDashboard);

        renderizarDadosDash(dadosDashboard);

    } catch (error) {
        console.log("Houve um erro na função carregarDadosDashAlerta: " + error);
    }
}

async function atualizarDados() {
    try {
        const respostaURL = await fetch('/api/obter-url-s3');
        const { url } = await respostaURL.json();

        const respostaS3 = await fetch(url);
        const dadosAtualizados = await respostaS3.json();

        renderizarDadosDash(dadosAtualizados);
    } catch (error) {
        console.log("Erro ao atualizar:", error);
    }
}
/*===================================================================================== */

async function carregarDadosDashAlerta2() {
    try {
        const respostaURL = await fetch('/alertas2/obter-url-s3');
        const { url } = await respostaURL.json();

        const respostaS3 = await fetch(url);

        if (!respostaS3.ok) {
            throw new Error('Erro ao carregar dados do s3');
        }

        const dadosDashboard2 = await respostaS3.json();

        console.log("Dados recebidos 2:", dadosDashboard2);

        renderizarDadosDash2(dadosDashboard2);

    } catch (error) {
        console.log("Houve um erro na função carregarDadosDashAlerta2: " + error);
    }
}

async function atualizarDados2() {
    try {
        const respostaURL = await fetch('/api/obter-url-s3');
        const { url } = await respostaURL.json();

        const respostaS3 = await fetch(url);
        const dadosAtualizados2 = await respostaS3.json();

        renderizarDadosDash2(dadosAtualizados2);
    } catch (error) {
        console.log("Erro ao atualizar 2:", error);
    }
}

async function renderizarDadosDash(dadosDashboard) {
    let data = sessionStorage.getItem('DATA');

    if (!data) {
        console.log("Datacenter não selecionado.");
        return;
    }

    const datacenter = dadosDashboard["datacenters"];

    if (!datacenter || !datacenter[data]) {
        console.log("Dados do datacenter não encontrados.");
        return;
    }

    let caminho = datacenter[data];

    /* ========================= GRÁFICOS =========================*/
    /* ======================== MTTR SERVER =======================*/
    const mttrServer = window.chartMttr;

    const dados = caminho.mttr_por_servidor || [];
    const listaMttrBaixo = dados.map(item => Number((item.baixo / 60).toFixed(2)));
    const listaMttrMedio = dados.map(item => Number((item.medio / 60).toFixed(2)));
    const listaMttrCritico = dados.map(item => Number((item.critico / 60).toFixed(2)));
    const listaMttrLabels = dados.map(item => item.nomeServidor);

    if (mttrServer) {
        mttrServer.data.labels = listaMttrLabels;
        mttrServer.data.datasets[0].data = listaMttrBaixo;
        mttrServer.data.datasets[1].data = listaMttrMedio;
        mttrServer.data.datasets[2].data = listaMttrCritico;
        mttrServer.update();
    }
    /* ====================== ============ =======================*/
    /* ======================== SUB KPIs =========================*/
    const subBaixo = document.getElementById("maiorB")
    const subMedio = document.getElementById("maiorM")
    const subCritico = document.getElementById("maiorC")
    const subMelhorC = document.getElementById("melhor")

    const maxB = Math.max(...listaMttrBaixo);
    const maxM = Math.max(...listaMttrMedio);
    const maxC = Math.max(...listaMttrCritico);
    const minC = Math.min(...listaMttrCritico);

    const indiceB = listaMttrBaixo.indexOf(maxB);
    const indiceM = listaMttrMedio.indexOf(maxM);
    const indiceC = listaMttrCritico.indexOf(maxC);
    const indiceCmin = listaMttrCritico.indexOf(minC);

    subBaixo.innerHTML = listaMttrLabels[indiceB];
    subMedio.innerHTML = listaMttrLabels[indiceM];
    subCritico.innerHTML = listaMttrLabels[indiceC];
    subMelhorC.innerHTML = listaMttrLabels[indiceCmin];
}

async function renderizarDadosDash2(dadosDashboard2) {
    let data = sessionStorage.getItem('DATA');

    if (!data) {
        console.log("Datacenter não selecionado.");
        return;
    }

    const empresa = dadosDashboard2["SmartData Corp"];

    if (!empresa || !empresa[data]) {
        console.log("Dados do datacenter não encontrados.");
        return;
    }

    let caminho = empresa[data];
    /* ========================== KPIs ========================== */
    const kpiCriticoAberto = document.getElementById("qtdCriticos");
    const kpiMedioAverto = document.getElementById("qtdMedios");
    const kpiBaixoAberto = document.getElementById("qtdBaixos");
    const KpiResolvidos = document.getElementById("qtdResolvidos");
    const kpiNomeServer = document.getElementById("nomeServer");
    const subKpiQtdAlerta = document.getElementById("qtdAlertaServer");

    kpiCriticoAberto.innerHTML = caminho.KPIs.CRITICOS_ABERTOS;
    kpiMedioAverto.innerHTML = caminho.KPIs.MEDIOS_ABERTOS;
    kpiBaixoAberto.innerHTML = caminho.KPIs.BAIXOS_ABERTOS;
    KpiResolvidos.innerHTML = caminho.KPIs.RESOLVIDOS_24H;
    kpiNomeServer.innerHTML = caminho.KPIs.SERVIDOR_MAIS_ALERTAS;

    const contagemPorServidor = {};

    const alertasAtivos = dadosDashboard2["SmartData Corp"][data].ALERTAS_ATIVOS;

    alertasAtivos.forEach(alerta => {
        const nomeServer = alerta.servidor;
        contagemPorServidor[nomeServer] = (contagemPorServidor[nomeServer] || 0) + 1;
    });

    let servidorMaisCritico = "Nenhum";
    let maiorNumeroDeAlertas = 0;

    for (const servidor in contagemPorServidor) {
        if (contagemPorServidor[servidor] > maiorNumeroDeAlertas) {
            maiorNumeroDeAlertas = contagemPorServidor[servidor];
            servidorMaisCritico = servidor;
        }
    }

    subKpiQtdAlerta.innerHTML = maiorNumeroDeAlertas
    /* ========================= GRÁFICOS =========================*/
    /* ======================== COMPONENTE ========================*/
    const graficoComponente = window.chartDistribuicao;

    const nomesComponente = Object.keys(caminho.GRAFICOS.ALERTAS_POR_COMPONENTE);
    const numerosComponente = Object.values(caminho.GRAFICOS.ALERTAS_POR_COMPONENTE);

    if (graficoComponente) {

        const nomesComponente =
            Object.keys(caminho.GRAFICOS.ALERTAS_POR_COMPONENTE);

        const numerosComponente =
            Object.values(caminho.GRAFICOS.ALERTAS_POR_COMPONENTE);

        graficoComponente.data.labels =
            nomesComponente;

        graficoComponente.data.datasets[0].data =
            numerosComponente;

        graficoComponente.update();
    }
    /* =========================================================*/
    /* ======================== SEMANA =========================*/
    const graficoSemana = window.chartAlerta;

    const dados = caminho.GRAFICOS.ALERTAS_POR_SEMANA || [];
    const listaBaixo = dados.map(item => item.baixo);
    const listaMedio = dados.map(item => item.medio);
    const listaCritico = dados.map(item => item.critico);
    const listaLabels = dados.map(item => item.semana);

    if (graficoSemana) {
        graficoSemana.data.labels = listaLabels;
        graficoSemana.data.datasets[0].data = listaBaixo;
        graficoSemana.data.datasets[1].data = listaMedio;
        graficoSemana.data.datasets[2].data = listaCritico;
        graficoSemana.update();
    }

    /* =========================================================*/

    renderizarCardsAlertas(dadosDashboard2, data);
    renderizarSla(dadosDashboard2, data);
}

function renderizarCardsAlertas(dadosDashboard2, data) {
    const listaAlertasContainer = document.querySelector(".div_alertas");
    const alertasAtivos = dadosDashboard2["SmartData Corp"][data].ALERTAS_ATIVOS;

    listaAlertasContainer.innerHTML = "";

    alertasAtivos.forEach(alerta => {

        const corSeveridade = alerta.severidade === 'critico' ? '#FF5252' : '#FFA500';

        listaAlertasContainer.innerHTML += `
            <div class="card_alerta">
                <div class="titulo_card_alerta">
                    <div class="cards1">
                        <div class="icon_titulo_card_alerta">
                            <img src="../assets/Icon_alerta.png" alt="">
                        </div>
                        <div class="titulo_texto_card_alerta">
                            <h1>${alerta.componente} ACIMA DE ${alerta.threshold_momento}%</h1>
                        </div>
                    </div>
                    <div class="cards">
                        <div class="status_titulo_card_alerta">
                            <h1 style="color: ${corSeveridade}">${alerta.severidade.toUpperCase()}</h1>
                        </div>
                        <div class="componente_titulo_card_alerta">
                            <h1>${alerta.componente}</h1>
                        </div>
                    </div>
                </div>
                <div class="identificação_servidor">
                    <img src="../assets/icon_servidor.png" alt="">
                    <h1>${alerta.servidor} - ${alerta.zona}</h1>
                </div>
                <div class="botoes_card_alerta">
                    <button style="background-color: #6B7280; color: white; font-weight: 550;"
                        onclick="verDetalhe(${alerta.id_servidor})">Ver detalhe</button>
                </div>
            </div>
        `;
    });
}

function renderizarSla(dadosDashboard2, data) {

    const container = document.getElementById("listaSla");

    const slaAnalistas =
        dadosDashboard2["SmartData Corp"][data]
            ?.sla_por_analista || [];

    container.innerHTML = "";

    slaAnalistas.forEach(analista => {

        const corStatus =
            analista.percentual >= 90
                ? "#22C55E"
                : analista.percentual >= 70
                    ? "#F59E0B"
                    : "#EF4444";

        const statusTexto =
            analista.percentual >= 90
                ? "Excelente"
                : analista.percentual >= 70
                    ? "Atenção"
                    : "Crítico";

        container.innerHTML += `
        
        <div class="card_sla">

            <div class="topo_sla">

                <div class="nome_analista">
                    <img src="../assets/dashAlerta/user.png">
                    <span>${analista.nomeAnalista}</span>
                </div>

                <div class="status_sla">
                    <span style="color:${corStatus}">
                        ${statusTexto}
                    </span>
                </div>

            </div>

            <div class="infos_sla">

                <div class="info_item">
                    <span>Total chamados</span>
                    <strong>${analista.totalChamados}</strong>
                </div>

                <div class="info_item">
                    <span>Dentro SLA</span>
                    <strong>${analista.dentroSla}</strong>
                </div>

                <div class="info_item">
                    <span>Percentual SLA</span>
                    <strong style="color:${corStatus}">
                        ${analista.percentual}%
                    </strong>
                </div>

            </div>

        </div>
        `;
    });
}
