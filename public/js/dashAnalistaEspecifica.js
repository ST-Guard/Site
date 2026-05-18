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

    new Chart(ctxDiskLat, {
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
    }),

    new Chart(ctxDownload, {
    type: 'bar',
    data: {
        labels: ['0h', '2h', '4h', '6h', '8h', '10h', '12h', '14h', '16h', '18h', '20h', '22h', '24h', '26h', '28h', '30h', '32h', '34h', '36h', '38h', '40h', '42h', '44h', '46h', '47h'],
        datasets: [{
        label: 'Downloads',
        data: [220, 240, 320, 280, 220, 240, 320, 280, 220, 240, 320, 280, 220, 240, 320, 280, 220, 240, 320, 280, 220, 240, 320, 280, 220, 240],
        backgroundColor: 'black',
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
    }),

    new Chart(ctxRamCpu, {
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

});

function limparSessao() {
    sessionStorage.clear();
}