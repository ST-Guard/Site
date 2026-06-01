window.onload = () => {
    buscarDados();
    atualizarDiaSemana();
    iniciarDashOperacional();
};

if (!sessionStorage.ID_USUARIO) {
    conteiner_msg.innerHTML = "Você precisa estar logado!"
    loadingModal()
    window.location = "login.html";
}

function voltar(){
    window.location.href = 'inicioGestor.html';

}

function atualizarDiaSemana() {
    const dataAtual = new Date();
    const cidadeSessao = sessionStorage.getItem("CIDADE") || "Região";

    const diasDaSemana = [
        "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"
    ];

    const mesesDoAno = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const nomeDia = diasDaSemana[dataAtual.getDay()];
    const diaDoMes = dataAtual.getDate();
    const nomeMes = mesesDoAno[dataAtual.getMonth()];
    const ano = dataAtual.getFullYear();

    const spanCidade = document.getElementById("cidadeSelecionada");
    const spanDiaSemana = document.getElementById("diaSemanaAtual");

    if (spanCidade) {
        spanCidade.innerHTML = cidadeSessao;
    }

    if (spanDiaSemana) {
        spanDiaSemana.innerHTML = `${nomeDia}, ${diaDoMes} de ${nomeMes} de ${ano}`;
    }
}

function buscarDados() {
    const idUsuario = sessionStorage.ID_USUARIO
    
    fetch(`/sessao/buscarUsuario/${idUsuario}`, {
    })
      .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {
        dados = dados[0]

        username.innerHTML = dados.nomePessoa
        cargoname.innerHTML = dados.cargo
        if (dados.imagem) {
            imagemPerfilCima.src = `/assets/imgsBd/${dados.imagem}`
        } else {
            imagemPerfilCima.src = "../assets/dashConfig/usuario.png"
        }
    })
}
//------------------------------------------------ CHAMANDO DADOS DO BUCKET E RENDERIZANDO ----------------------------------------------------------
let dadosGestoraOp = null;
let datacentersGestor = [];
let datacenterSelecionado = null;
const nomeEmpresa = sessionStorage.getItem("NOME_EMPRESA") || "Steam";

async function iniciarDashOperacional() {
    await carregarJsonGestoraOp();
    await carregarDatacentersDoGestor();
}

async function carregarJsonGestoraOp() {
    try {
        const resposta = await fetch("/dashOperacional/buscarGestoraOpJson");

        if (!resposta.ok) {
            const erro = await resposta.text();
            console.error("Erro ao buscar JSON da gestora:", erro);
            return;
        }

        dadosGestoraOp = await resposta.json();
        console.log("JSON gestora OP carregado:", dadosGestoraOp);

    } catch (erro) {
        console.error("Erro geral ao carregar JSON da gestora:", erro);
    }
}

function encontrarDatacenterMaisCritico(datacentersPermitidos) {
    if (!dadosGestoraOp || !dadosGestoraOp.empresas) {
        console.error("JSON da gestora ainda não carregado.");
        return null;
    }

    const empresa = dadosGestoraOp.empresas[nomeEmpresa];

    if (!empresa || !empresa.datacenters) {
        console.error("Empresa ou datacenters não encontrados no JSON.");
        return null;
    }

    let piorDatacenter = null;
    let piorScore = 101;

    datacentersPermitidos.forEach(dc => {
        const nomeDc = dc.nome;
        const dadosDc = empresa.datacenters[nomeDc];

        if (!dadosDc) {
            console.warn("Datacenter não encontrado no JSON:", nomeDc);
            return;
        }

        const score = Number(dadosDc.score);

        if (!Number.isNaN(score) && score < piorScore) {
            piorScore = score;
            piorDatacenter = dc;
        }
    });

    return piorDatacenter;
}

