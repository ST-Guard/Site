function fnNavegar(local) {
    window.location.href = local
}

// if (!sessionStorage.ID_USUARIO) {
//   alert("Você precisa estar logado!");
//   window.location = "login.html";
// }

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
        sessionStorage.ID_ZONA = dados.idZona
        //dataCenterTitulo.innerHTML = dados.nomeDataCenter
        if (dados.imagem) {
            console.log(dados.imagem)
            imagemPerfilCima.src = `/assets/imgsBd/${dados.imagem}`
        } else {
            imagemPerfilCima.src = "../assets/dashConfig/usuario.png"
        }
    })
}

function carregarDados() {
    const idZona = sessionStorage.ID_ZONA
    const selectServer = document.getElementById('selectSrv');
    const nomeTopoServer = document.getElementById('nomeTopoServer');
    const parte2 = document.getElementById('p2');

    selectServer.onchange = function () {
        if (selectServer.value == "todos") {
            parte2.style.display = "flex";
            nomeTopoServer.innerHTML = "Todos os Servidores";
        } else {
            parte2.style.display = "none";
            nomeTopoServer.innerHTML = selectServer.value
        }
    }

    fetch(`/especifico/selectServidor/${idZona}`)
    .then(resposta => resposta.json())
    .then(lista => {
            selectServer.style.display = 'flex';
            selectServer.innerHTML = `<option selected value = "todos">Todos os Servidores</option>`;
            console.log(lista)
            for (let i = 0; i < lista.length; i++) {
                selectServer.innerHTML += `
                    <option value="${lista[i].nome}">
                        ${lista[i].nome}
                    </option>
                `;
            }

            selectServer.onchange();
        })
        .catch(
            erro => console.log(erro)
        );

}

