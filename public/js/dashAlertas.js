function fnNavegar(caminho){
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
    const mttr = document.getElementById("mttr")

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

    new Chart(mttr, {
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
                    text: 'MTTR de cada servidor por tipo de alerta',
                    align: 'start',
                    font: {
                        size: 18
                    },
                },
            
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
            labels: ["CPU", "RAM", "Disco", "Latência"],
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
                    text: 'Distribuição por componetes',
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
                    text: 'Total de alertas por componentes (último mês)',
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


const idUsuario = sessionStorage.ID_USUARIO;


function carregarRegioesDoGestor() {
    fetch(`/dashOperacional/listarRegioes/${idUsuario}`)
        .then(resposta => {
            if (!resposta.ok) {
                throw new Error("Erro ao buscar regiões do gestor");
            }

            return resposta.json();
        })
        .then(regioes => {
            liberarRegioesNoMapa(regioes);
            sessionStorage.ID_REGIAO = regioes.idRegiao;
        })
        .catch(erro => {
            console.error("Erro ao carregar regiões:", erro);
        });
}

function liberarRegioesNoMapa(regioesPermitidas) {
    const regioesPermitidasFormatadas = regioesPermitidas.map(regiao => {
        return {
            idRegiao: regiao.idRegiao,
            estado: regiao.estado.toLowerCase()
        };
    });

    const todosEstadosDoMapa = document.querySelectorAll("#map .state");

    todosEstadosDoMapa.forEach(estadoMapa => {
        const ufMapa = estadoMapa.dataset.state;

        const regiaoEncontrada = regioesPermitidasFormatadas.find(regiao => regiao.estado === ufMapa);

        if (regiaoEncontrada) {
            estadoMapa.classList.add("regiao-permitida");
            estadoMapa.classList.remove("regiao-bloqueada");

            estadoMapa.onclick = function (event) {
                event.preventDefault();

                const idRegiao = regiaoEncontrada.idRegiao;

                carregarDatacentersDoGestor(idRegiao);
            };
        } else {
            estadoMapa.classList.add("regiao-bloqueada");
            estadoMapa.classList.remove("regiao-permitida");

            estadoMapa.onclick = function (event) {
                event.preventDefault();
                alert("Você não possui acesso aos datacenters desta região.");
            };
        }
    });
}
function detalhes() {
    window.location = "dashServidorGestor.html"
}

function limparSessao() {
    sessionStorage.clear();
}