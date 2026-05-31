

window.onload = () => {
    buscarDados()
    atualizarDiaSemana()
    carregarDatacentersDoGestor()
}

if (!sessionStorage.ID_USUARIO) {
    conteiner_msg.innerHTML = "Você precisa estar logado!"
    loadingModal()
    window.location = "login.html";
}

function voltar(){
    window.location.href = 'inicioGestor.html';

}

 function atualizarDiaSemana(){
        var dataAtual = new Date();
      const regiao = sessionStorage.getItem("CIDADE");
        var diasDaSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
        var mesesDoAno = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

        var nomeDia = diasDaSemana[dataAtual.getDay()];
        var diaDoMes = dataAtual.getDate();
        var nomeMes = mesesDoAno[dataAtual.getMonth()];
        var ano = dataAtual.getFullYear();
        cidade.innerHTML=regiao ;
        dia_da_semana.innerHTML=`${nomeDia}, ${diaDoMes} de ${nomeMes} de ${ano}`
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
//let dadosGestora = null;
//let empresaSelecionada = "Steam";
////let datacenterSelecionado = null;

//async function carregarDashboardGestora() {
 ////   const resposta = await fetch("../json/dashGestoraOperacional.json");
 //   dadosGestora = await resposta.json();

 //   preencherSelectDatacenters();
//    selecionarDatacenterMaisCritico();
 //   renderizarDashboardDatacenter();



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


function carregarDatacentersDoGestor() {
    const idUsuario = sessionStorage.getItem("ID_USUARIO");
    const idRegiao = sessionStorage.getItem("ID_REGIAO");

    if (!idUsuario) {
        console.error("ID_USUARIO não encontrado no sessionStorage");
        return;
    }

    if (!idRegiao) {
        console.error("ID_REGIAO não encontrado no sessionStorage");
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
            selectDatacenter.innerHTML = `<option value="">Selecione um datacenter</option>`;

            datacenters.forEach(dc => {
                selectDatacenter.innerHTML += `
                    <option value="${dc.fk_datacenter}">
                        ${dc.nome}
                    </option>
                `;
            });
        })
        .catch(erro => {
            console.error("Erro ao carregar datacenters:", erro);
        });
}
function limparSessao() {
    sessionStorage.clear();
}