function carregarDatacentersDoGestor() {
    const idUsuario = sessionStorage.getItem("ID_USUARIO");
    const idRegiao = sessionStorage.getItem("ID_REGIAO");
    const selectDatacenter = document.getElementById("selectDatacenter");

    if (!idUsuario) {
        console.error("ID_USUARIO não encontrado no sessionStorage");
        return;
    }

    if (!idRegiao) {
        console.error("ID_REGIAO não encontrado no sessionStorage");
        return;
    }

    if (!selectDatacenter) {
        console.error("selectDatacenter não encontrado no HTML");
        return;
    }

    fetch(`/dashOperacional/listarDatacenters/${idUsuario}/${idRegiao}`)
        .then(resposta => {
            if (!resposta.ok) {
                throw new Error("Erro ao buscar datacenters do gestor");
            }

            return resposta.json();
        })
        .then(datacenters => {
            datacentersGestor = datacenters;

            selectDatacenter.innerHTML = `
                <option value="" disabled>Selecione um datacenter</option>
            `;

            datacenters.forEach(dc => {
                selectDatacenter.innerHTML += `
                    <option value="${dc.nome}" data-id="${dc.fk_datacenter}">
                        ${dc.nome}
                    </option>
                `;
            });

            const datacenterMaisCritico = encontrarDatacenterMaisCritico(datacenters);

            if (datacenterMaisCritico) {
                selectDatacenter.value = datacenterMaisCritico.nome;
                selecionarDatacenter(datacenterMaisCritico.nome);
            }
        })
        .catch(erro => {
            console.error("Erro ao carregar datacenters:", erro);
        });
}

function selecionarDatacenter(nomeDatacenter) {
    if (!nomeDatacenter) {
        return;
    }

    datacenterSelecionado = nomeDatacenter;
    sessionStorage.setItem("DATACENTER_SELECIONADO", nomeDatacenter);

    renderizarKpisDatacenter(nomeDatacenter);
}

//--------------------------------------------------KPIS RENDERIZANDO----------------------------------------------------------------------------
function renderizarKpisDatacenter(nomeDatacenter) {
    if (!dadosGestoraOp || !dadosGestoraOp.empresas) {
        console.error("JSON da gestora não carregado.");
        return;
    }

    const empresa = dadosGestoraOp.empresas[nomeEmpresa];

    if (!empresa || !empresa.datacenters) {
        console.error("Datacenters não encontrados no JSON.");
        return;
    }

    const datacenter = empresa.datacenters[nomeDatacenter];

    if (!datacenter) {
        console.error("Datacenter não encontrado no JSON:", nomeDatacenter);
        return;
    }

    console.log("Renderizando KPIs do datacenter:", nomeDatacenter, datacenter);

    atualizarKpiScore(datacenter);
    atualizarKpiCrescimentoIncidentes(datacenter);
    atualizarKpiUptime(datacenter);
    atualizarKpiServidoresCriticos(datacenter);
}
function atualizarKpiScore(datacenter) {
    const score = datacenter.score ?? 0;
    const status = datacenter.status ?? converterScoreParaStatus(score);

    document.getElementById("scoreDatacenter").innerHTML = score;

    atualizarIconeStatus("statusKpiScore", status);
    atualizarEstiloKpi("kpiScoreSaude", status);
}

function atualizarKpiCrescimentoIncidentes(datacenter) {
    const kpi = datacenter.kpiCrescimentoIncidentes;

    if (!kpi) {
        document.getElementById("porcentCresc").innerHTML = 0;
        document.getElementById("qntAlertasAnterior").innerHTML = 0;
        document.getElementById("qntAlertasAtual").innerHTML = 0;

        atualizarIconeStatusPercentual("statusKPICresc", 0, 5, 15);
        atualizarEstiloKpi("kpiCrescimentoIncidentes", "Estável");
        return;
    }

    const percentual = kpi.percentual ?? 0;
    const status = classificarPercentual(percentual, 5, 15);

    document.getElementById("porcentCresc").innerHTML = percentual;
    document.getElementById("qntAlertasAnterior").innerHTML = kpi.alertasSemanaAnterior ?? 0;
    document.getElementById("qntAlertasAtual").innerHTML = kpi.alertasSemanaAtual ?? 0;

    atualizarIconeStatusPercentual("statusKPICresc", percentual, 5, 15);
    atualizarEstiloKpi("kpiCrescimentoIncidentes", status);
}

