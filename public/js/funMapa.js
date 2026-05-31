function fnNavegar(caminho){
    window.location.href = caminho
}
window.onload = () => {
        carregarRegioesDoGestor();
        liberarRegioesNoMapa();

}

(function ($) {
	$(document).ready(function () {

		const estados = {
			sp: { saude: 90 },
			rj: { saude: 10 },
			rs: { saude: 99 }
		};
		const elRj = document.querySelector('#box_rj');
		const sigla = elRj.getAttribute('data-info');
		const spanSaude = elRj.querySelector('ul li span');
		spanSaude.textContent = estados[sigla].saude;

		const elSp = document.querySelector('#box_sp');
		const siglasp = elSp.getAttribute('data-info');
		const spansaudesp = elSp.querySelector('ul li span');

		spansaudesp.textContent = estados[siglasp].saude;

		const elRs = document.querySelector('#box_rs');
		const siglars = elRs.getAttribute('data-info');
		const spansauders = elRs.querySelector('ul li span');

		spansauders.textContent = estados[siglars].saude;

		function obterStatus(saude) {

			if (saude > 90) {
				return {
					estado: "#b6ffb6",
					glow: "#00ba60"
				};
			}

			if (saude > 75) {
				return {
					estado: "#ffeaab",
					glow: "#e8c82c"
				};
			}

			return {
				estado: "#ffa39b",
				glow: "#ff0033"
			};
		}

		$("#map .state").each(function () {

			const estado = $(this).data("state");

			if (!estados[estado]) {

				$(this).css({
					"pointer-events": "none",
					"cursor": "default"
				});

				return;
			}

			$(this).addClass("active");

			const info = estados[estado];
			const status = obterStatus(info.saude);

			$(this).find(".shape").css({
				fill: status.estado
			});

			$(this).find(".alerta").css({
				fill: status.glow
			});

			$(this).find(".icon_state").css({
				fill: status.glow,
				filter:
					`drop-shadow(0 0 6px ${status.glow})
           drop-shadow(0 0 14px ${status.glow})`
			});

		});

		$("#map .state").on("click", function (e) {

			e.preventDefault();

			const estado = $(this).data("state");

			if (!estados[estado]) return;

			$(".parca .estado").css({
				opacity: 0,
				visibility: "hidden"
			});

			$("#box_" + estado).css({
				opacity: 1,
				visibility: "visible"
			});

		});

	});
})(jQuery);




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
                sessionStorage.ID_REGIAO = regiaoEncontrada.idRegiao;
                sessionStorage.UF = regiaoEncontrada.estado;
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

function selecionarDatacenters(){
        window.location.href = 'dashOperacionalGestor.html';
}

function limparSessao() {
    sessionStorage.clear();
}