async function estimarDownloadsPorJogador() {
    try {
        const resposta = await fetch("/steam/steamGlobal");
        const dados = await resposta.json();
        const onlineAgora = dados.onlineAgora;
        const jogandoAgora = dados.jogandoAgora * 1.50;
        const usuariosForaDosJogos = onlineAgora - jogandoAgora;
        const usuariosDownload = usuariosForaDosJogos * 0.1;

        const respostaDownload = await fetch("/steam/steamDownloads");
        const dadosDown = await respostaDownload.json();
        const avgmbpsSteam = Number(dadosDown.BRA.avgmbps);
        const gbpsSteam = Number(((avgmbpsSteam / 1000) / 1000).toFixed(2));

        const kpiVolumeDownload = document.getElementById('kpiVolumeDownload');
        kpiVolumeDownload.innerHTML = Number((dadosDown.BRA.avgmbps) / 1000).toFixed(2)

        return {onlineAgora, jogandoAgora, usuariosForaDosJogos, usuariosDownload, gbpsSteam};

    } catch (erro) {
        console.error("Erro ao estimar downloads:", erro);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    buscarDados()
    carregarDados()
    const ctxRamCpu = document.getElementById('chartRamxCpu');
    const ctxDiskLat = document.getElementById('chartDiskxLat');
    const ctxDownload = document.getElementById('chartDownload');
    const ctxVolume = document.getElementById('chartVolumeCriticidade');
    const ctxReviews = document.getElementById('chartReviews');

    const chartDiscoXLatencia = new Chart(ctxDiskLat, {
        type: 'line',
        data: {
            labels: ['0h', '1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'],
            datasets: [
            {
                label: 'Disco',
                data: [22.5, 26.5, 40, 48, 51, 38, 22.5, 26.5, 40, 48, 51, 38, 22.5, 26.5, 40, 48, 51, 38, 22.5, 26.5, 40, 48, 51, 38],
                fill: true,
                borderColor: 'rgba(35, 178, 109, 0.7)',
                backgroundColor: 'rgba(35, 178, 109, 0.18)',
                tension: 0.5,
                order: 2,
                pointRadius: 0,
                borderWidth: 1.5
            },
            {
                label: 'Latencia',
                data: [42.5, 33, 27, 23, 26, 28, 42.5, 33, 27, 23, 26, 28, 42.5, 23, 26, 28, 42.5, 33, 27, 23, 26, 28, 42.5, 23],
                fill: true,
                borderColor: 'rgba(29, 133, 194, 0.7)',
                backgroundColor: 'rgba(29, 133, 194, 0.18)',
                tension: 0.5,
                order: 2,
                pointRadius: 0,
                borderWidth: 1.5
            },  
            
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Correlação entre taxa de download e consumo de disco',
                    align: 'start',
                    font: {
                        size: 18
                    },
                    padding: {
                        top: 20,
                    }
                },
                subtitle: {
                    display: true,
                    text: 'Taxa em MB/s nas ultimas 24h',
                    align: 'start',
                    font: {
                        size: 14
                    },
                    padding: {
                        bottom: 30,
                    }
                },
                legend: {
                    labels: {
                        padding: 5
                    },
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            responsive: true,
            scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Uso (%)'
                },
                min: 0,
                max: 100
            },
            }
        }
    });

    let ultimoTotal = null;

    const chartDownload = new Chart(ctxDownload, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Download Brasil (Gbps)',
            data: [],
            backgroundColor: '#244770',
            borderRadius: 4
        }]
    },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Análise de download nas últimas 24 horas',
                    align: 'start',
                    font: {
                        size: 18
                    },
                    padding: {
                        top: 20,
                    }
                },
                subtitle: {
                    display: true,
                    text: 'Contagem por hora',
                    align: 'start',
                    font: {
                        size: 14
                    },
                    padding: {
                        bottom: 30,
                    }
                }
            },
            responsive: true,
            scales: {
                x: {
                    ticks: {
                        autoSkip: false
                    }
                },
                y: {
                    beginAtZero: true,
                },
            }
        }
    });

    const chartRamXCpu = new Chart(ctxRamCpu, { 
    type: 'line',
    data: {
        labels: ['0h', '1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'],
        datasets: [
            {
                label: 'RAM',
                data: [32.5, 35, 61, 50, 68, 51, 32.5, 35, 61, 50, 68, 51, 32.5, 35, 50, 68, 51, 32.5, 35, 61, 50, 68, 51, 32.5],
                fill: true,
                borderColor: 'rgba(36, 71, 112, 0.7)',
                backgroundColor: 'rgba(36, 71, 112, 0.18)',
                tension: 0.5,
                order: 2,
                pointRadius: 0,
                borderWidth: 1.5
            },
            {
                label: 'CPU',
                data: [32.5, 45, 52, 70, 73, 37, 32.5, 45, 52, 70, 73, 37, 32.5, 52, 70, 73, 37, 32.5, 45, 52, 70, 73, 37, 32.5],
                fill: true,
                borderColor: 'rgba(201, 80, 80, 0.7)',
                backgroundColor: 'rgba(201, 80, 80, 0.18)',
                tension: 0.5,
                order: 2,
                pointRadius: 0,
                borderWidth: 1.5
            },
        ]
    },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Análise de utilização de recursos',
                    align: 'start',
                    font: {
                        size: 18
                    },
                    padding: {
                        top: 20,
                    }
                },
                subtitle: {
                    display: true,
                    text: 'CPU e RAM % nas ultimas 24h',
                    align: 'start',
                    font: {
                        size: 14
                    },
                    padding: {
                        bottom: 30,
                    }
                },
                legend: {
                    labels: {
                        padding: 5
                    },
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            responsive: true,
            scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Uso (%)'
                },
                min: 0,
                max: 100
            },
            }
        }
    });

    const chartVolume = new Chart(ctxVolume, { 
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Lançamentos previstos',
                    data: [],
                    backgroundColor: [],
                    borderColor: [],
                    borderWidth: 1.5,
                    borderRadius: 6
                },
                {
                    label: 'Limite Relevante',
                    data: [10, 10, 10, 10],
                    type: 'line',
                    borderColor: 'rgba(255, 193, 7, 1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    borderDash: [5, 5],
                    fill: false
                },

                {
                    label: 'Limite Crítico',
                    data: [15, 15, 15, 15],
                    type: 'line',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Volume da quantidade de lançamentos de jogos',
                    align: 'start',
                    font: {
                        size: 18
                    },
                    padding: {
                        top: 20
                    }
                },
                subtitle: {
                    display: true,
                    text: 'Criticidade operacional baseada na densidade de lançamentos',
                    align: 'start',
                    font: {
                        size: 14
                    },
                    padding: {
                        bottom: 30
                    }
                },
                legend: {
                    labels: {
                        padding: 5
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantidade de lançamentos'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Semanas'
                    }
                }
            }
        }
    });

    const labelsReview = [];
    const valoresReview = [];

    const chartReview = new Chart(ctxReviews, {
        type: "bar",
        data: {
            labels: [],
            datasets: [{
                label: "Quantidade de reviews",
                data: [],
                borderColor: "#244770",
                backgroundColor: "#244770",
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                title: {
                    display: true,
                    text: "Estimativa semanal de volume de mais vendidos no Brasil",
                    align: "start",
                    font: {
                        size: 18
                    },
                    padding: {
                        top: 20
                    }
                },

                subtitle: {
                    display: true,
                    text: "Reviews dos últimos 7 dias por jogo",
                    align: "start",
                    font: {
                        size: 14
                    },
                    padding: {
                        bottom: 30
                    }
                },

                legend: {
                    display: false
                }
            },

            scales: {
                x: {
                    beginAtZero: true,
                    }
                },

                y: {
                    ticks: {
                        autoSkip: false
                    }
                }
            }
    });

    async function buscarVolumeLancamentos() {

        const resposta = await fetch("/steam/volumeLancamentosSteam");
        const dados = await resposta.json();
        const labels = [];
        const valores = [];
        const coresFundo = [];
        const coresBorda = [];

        for (let i = 0; i < dados.jogos.length; i++) {
            const data = dados.jogos[i].dataLancamento;
            let posicao = labels.indexOf(data);

            if (posicao === -1) {
                labels.push(data);
                valores.push(1);
            } else {
                valores[posicao]++;
            }
        }

        chartVolume.data.labels = labels;
        chartVolume.data.datasets[0].data = valores;

        for (let i = 0; i < valores.length; i++) {
            const valor = valores[i];

            if (valor >= 15) {
                coresFundo.push('rgba(220, 53, 69, 0.7)');
                coresBorda.push('rgba(220, 53, 69, 1)');
            } else if (valor >= 10) {
                coresFundo.push('rgba(255, 193, 7, 0.7)');
                coresBorda.push('rgba(255, 193, 7, 1)');
            } else {
                coresFundo.push('rgba(60, 179, 113, 0.7)');
                coresBorda.push('rgba(60, 179, 113, 1)');
            }
        }

        chartVolume.data.datasets[0].backgroundColor = coresFundo;
        chartVolume.data.datasets[0].borderColor = coresBorda;
        chartVolume.data.datasets[1].data = [];
        chartVolume.data.datasets[2].data = [];

        for (let i = 0; i < labels.length; i++) {
            chartVolume.data.datasets[1].data.push(10);
            chartVolume.data.datasets[2].data.push(15);
        }

        chartVolume.update();
    }

    async function buscarVolumeComprados() {
        const resposta = await fetch("/steam/volumeCompradosSteam");
        const dados = await resposta.json();
    }

    async function carregarGraficoReviews() {
        labelsReview.length = 0;
        valoresReview.length = 0;

        const respostaTop = await fetch("/steam/topSellers");
        const topSellers = await respostaTop.json();

        for (let i = 0; i < topSellers.length; i++) {
            try {
                const jogo = topSellers[i];

                if (jogo.appId == 730) {
                    const resposta = await fetch(`/steam/reviews/app/${jogo.appId}`);
                    const dados = await resposta.json();
                    labelsReview.push(jogo.nome.length > 18 ? jogo.nome.slice(0, 18) + "..." : jogo.nome);
                    valoresReview.push(1000);
                } else {
                    const resposta = await fetch(`/steam/reviews/app/${jogo.appId}`);
                    const dados = await resposta.json();
                    labelsReview.push(jogo.nome.length > 18 ? jogo.nome.slice(0, 18) + "..." : jogo.nome);
                    valoresReview.push(dados.totalReviews || 0);
                }

            } catch (erro) {
                console.log("Erro jogo:", topSellers[i]);
            }
        }

        chartReview.data.labels = labelsReview;
        chartReview.data.datasets[0].data = valoresReview;
        chartReview.update();
    }

    async function carregarGraficoDownload() {
        const dados = await estimarDownloadsPorJogador();
        const agora = new Date();
        agora.setMinutes(0, 0, 0);
        
        const labelsDownload = [];
        const valoresDownload = [149, 146, 150, 155, 150, 153, 149, 147, 150, 155, 150, 154];
        for (let i = 11; i >= 0; i--) {
            const horario = new Date(agora);
            horario.setHours(agora.getHours() - (i * 2));
            labelsDownload.push(
                horario.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                })
            );
        }
        valoresDownload[valoresDownload.length - 1] = dados.gbpsSteam;

        chartDownload.data.labels = labelsDownload;
        chartDownload.data.datasets[0].data = valoresDownload;
        chartDownload.update();
    }

    carregarGraficoDownload();
    carregarGraficoReviews();
    buscarVolumeComprados()
    buscarVolumeLancamentos();
    setInterval(carregarGraficoDownload, 3600000);

});


function limparSessao() {
    sessionStorage.clear();
}