function atualizarKpiUptime(datacenter) {
    const kpi = datacenter.kpiUptime;

    if (!kpi) {
        document.getElementById("qntServComUptimeBaixo").innerHTML = 0;
        document.getElementById("totalSrvUptime").innerHTML = 0;
        document.getElementById("porcentagemServComBaixoUpt").innerHTML = 0;

        atualizarIconeStatusPercentual("statusMenorUpt", 0, 10, 25);
        atualizarEstiloKpi("kpiServidoresInstaveis", "Estável");
        return;
    }

    const percentual = kpi.percentualInstaveis ?? 0;
    const status = classificarPercentual(percentual, 10, 25);

    document.getElementById("qntServComUptimeBaixo").innerHTML = kpi.qtdServidoresInstaveis ?? 0;
    document.getElementById("totalSrvUptime").innerHTML = kpi.totalServidores ?? 0;
    document.getElementById("porcentagemServComBaixoUpt").innerHTML = percentual;

    atualizarIconeStatusPercentual("statusMenorUpt", percentual, 10, 25);
    atualizarEstiloKpi("kpiServidoresInstaveis", status);
}

function atualizarKpiServidoresCriticos(datacenter) {
    const kpi = datacenter.kpiServidoresCriticos;

    if (!kpi) {
        document.getElementById("qntSrvComAlertas").innerHTML = 0;
        document.getElementById("totalSrvCriticos").innerHTML = 0;
        document.getElementById("porcentSrvCritic").innerHTML = 0;

        atualizarIconeStatusPercentual("statusSrvCriticos", 0, 10, 25);
        atualizarEstiloKpi("kpiServidoresCriticos", "Estável");
        return;
    }

    const percentual = kpi.percentualCriticos ?? 0;
    const status = classificarPercentual(percentual, 10, 25);

    document.getElementById("qntSrvComAlertas").innerHTML = kpi.qtdCriticos ?? 0;
    document.getElementById("totalSrvCriticos").innerHTML = kpi.totalServidores ?? 0;
    document.getElementById("porcentSrvCritic").innerHTML = percentual;

    atualizarIconeStatusPercentual("statusSrvCriticos", percentual, 10, 25);
    atualizarEstiloKpi("kpiServidoresCriticos", status);
}

//---------------------------------------- CLASSIFICACAO KPIS E MUDANÇA DE ICONES-----------------------------------------------------------------
function classificarPercentual(valor, limiteAtencao, limiteCritico) {
    const percentual = Number(valor);

    if (Number.isNaN(percentual)) {
        return "Indefinido";
    }

    if (percentual <= limiteAtencao) {
        return "Estável";
    }

    if (percentual <= limiteCritico) {
        return "Atenção";
    }

    return "Crítico";
}

function converterScoreParaStatus(score) {
    const scoreNum = Number(score);

    if (Number.isNaN(scoreNum)) {
        return "Indefinido";
    }

    if (scoreNum >= 80) {
        return "Saudável";
    }

    if (scoreNum >= 60) {
        return "Atenção";
    }

    return "Crítico";
}

function atualizarIconeStatus(idImagem, status) {
    const imagem = document.getElementById(idImagem);

    if (!imagem) {
        return;
    }

    const statusNormalizado = String(status)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (statusNormalizado === "saudavel") {
        imagem.src = "../assets/dashboard-icons/icon_check.svg";
        imagem.alt = "Saudável";
    } else if (statusNormalizado === "atencao") {
        imagem.src = "../assets/dashboard-icons/icon_atencao.svg";
        imagem.alt = "Atenção";
    } else {
        imagem.src = "../assets/dashboard-icons/icon_alerta.svg";
        imagem.alt = "Crítico";
    }
}


