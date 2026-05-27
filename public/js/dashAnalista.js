function fnNavegar(caminho){
    window.location.href = caminho
}


 if (!sessionStorage.ID_USUARIO) {
   alert("Você precisa estar logado!");
   window.location = "login.html";
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





// Grafico 1


  const ctx = document.getElementById('myChart');

  new Chart(ctx, {
 type: 'line',
    data: {


        labels: ['10:15', '10:20', '10:25', '10:30', '10:35', '10:40', '10:45', '10:50', '10:55', '11:00'],
        datasets: [{
            label: 'Quantidade de jogadores na sexta passada',
            data: [872, 800, 895,905, 910, 920, 935, 975,990, 1012],
            borderColor: '#244770',
            borderWidth: 4,
            tension: 0.1,
                     
        }, {
            label: 'Quantidade com latencia alta',
            data: [900,913, 935,940, 960, 990, 1020, 1035, 1040, 1200],
            borderColor: '#66C0F4',
            borderWidth: 4,
            tension: 0.1,
            
        }]
  
    
    },
    options: {
        plugins: {
            legend: {
                display: false
            }
        },
        responsive: true,
        maintainAspectRatio: false,

      scales: {
        y: {
          
          ticks: {
            stepSize: 50,
            color: '#6B7280'

        }
    },
        x: {

          ticks: {
            stepSize: 25,
            color: '#6B7280'

        }
        }
      },

    }
  });




// Grafico 2

  const ctx2 = document.getElementById('myChart2');

  new Chart(ctx2, {
 type: 'line',
    data: {


        labels: ['10:15', '10:20', '10:25', '10:30', '10:35', '10:40', '10:45', '10:50', '10:55', '11:00'],
        datasets: [{
            label: 'Tempo estipulado pela SLA',
            data: [10, 10, 10,10, 10, 10,10,10,10,10],
            borderColor: '#FF0000',
             borderWidth: 4,
            tension: 0.1    
        }, {
            label: 'Tempo de resolução ultimo alerta',
            data: [ 5,12, 3, 2, 3,4,5,7,8,9],
            borderColor: '#244770',
            borderWidth: 4,
                        tension: 0.1       
        }]
  
    
    },
    options: {
        plugins: {
            legend: {
                display: false
            }
        },
        responsive: true,
        maintainAspectRatio: false,

      scales: {
        y: {
          
          ticks: {
        
            color: '#6B7280'

        }
    },
        x: {

          ticks: {
        
            color: '#6B7280'

        }
        }
      },

    }
  });



// Grafico 3



  const ctx3 = document.getElementById('myChart3');

  new Chart(ctx3, {
 type: 'line',
    data: {


        labels: ['10:15', '10:20', '10:25', '10:30', '10:35', '10:40', '10:45', '10:50', '10:55', '11:00'],
        datasets: [{
            label: 'Quantidade total de Armazenamento',
            data: [40, 44, 43, 45,46,47,48,48, 47,49],
            borderColor: '#2B2377',
            borderWidth: 4,    
            tension: 0.1,
            fill: true,
            backgroundColor: 'rgba(126, 184, 255, 0.29)',  
        }, {
            label: 'Quantidade com latencia alta',
            data: [11, 13, 8,14, 15, 18,21, 21, 21,18],
            borderColor: '#FFC100',
            borderWidth: 4,
            tension: 0.1      
        }]
  
    
    },
    options: {
        plugins: {
            legend: {
                display: false
            }
        },
        responsive: true,
        maintainAspectRatio: false,

      scales: {
        y: {
          
          ticks: {
            
            color: '#6B7280'

        }
    },
        x: {

          ticks: {
            
            color: '#6B7280'

        }
        }
      },

    }
  });






// Grafico 4


  const ctx4 = document.getElementById('myChart4');

  new Chart(ctx4, {
    type: 'line',
    data: {


        labels: ['10:15', '10:20', '10:25', '10:30', '10:35', '10:40', '10:45', '10:50', '10:55', '11:00'],
        datasets: [{
            label: 'Quantidade de sobrecarregados',
            data: [10, 12, 8,9, 12, 15, 16, 14,14,12],
            borderColor: '#66C0F4',
            borderWidth: 4,
            pointRadius: 2,
            tension: 0.3     
        }, {
            label: 'Quantidade com latencia alta',
            data: [11, 13, 5,14, 14, 15, 17,15,18, 14,12,11],
            borderColor: '#FFBB00',   
            borderWidth: 4,
            pointRadius: 2,

            tension: 0.3   
        }]
  
    
    },
    options: {
        plugins: {
            legend: {
                display: false
            }
        },
        responsive: true,
        maintainAspectRatio: false,

      scales: {
        y: {
          
          ticks: {
            
            color: '#6B7280'

        }
    },
        x: {

          ticks: {
            
            color: '#6B7280'

        }
        }
      },

    }
  });








function limparSessao() {
    sessionStorage.clear();
}