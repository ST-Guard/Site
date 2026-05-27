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
        //dataCenterTitulo.innerHTML = dados.nomeDataCenter
        console.log("Teste")
        if (dados.imagem) {
            console.log(dados.imagem)
            imagemPerfilCima.src = `/assets/imgsBd/${dados.imagem}`
        } else {
            imagemPerfilCima.src = "../assets/dashConfig/usuario.png"
        }
    })
}

document.addEventListener("DOMContentLoaded", () => {
    buscarDados()
    const ctxRamCpu = document.getElementById('chartRamxCpu');
    const ctxDiskLat = document.getElementById('chartDiskxLat');
    const ctxDownload = document.getElementById('chartDownload');

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
    const labelsDownload = [];
    const valoresDownload = [];

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
                    text: 'Análise de download nas últimas 48 horas',
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

    atualizarGraficoDownload()
    setInterval(atualizarGraficoDownload, 1800000);

    async function atualizarGraficoDownload() {

        const respostaJogadores = await fetch("/api/steamGlobal");
        const jogadoresJson = await respostaJogadores.json();
        const metricaUsuariosDownload = jogadoresJson.onlineAgora - (Math.random() * (10000000 - 5000000) + 5000000)
        const usuariosBrasil = metricaUsuariosDownload * 0.03
        const usuariosDatacenter = usuariosBrasil / 3

        const respostaDownload = await fetch("/api/steamDownloads");
        const dados = await respostaDownload.json();
        const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit'});
        const atual = Number(dados.BRA.totalbytes);
        const mbpsSteam = atual / 1024 / 1024 / 1024 / 1024

        const menorValor = 130000
        const maiorValor = 310000

        let formulaPorcentagem = 1

        if (usuariosDatacenter > menorValor) {
            formulaPorcentagem = 1 + ((usuariosDatacenter - menorValor) / (maiorValor - menorValor) * 0.1)
            formulaPorcentagem = Math.min(formulaPorcentagem, 1.10)
        }
        let valorAtual = mbpsSteam * formulaPorcentagem
        const valorGbps = Number((valorAtual / 1024).toFixed(2));

        console.log(usuariosDatacenter)
        console.log(valorGbps)
        console.log(formulaPorcentagem)
        labelsDownload.push(agora);
        valoresDownload.push(valorGbps);

        if (labelsDownload.length > 48) {
            labelsDownload.shift();
            valoresDownload.shift();
        }

        chartDownload.data.labels = labelsDownload;
        chartDownload.data.datasets[0].data = valoresDownload;

        chartDownload.update();
    }
});


function limparSessao() {
    sessionStorage.clear();
}