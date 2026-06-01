function fnNavegar(caminho) {
    window.location.href = caminho
}
window.onload = () => {
    buscarDados(),
        carregarRegioesDoGestor();

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
            dataCenterTitulo.innerHTML = dados.nomeDataCenter
            if (dados.imagem) {
                imagemPerfilCima.src = `/assets/imgsBd/${dados.imagem}`
            } else {
                imagemPerfilCima.src = "../assets/dashConfig/usuario.png"
            }
        })
}

document.addEventListener("DOMContentLoaded", () => {
    const alerta = document.getElementById("Alerta");
    const distribuicao = document.getElementById("distribuicao");
    const mttr = document.getElementById("mttr")

    window.chartAlerta = new Chart(alerta, {
        type: "bar",
        data: {
            labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
            datasets: [
                {
                    label: "Baixo",
                    data: [9, 8, 12, 13],
                    backgroundColor: "#ffff00",
                    borderRadius: 6
                },
                {
                    label: "Medio",
                    data: [6, 7, 9, 8],
                    backgroundColor: "#FFA500",
                    borderRadius: 6
                },
                {
                    label: "Crítico",
                    data: [3, 2, 2, 1],
                    backgroundColor: "#FF5252",
                    borderRadius: 6
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Distribuição de alertas por severidade (último mês)',
                    align: 'start',
                    font: {
                        size: 18
                    },
                },
                subtitle: {
                    display: true,
                    text: 'Máximo esperado: Baixos: 10 - 20 | Médios: 2 - 5 | Críticos: 0 - 1',
                    align: 'start',
                    font: {
                        size: 15
                    },
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

    window.chartMttr = new Chart(mttr, {
        type: "bar",
        data: {
            labels: ["SERVIDOR-DH-01", "SERVIDOR-DH-02", "SERVIDOR-DH-03", "SERVIDOR-DH-04", "SERVIDOR-DH-05", "SERVIDOR-DH-06", "SERVIDOR-DH-07", "SERVIDOR-DH-08", "SERVIDOR-DH-09"],
            datasets: [
                {
                    label: "Baixo",
                    data: [9, 8, 12, 13, 10, 9, 3, 7, 8],
                    backgroundColor: "#ffff00",
                    borderRadius: 6
                },
                {
                    label: "Medio",
                    data: [6, 7, 9, 8, 10, 11, 15, 18, 9],
                    backgroundColor: "#FFA500",
                    borderRadius: 6
                },
                {
                    label: "Crítico",
                    data: [3, 2, 2, 1, 10, 11, 19, 20, 22],
                    backgroundColor: "#FF5252",
                    borderRadius: 6
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                title: {
                    display: true,
                    text: 'MTTR de cada servidor por tipo de alerta em Horas',
                    align: 'start',
                    font: {
                        size: 18
                    },
                },
                subtitle: {
                    display: true,
                    text: 'SLA Baixos : 24 | SLA Médios: 4 | SLA Críticos: 1',
                    align: 'start',
                    color: '#666',
                    font: {
                        size: 14,
                        family: 'Arial',
                        weight: 'normal'
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

    window.chartDistribuicao = new Chart(distribuicao, {
        type: "doughnut",
        data: {
            labels: ["CPU", "Disco", "RAM", "REDE"],
            datasets: [{
                data: [8, 19, 33, 30],
                backgroundColor: ["#52ffeb", "#0008ff", "#7700ff", "#00ffe1"],
                borderColor: "#ffffff",
                borderWidth: 3,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "48%",
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        generateLabels(chart) {
                            const data = chart.data;
                            const labels = [];

                            labels.push({
                                text: `${data.labels[0]} ${data.datasets[0].data[0]}`,
                                fillStyle: data.datasets[0].backgroundColor[0],
                                index: 0
                            });
                            labels.push({
                                text: `${data.labels[1]} ${data.datasets[0].data[1]}`,
                                fillStyle: data.datasets[0].backgroundColor[1],
                                index: 1
                            });
                            labels.push({
                                text: `${data.labels[2]} ${data.datasets[0].data[2]}`,
                                fillStyle: data.datasets[0].backgroundColor[2],
                                index: 2
                            });
                            return labels;
                        }
                    },
                },
                title: {
                    display: true,
                    text: 'Distribuição de alertas por componentes (último mês)',
                    align: 'start',
                    font: {
                        size: 18
                    },
                    padding: {
                        top: 10,
                    }
                },
                subtitle: {
                    display: true,
                    text: 'Máximo esperado: 12 - 26',
                    align: 'start',
                    font: {
                        size: 15
                    },
                    padding: {
                        bottom: 30,
                    }
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });
});

const idUsuario = sessionStorage.ID_USUARIO;

function detalhes() {
    window.location = "dashServidorGestor.html"
}

function limparSessao() {
    sessionStorage.clear();
}