function atualizarIconeStatusPercentual(idImagem, valor, limiteAtencao, limiteCritico) {
    const imagem = document.getElementById(idImagem);

    if (!imagem) {
        return;
    }

    const percentual = Number(valor);

    if (Number.isNaN(percentual)) {
        imagem.src = "../assets/dashboard-icons/icon_alerta.svg";
        imagem.alt = "Indefinido";
        return;
    }

    if (percentual <= limiteAtencao) {
        imagem.src = "../assets/dashboard-icons/icon_check.svg";
        imagem.alt = "Estável";
    } else if (percentual <= limiteCritico) {
        imagem.src = "../assets/dashboard-icons/icon_atencao.svg";
        imagem.alt = "Atenção";
    } else {
        imagem.src = "../assets/dashboard-icons/icon_alerta.svg";
        imagem.alt = "Crítico";
    }
}


function atualizarEstiloKpi(idKpi, status) {
    const kpi = document.getElementById(idKpi);

    if (!kpi) {
        return;
    }

    kpi.classList.remove(
        "kpi-saudavel",
        "kpi-atencao",
        "kpi-critico",
        "kpi-indefinido"
    );

    const statusNormalizado = String(status)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (statusNormalizado === "saudavel" || statusNormalizado === "estavel") {
        kpi.classList.add("kpi-saudavel");
    } else if (statusNormalizado === "atencao") {
        kpi.classList.add("kpi-atencao");
    } else if (statusNormalizado === "critico") {
        kpi.classList.add("kpi-critico");
    } else {
        kpi.classList.add("kpi-indefinido");
    }
}

//}//---------------------------------------------------------------------------------------------------------------------------------------------


// Precisa do DOMcontentLoaded, pq garante que os elementos do html carreguem antes de pegar o id do char, saco?
document.addEventListener('DOMContentLoaded', () => {
const ctxSaudeZonas = document.getElementById('graficoSaudeZonas');

  const dadosSaudeZonas = [95, 78, 88, 65, 91, 45, 65, 91, 45];

  function definirCorZona(score) {
    if (score >= 80) {
      return '#22C55E';
    } else if (score >= 60) {
      return '#F5A400';
    } else {
      return '#F23845';
    }
  }

  new Chart(ctxSaudeZonas, {
    type: 'bar',
    data: {
      labels: ['Zona A', 'Zona B', 'Zona C', 'Zona D', 'Zona E', 'Zona F','Zona G', 'Zona H', 'Zona I'],
      datasets: [{
        data: dadosSaudeZonas,
        backgroundColor: dadosSaudeZonas.map(score => definirCorZona(score)),
        borderRadius: 4,
        barThickness: 46
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 25,
            color: '#6B7280'
          },
          grid: {
            color: '#E5E7EB'
          }
        },
        x: {
          ticks: {
            color: '#6B7280'
          },
          grid: {
            color: '#E5E7EB'
          }
        }
      }
    }
  });
   

  const ctxIncidentesSemana = document.getElementById('graficoIncidentesSemana');

  new Chart(ctxIncidentesSemana, {
    type: 'line',
    data: {
      labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Alertas Diários',
          data: [45, 34, 58, 42, 69, 29, 20],
          borderColor: '#2F80ED',
          backgroundColor: '#2F80ED',
          borderWidth: 3,
          tension: 0.35,
          pointRadius: 5,
          pointHoverRadius: 6,
          fill: false
        },
        {
          label: 'Linha da Média',
          data: [42, 42, 42, 42, 42, 42, 42],
          borderColor: '#F5A400',
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            color: '#6B7280'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 80,
          ticks: {
            stepSize: 20,
            color: '#6B7280'
          },
          grid: {
            color: '#E5E7EB',
            borderDash: [4, 4]
          }
        },
        x: {
          ticks: {
            color: '#6B7280'
          },
          grid: {
            color: '#E5E7EB',
            borderDash: [4, 4]
          }
        }
      }
    }
  });

    atualizarGrafico();
})


function mostrarRelatorios(){
document.getElementById("div_relatorios").style.display = "block";
}

function fecharRelatorios(){
document.getElementById("div_relatorios").style.display = "none";

}


function limparSessao() {
    sessionStorage.clear();
}