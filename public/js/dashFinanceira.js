function fnNavegar(caminho){
    window.location.href = caminho
}

window.onload = () => {
    buscarDados()
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
        if (dados.imagem) {
            imagemPerfilCima.src = `/assets/imgsBd/${dados.imagem}`
        } else {
            imagemPerfilCima.src = "../assets/dashConfig/usuario.png"
        }
    })
}

// Precisa do DOMcontentLoaded, pq garante que os elementos do html carreguem antes de pegar o id do char, saco?
document.addEventListener('DOMContentLoaded', () => {

    const ctxServer = document.getElementById('chartServer');
    const ctxRamCpu = document.getElementById('chartRamxCpu');
    const ctxDiskLat = document.getElementById('chartDiskxLat');
    const ctxAlerta = document.getElementById('chartAlerta');

    let graficoBarraServer;

    const dadosPico = {
    Server_1: [4, 5, 5, 0, 8, 2, 8],
    Server_2: [2, 2, 2, 3, 5, 6, 4],
    Server_3: [2, 5, 1, 5, 8, 6, 8],
    };

    function somarAlertas(lista) {
    let total = 0;

    for (let i = 0; i < lista.length; i++) {
        total += lista[i];
    }

    return total;
    }

    function atualizarGrafico() {

    const totalServer1 = somarAlertas(dadosPico.Server_1);
    const totalServer2 = somarAlertas(dadosPico.Server_2);
    const totalServer3 = somarAlertas(dadosPico.Server_3);

    if (graficoBarraServer) {
        graficoBarraServer.destroy();
    }

    graficoBarraServer = new Chart(ctxServer, {
        type: 'bar',
        data: {
        labels: ["DC01-WEB-05", "DC01-DB-12", "FK02-GM-02"],
        datasets: [{
            label: 'Quantidade de Alertas',
            data: [totalServer1, totalServer2, totalServer3],
            backgroundColor: ['#FFA500', '#ffff00', '#FF5252'],
            borderRadius: 5,
            barThickness: 60
        }]
        },
        options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
            display: false
            },
            title: {
                display: true,
                text: 'Comparação dos servidores que mais receberam alertas',
                align: 'start',
                font: {
                    size: 18
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            }
        },
        scales: {
            x: {
            grid: {
                display: false
            }
            },
            y: {
            beginAtZero: true
            }
        }
        }
    });
    }

    new Chart(ctxAlerta, {
    type: 'bar',
    data: {
        labels: ["DC01-WEB-05", "DC01-DB-12", "FK02-GM-02"],
        datasets: [
            {
                label: 'Baixo',
                data: [13,14, 7],
                backgroundColor: '#ffff00'
            },
            {
                label: 'Médio',
                data: [10, 7, 10],
                backgroundColor: '#FFA500'
            },
            {
                label: 'Crítico',
                data: [8, 2, 18],
                backgroundColor: '#FF5252'
            },
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                boxWidth: 14
                }
            },
            title: {
                display: true,
                text: 'Quantidade de alertas por servidor',
                align: 'start',
                font: {
                    size: 18
                },
                padding: {
                    top: 10,
                    bottom: 30,
                }
            }
        },
        scales: {
        x: {
            stacked: true,
            grid: {
            display: false
            }
        },
        y: {
            stacked: true,
            beginAtZero: true,
            max: 60,
            ticks: {
            stepSize: 15
            }
        }
        }
    }
    });

    new Chart(ctxRamCpu, {
    type: 'bar',
    data: {
        labels: ["DC01-WEB-05", "DC01-DB-12", "FK02-GM-02", "DC01-WEB-08"],
        datasets: [
        {
            label: 'RAM',
            data: [35, 61, 50, 68, 51],
            backgroundColor: '#244770',
            order: 2
        },
        {
            label: 'CPU',
            data: [45, 52, 70, 73, 37],
            backgroundColor: '#C95050',
            order: 2
        },
        {
            label: 'Comparação Ram Anterior',
            data: [51, 35, 61, 50, 68],
            type: 'line',
            borderColor: '#5d7cb9',
            backgroundColor: '#ffffff',
            tension: 0.5,
            order: 1
        },
        {
            label: 'Comparação Cpu Anterior',
            data: [37, 45, 52, 70, 73],
            type: 'line',
            borderColor: '#855151',
            backgroundColor: '#ffffff',
            tension: 0.5,
            order: 1
        },
        
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'P99 Saturação: CPU vs RAM',
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
                text: 'Piores picos registrados no periodo selecionado',
                align: 'start',
                font: {
                    size: 12
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
            title: {
            display: true,
            text: 'Uso %'
            },
            max: 100,
            ticks: {
                stepSize: 20
            }
        },
        }
    }
    }),

    new Chart(ctxDiskLat, {
    type: 'bar',
    data: {
        labels: ["DC01-WEB-05", "DC01-DB-12", "FK02-GM-02", "DC01-WEB-08"],
        datasets: [
            {
                label: 'Disco',
                data: [25.5, 40, 48, 51, 38],
                backgroundColor: '#23B26D',
                order: 2
            },
            {
                label: 'Latencia',
                data: [23, 40, 51, 52, 38],
                backgroundColor: '#1D85C2',
                order: 2
            },
            {
                label: 'Comparação Disco Anterior',
                data: [68, 25.5, 40, 48, 51],
                type: 'line',
                borderColor: '#7cc472',
                backgroundColor: '#ffffff',
                tension: 0.5,
                order: 1
            },
            {
                label: 'Comparação Latencia Anterior',
                data: [51, 23, 40, 51, 52],
                type: 'line',
                borderColor: '#9eb3dd',
                backgroundColor: '#ffffff',
                tension: 0.5,
                order: 1
            },
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'P99 Saturação: Disco vs Latencia',
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
                text: 'Piores picos registrados no periodo selecionado',
                align: 'start',
                font: {
                    size: 12
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
            title: {
            display: true,
            text: 'Uso %'
            },
            max: 100,
            ticks: {
                stepSize: 20
            }
        },
        }
    }
    }),

    atualizarGrafico();
})

function limparSessao() {
    sessionStorage.clear();
}