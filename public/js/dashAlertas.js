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
        dataCenterTitulo.innerHTML = dados.nomeDataCenter
        if (dados.imagem) {
            imagemPerfilCima.src = `/assets/imgsBd/${dados.imagem}`
        } else {
            imagemPerfilCima.src = "../assets/dashConfig/usuario.png"
        }
    })
}



function mudarAlerta1() {
    const img = document.querySelector('.checkbox1 button img');
    if (img && img.src.includes("checkAlerta.png")) {
        img.src = "../assets/dashboard-icons/checkPositivo.png";
    } else if (img) {
        img.src = "../assets/dashboard-icons/checkAlerta.png";
    }
}

function mudarAlerta2() {
    const img = document.querySelector('.checkbox2 button img');
    if (img && img.src.includes("checkAlerta.png")) {
        img.src = "../assets/dashboard-icons/checkPositivo.png";
    } else if (img) {
        img.src = "../assets/dashboard-icons/checkAlerta.png";
    }
}

function mudarAlerta3() {
    const img = document.querySelector('.checkbox3 button img');
    if (img && img.src.includes("checkAlerta.png")) {
        img.src = "../assets/dashboard-icons/checkPositivo.png";
    } else if (img) {
        img.src = "../assets/dashboard-icons/checkAlerta.png";
    }
}

function mudarAlerta4() {
    const img = document.querySelector('.checkbox4 button img');
    if (img && img.src.includes("checkAlerta.png")) {
        img.src = "../assets/dashboard-icons/checkPositivo.png";
    } else if (img) {
        img.src = "../assets/dashboard-icons/checkAlerta.png";
    }
}

function mudarAlerta5() {
    const img = document.querySelector('.checkbox5 button img');
    if (img && img.src.includes("checkAlerta.png")) {
        img.src = "../assets/dashboard-icons/checkPositivo.png";
    } else if (img) {
        img.src = "../assets/dashboard-icons/checkAlerta.png";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const alerta = document.getElementById("Alerta");
    const distribuicao = document.getElementById("distribuicao");

    new Chart(alerta, {
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
                    text: 'Alertas por semana',
                    align: 'start',
                    font: {
                        size: 18
                    },
                },
                subtitle: {
                    display: true,
                    text: 'Distribuição de alertas por severidade(último mês)',
                    align: 'start',
                    font: {
                        size: 18
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

    new Chart(distribuicao, {
        type: "doughnut",
        data: {
            labels: ["Crítico", "Médio", "Baixo"],
            datasets: [{
                data: [8, 30, 42],
                backgroundColor: ["#FF5252", "#FFA500", "#ffff00"],
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
                    text: 'Distribuição na semana',
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
                    text: 'Total de alertas por severidade',
                    align: 'start',
                    font: {
                        size: 18
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

function detalhes() {
    window.location = "dashServidorGestor.html"
}

function limparSessao() {
    sessionStorage.clear();
}