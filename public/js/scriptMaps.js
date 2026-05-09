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







let dataSelecionado = null;

function selecionarAlerta(data) {
	const kpis = document.getElementById("container_kpis");
	const parte1 = document.getElementById("parte1");
	const scrollAlertas = document.getElementById("lista_alertas");
	const mapa = document.getElementById("mapa");
	const titulo = document.getElementById("dataCenterTitulo")
	const voltar = document.getElementById("voltar")

	let dataSelecionado = data;
	let nome;

	if (data == 1) {
		nome = "São Paulo"
	} else if (data == 2) {
		nome = "Rio de Janeiro"
	} else {
		nome = "Porto Alegre"
	}

	titulo.innerHTML = nome

	voltar.style.display = "flex";
	kpis.style.display = "flex";
	parte1.style.display = "flex";
	scrollAlertas.style.display = "flex";
	mapa.style.display = "none";
}

function voltar() {
	const kpis = document.getElementById("container_kpis");
	const parte1 = document.getElementById("parte1");
	const scrollAlertas = document.getElementById("lista_alertas");
	const mapa = document.getElementById("mapa");
	const titulo = document.getElementById("dataCenterTitulo")
	const voltar = document.getElementById("voltar")

	titulo.innerHTML = ""

	voltar.style.display = "none";
	kpis.style.display = "none";
	parte1.style.display = "none";
	scrollAlertas.style.display = "none";
	mapa.style.display = "block";
}