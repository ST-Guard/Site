
function fnNavegar(caminho) {
  window.location.href = caminho;
}

function limparSessao() {
  sessionStorage.clear();
}

window.onload = () => {
  buscarDados();
};

function buscarDados() {
  const idUsuario = sessionStorage.ID_USUARIO;
  if (!idUsuario) return; 

  // Puxar Kpis
  fetch(`/sessao/buscarUsuario/${idUsuario}`)
    .then(r => r.json())
    .then(dados => {
      dados = dados[0];
      document.getElementById('username').innerHTML  = dados.nomePessoa;
      document.getElementById('cargoname').innerHTML = dados.cargo;
      const img = document.getElementById('imagemPerfilCima');
      img.src = dados.imagem
        ? `/assets/imgsBd/${dados.imagem}`
        : '../assets/dashConfig/usuario.png';
    })
    .catch(() => {}); 



    const BUCKET = 'smartdatabucket2'
        fetch("/financeira/pegarDadosFinanceira", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            bucket: BUCKET
        })
    })
     .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {
        if(dados == [] || dados == null || dados == {}){
          console.log("Dados não encontrados")
          return
        }
            console.log("Dados buscados pelo S3 com sucesso!");
            console.log(dados)
            plotarDados(dados)
    });


}

function formatarMoeda(valor) {
  return Number(valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatarPercentual(valor) {
  return `${Number(valor || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
}

function formatarDeltaMoeda(valor) {
  const numero = Number(valor || 0);
  const seta = numero >= 0 ? '▲' : '▼';
  const sinal = numero >= 0 ? '+' : '-';
  return `${seta} ${sinal}${formatarMoeda(Math.abs(numero))} vs mês anterior`;
}

function formatarDeltaPercentual(valor) {
  const numero = Number(valor || 0);
  const seta = numero >= 0 ? '▲' : '▼';
  const sinal = numero >= 0 ? '+' : '';
  return `${seta} ${sinal}${numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}pp vs mês anterior`;
}

function atualizarTexto(id, valor) {
  const elemento = document.getElementById(id);
  if (elemento) elemento.textContent = valor;
}

function atualizarBadge(id, valor, positivoVerde = true) {
  const elemento = document.getElementById(id);
  if (!elemento) return;

  const positivo = Number(valor || 0) >= 0;
  elemento.classList.remove('badge-kpi-verde', 'badge-kpi-vermelho');
  elemento.classList.add(positivo === positivoVerde ? 'badge-kpi-verde' : 'badge-kpi-vermelho');
}

let projecoesPreditivas = [];
let mesesForecast = 3;
let forecastChartInst;

function primeiroValorObjeto(objeto, chaves, padrao = undefined) {
  if (!objeto) return padrao;

  for (const chave of chaves) {
    if (objeto[chave] !== undefined && objeto[chave] !== null) return objeto[chave];
  }

  return padrao;
}

function formatarMesGrafico(mesAno) {
  const [ano, mes] = String(mesAno || '').split('-');
  const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const indiceMes = Number(mes) - 1;

  if (!ano || indiceMes < 0 || indiceMes > 11) return mesAno;
  return `${nomesMeses[indiceMes]}/${ano.slice(2)}`;
}

function aplicarHistoricoMensal(historicoMensal, projecoes = []) {
  if (!Array.isArray(historicoMensal) || historicoMensal.length === 0) return;

  const tresMesesProjecao = Array.isArray(projecoes) ? projecoes.slice(0, 3) : [];
  const ultimoCustoHistorico = Number(historicoMensal[historicoMensal.length - 1]?.custo || 0) / 1000;
  const ultimaReceitaHistorica = Number(historicoMensal[historicoMensal.length - 1]?.receita || 0) / 1000;

  HISTORICO_MESES = historicoMensal.map(item => formatarMesGrafico(item.mes));
  custoHistorico = historicoMensal.map(item => Number(item.custo || 0) / 1000);
  receitaHistorica = historicoMensal.map(item => Number(item.receita || 0) / 1000);
  historicoRoi = historicoMensal.map(item => Number(item.roi || 0));

  todosRotulos = [...HISTORICO_MESES, ...tresMesesProjecao.map(item => formatarMesGrafico(item.mes))];
  todosCustos = [...custoHistorico, ...tresMesesProjecao.map(() => null)];
  todasReceitas = [...receitaHistorica, ...tresMesesProjecao.map(() => null)];
  prevCustoLn = [...HISTORICO_MESES.slice(0, -1).map(() => null), ultimoCustoHistorico, ...tresMesesProjecao.map(item => Number(item.custo_previsto || 0) / 1000)];
  prevReceitaLn = [...HISTORICO_MESES.slice(0, -1).map(() => null), ultimaReceitaHistorica, ...tresMesesProjecao.map(item => Number(item.receita_prevista || 0) / 1000)];
  orcamentoLn = [...HISTORICO_MESES.map(() => null), ...tresMesesProjecao.map(item => Number(item.orcamento || 0) / 1000)];

  const botaoAtivo = document.querySelector('.btn-periodo.active:not(.roi-period-btn)');
  const periodoAtivo = botaoAtivo
    ? Array.from(document.querySelectorAll('.btn-periodo:not(.roi-period-btn)')).indexOf(botaoAtivo) + 1
    : 3;

  definirPeriodo(periodoAtivo, botaoAtivo);
}

function plotarDados(dadosS3){
  const kpis = dadosS3.KPIS || {};
  const roi = kpis.ROI || {};
  const faturamento = kpis.FATURAMENTO_TOTAL || {};
  const custo = kpis.CUSTO_TOTAL || {};
  const orcamento = kpis.ORCAMENTO || {};
  const previsto = kpis.CUSTO_PREVISTO || {};


  // KPIS
  atualizarTexto("ROI_ESTIMADO", formatarPercentual(roi.ROI_MES_CORRENTE));
  atualizarTexto("RECEITA_LIQUIDA", formatarMoeda(roi.MARGEM_LIQUIDO));
  atualizarTexto("DELTA_ROI", formatarDeltaPercentual(roi.DELTA_ROI));
  atualizarBadge("DELTA_ROI", roi.DELTA_ROI);

  atualizarTexto("kpi-rev-val", formatarMoeda(faturamento.FATURAMENTO));
  atualizarTexto("kpi-rev-delta", formatarDeltaMoeda(faturamento.DELTA_FATURAMENTO));
  atualizarBadge("kpi-rev-delta", faturamento.DELTA_FATURAMENTO);

  atualizarTexto("kpi-cost-val", formatarMoeda(custo.CUSTO));
  atualizarTexto("kpi-cost-delta", formatarDeltaMoeda(custo.DELTA_CUSTO));
  atualizarBadge("kpi-cost-delta", custo.DELTA_CUSTO, false);

  atualizarTexto("kpi-cost-budget-ref", formatarMoeda(orcamento.CUSTO_PREVISTO));
  atualizarTexto("kpi-budget-val", formatarMoeda(orcamento.CUSTO_PREVISTO));
  atualizarTexto("kpi-budget-ref", formatarMoeda(previsto.CUSTO_PREVISTO || orcamento.CUSTO_PREVISTO));
  atualizarTexto("budget-regression-val", formatarMoeda(previsto.CUSTO_PREVISTO || orcamento.CUSTO_PREVISTO));
  atualizarTexto("budget-approved-val", formatarMoeda(orcamento.CUSTO_PREVISTO));
  atualizarTexto("budget-actual-val", formatarMoeda(orcamento.CUSTO_CORRENTE || custo.CUSTO));
  atualizarTexto("kpi-predicted", formatarMoeda(previsto.CUSTO_PREVISTO));

  // GRAFICOS
  projecoesPreditivas = Array.isArray(dadosS3.PROJECOES) ? dadosS3.PROJECOES : [];
  aplicarHistoricoMensal(dadosS3.HISTORICO_MENSAL, dadosS3.PROJECOES);
  aplicarDadosGraficos(dadosS3.GRAFICOS);
  renderizarPreditivo();
}

function aplicarDadosGraficos(graficos) {
  if (!graficos) return;

  if (graficos.DONUT_CUSTOS) {
    aplicarDonutCustos(graficos.DONUT_CUSTOS);
  }

  if (Array.isArray(graficos.BARRAS_DATACENTER)) {
    aplicarBarrasDatacenter(graficos.BARRAS_DATACENTER);
  }

  if (Array.isArray(graficos.TOP_SERVIDORES)) {
    aplicarTopServidores(graficos.TOP_SERVIDORES);
  }
}

function abrirModalPreditivo() {
  const modal = document.getElementById('modal-preditivo');
  if (!modal) return;

  modal.classList.add('active');
  renderizarPreditivo();
}

function fecharModalPreditivo() {
  const modal = document.getElementById('modal-preditivo');
  if (modal) modal.classList.remove('active');
}

function scrollToPredict() {
  abrirModalPreditivo();
}

function setForecastMonths(qtdMeses, botao) {
  mesesForecast = Number(qtdMeses || 3);
  document.querySelectorAll('.btn-mr').forEach(btn => btn.classList.remove('active'));
  if (botao) botao.classList.add('active');

  const slider = document.getElementById('month-slider');
  if (slider) slider.value = mesesForecast;
  atualizarTexto('slider-display', mesesForecast);
  renderizarPreditivo();
}

function onSliderInput(valor) {
  mesesForecast = Number(valor || 3);
  atualizarTexto('slider-display', mesesForecast);
  document.querySelectorAll('.btn-mr').forEach(btn => btn.classList.toggle('active', Number(btn.textContent.replace('M', '')) === mesesForecast));
  renderizarPreditivo();
}

function renderizarPreditivo() {
  const grid = document.getElementById('predict-grid');
  const canvas = document.getElementById('forecastChart');
  if (!grid || !canvas) return;

  const projecoes = projecoesPreditivas.slice(0, mesesForecast);
  grid.innerHTML = projecoes.length
    ? projecoes.map((item, i) => `
      <div class="cartao-mes-preditivo">
        <div class="rotulo-mes-preditivo"><span class="num-mes">${i + 1}</span>${formatarMesGrafico(item.mes)}</div>
        <div class="linha-preditiva">
          <span class="rotulo-linha-preditiva">Custo</span>
          <span class="valor-linha-preditiva custo">${formatarMoeda(item.custo_previsto)}</span>
        </div>
        <div class="linha-preditiva">
          <span class="rotulo-linha-preditiva">Receita</span>
          <span class="valor-linha-preditiva receita">${formatarMoeda(item.receita_prevista)}</span>
        </div>
        <div class="linha-preditiva">
          <span class="rotulo-linha-preditiva">ROI</span>
          <span class="valor-linha-preditiva roi">${formatarPercentual(item.roi_previsto)}</span>
        </div>
        <div class="confianca-preditiva">
          Confiança ${Number(item.confianca || 0)}%
          <div class="barra-confianca"><div class="preenchimento-confianca" style="width:${Number(item.confianca || 0)}%"></div></div>
        </div>
      </div>
    `).join('')
    : '<div class="cartao-mes-preditivo"><div class="rotulo-mes-preditivo">Sem projeções carregadas</div></div>';

  const historicoLabels = HISTORICO_MESES.slice(-6);
  const historicoCustos = custoHistorico.slice(-6);
  const labels = [...historicoLabels, ...projecoes.map(item => formatarMesGrafico(item.mes))];
  const custosHistoricos = [...historicoCustos, ...projecoes.map(() => null)];
  const ultimoCusto = historicoCustos[historicoCustos.length - 1] || null;
  const custosPrevistos = [
    ...historicoCustos.slice(0, -1).map(() => null),
    ultimoCusto,
    ...projecoes.map(item => Number(item.custo_previsto || 0) / 1000)
  ];
  const orcamentos = [
    ...historicoCustos.map(() => null),
    ...projecoes.map(item => Number(item.orcamento || 0) / 1000)
  ];

  if (forecastChartInst) forecastChartInst.destroy();
  forecastChartInst = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Custo histórico', data: custosHistoricos, borderColor: '#66C0F4', backgroundColor: 'rgba(102,192,244,0.08)', borderWidth: 2, pointRadius: 3, tension: 0.35, fill: true },
        { label: 'Custo previsto', data: custosPrevistos, borderColor: '#66C0F4', borderDash: [6,4], borderWidth: 2, pointRadius: 4, tension: 0.35, fill: false, spanGaps: false },
        { label: 'Orçamento', data: orcamentos, borderColor: '#F5CC4D', borderDash: [4,4], borderWidth: 1.5, pointRadius: 0, tension: 0.35, fill: false, spanGaps: false }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${formatarMoeda(Number(ctx.raw || 0) * 1000)}` } }
      },
      scales: {
        y: { ticks: { callback: valor => `${valor}k` }, grid: { color: 'rgba(255,255,255,0.08)' } },
        x: { grid: { display: false } }
      }
    }
  });
}



// ══════════════════════════════════════════════
//  POPUP DO ORÇAMENTO
  
function toggleBudgetPopover(e) {
  const pop = document.getElementById('budget-popover');
  pop.classList.toggle('open');
  if (pop.classList.contains('open')) updateBudgetPanel();
}

function closeBudgetPopover(e) {
  document.getElementById('budget-popover').classList.remove('open');
}



// ══════════════════════════════════════════════
// MODAL DA KPIA ROI (GRAFICO DE LINHA)
   
let instanciaGraficoRoi;

function construirGraficoRoi(rotulos, historico) {
  if (instanciaGraficoRoi) instanciaGraficoRoi.destroy();
  
  instanciaGraficoRoi = new Chart(document.getElementById('roiChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: rotulos, 
      datasets: [{
        label: 'ROI',
        data: historico,
        borderColor: '#4CAF82',
        backgroundColor: 'rgba(76,175,130,0.1)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#4CAF82',
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `ROI: +${c.raw}%` } }
      },
      scales: {
        y: { ticks: { callback: v => v + '%' }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

function definirPeriodoRoi(periodo, botao) {
  document.querySelectorAll('.roi-period-btn').forEach(b => b.classList.remove('active'));
  if (botao) botao.classList.add('active');
  
  let inicio = 0;
  if (periodo === 1) inicio = Math.max(HISTORICO_MESES.length - 1, 0);
  else if (periodo === 2) inicio = Math.max(HISTORICO_MESES.length - 6, 0);
  else if (periodo === 3) inicio = Math.max(HISTORICO_MESES.length - 12, 0);
  else if (periodo === 4) {
    const ultimoAno = HISTORICO_MESES[HISTORICO_MESES.length - 1]?.split('/')[1];
    const indiceYtd = HISTORICO_MESES.findIndex(mes => mes.endsWith(`/${ultimoAno}`) && mes.startsWith('Jan'));
    inicio = indiceYtd >= 0 ? indiceYtd : 0;
  }
  
  construirGraficoRoi(HISTORICO_MESES.slice(inicio), historicoRoi.slice(inicio));
}

function abrirModalRoi() {
  document.getElementById('roi-modal').classList.add('active');
  
  const botaoAtivo = document.querySelector('.roi-period-btn.active') || document.querySelectorAll('.roi-period-btn')[2];
  const indicePeriodo = Array.from(document.querySelectorAll('.roi-period-btn')).indexOf(botaoAtivo) + 1;
  
  definirPeriodoRoi(indicePeriodo, botaoAtivo);
}

function fecharModalRoi() {
  document.getElementById('roi-modal').classList.remove('active');
}


// ══════════════════════════════════════════════
// GRAFICO DE LINHAS (Custo x Receita)

let HISTORICO_MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
let custoHistorico = [12, 14, 13, 15, 14, 16, 15, 17, 18, 16, 19, 20]; 
let receitaHistorica = [25, 28, 26, 30, 29, 32, 34, 33, 36, 35, 38, 40]; 
const mesAtual = 11; 
const margemOrcamentoPct = 10; 


function rotuloMes(indice) {
  const mesesFuturos = ['Jan (Prev)', 'Fev (Prev)', 'Mar (Prev)'];
  return mesesFuturos[indice] || `Mês ${indice + 1}`;
}


function calcularPrevisao(mesAtual, mesesAFrente) {
    return receitaHistorica[11] * (1 + (mesesAFrente * 0.05)); 
}


function gerarPrevisoes(quantidade) {
  const previsoes = [];

  for (let i = 0; i < quantidade; i++) {
    const custoFicticio = Math.random() * (25 - 20) + 20; 
    const receitaFicticia = Math.random() * (50 - 40) + 40; 
    const roiFicticio = (((receitaFicticia - custoFicticio) / custoFicticio) * 100).toFixed(1);

    previsoes.push({
      custo: custoFicticio,
      receita: receitaFicticia,
      roi: parseFloat(roiFicticio) 
    });
  }

  return previsoes;
}

const previsoesL3 = gerarPrevisoes(3);


let todosRotulos = [...HISTORICO_MESES, ...previsoesL3.map((_, i) => rotuloMes(i))];
let todosCustos = [...custoHistorico, ...Array(3).fill(null)];
let todasReceitas = [...receitaHistorica, ...Array(3).fill(null)];
let prevCustoLn = [...custoHistorico.map(() => null), custoHistorico[11], ...previsoesL3.map(f => f.custo)];
let prevReceitaLn = [...receitaHistorica.map(() => null), receitaHistorica[11], ...previsoesL3.map(f => f.receita)];
let orcamentoLn = todosRotulos.map((_, i) => Math.round(calcularPrevisao(mesAtual, i + 1) * (1 + margemOrcamentoPct / 100)));

let historicoRoi = custoHistorico.map((c, i) => parseFloat((((receitaHistorica[i] - c) / c) * 100).toFixed(1)));
const previsaoRoi = previsoesL3.map(f => parseFloat(f.roi));
const todoHistoricoRoi = [...historicoRoi, ...Array(3).fill(null)];
const todaPrevisaoRoi = [...Array(11).fill(null), historicoRoi[11], ...previsaoRoi];

Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";
Chart.defaults.color = '#6B7E91';

let graficoLinha;
let estadoFiltroGrafico = 'todos';

function construirGraficoLinha(rotulos, custo, receita, prevCusto, prevReceita, orcamento) {
  if (graficoLinha) graficoLinha.destroy();
  
  graficoLinha = new Chart(document.getElementById('lineChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: rotulos,
      datasets: [

        { label: 'Custo',            data: custo,             borderColor: '#2C5D86', backgroundColor: 'rgba(44,93,134,0.07)', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#2C5D86', tension: 0.35, fill: true, spanGaps: false },
        { label: 'Receita',          data: receita,           borderColor: '#F5CC4D', backgroundColor: 'rgba(245,204,77,0.06)', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#F5CC4D', tension: 0.35, fill: true, spanGaps: false },
        { label: 'Previsão Custo',   data: prevCusto,         borderColor: '#66C0F4', borderWidth: 2, borderDash: [6,4], pointRadius: 5, pointStyle: 'rectRot', pointBackgroundColor: '#66C0F4', tension: 0.35, fill: false, spanGaps: false },
        { label: 'Previsão Receita', data: prevReceita,       borderColor: '#FFF47C', borderWidth: 2, borderDash: [6,4], pointRadius: 5, pointStyle: 'rectRot', pointBackgroundColor: '#FFF47C', tension: 0.35, fill: false, spanGaps: false },
        { label: 'Orçamento',        data: orcamento,         borderColor: '#F5CC4D', borderWidth: 1.5, borderDash: [3,3], pointRadius: 0, tension: 0.35, fill: false, spanGaps: true, backgroundColor: 'transparent' },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { 
            callbacks: { 
                label: c => `${c.dataset.label}: R$ ${c.raw ? c.raw.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) : '--'}k` 
            } 
        }
      },
      scales: {
        y: { ticks: { callback: v => v + 'k', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

function definirPeriodo(periodo, botao) {
  document.querySelectorAll('.btn-periodo:not(.roi-period-btn)').forEach(b => b.classList.remove('active'));
  if (botao) botao.classList.add('active');
  
  let inicio = 0;
  if (periodo === 1) inicio = Math.max(HISTORICO_MESES.length - 1, 0);
  else if (periodo === 2) inicio = Math.max(HISTORICO_MESES.length - 6, 0);
  else if (periodo === 3) inicio = Math.max(HISTORICO_MESES.length - 12, 0);
  else if (periodo === 4) {
    const ultimoAno = HISTORICO_MESES[HISTORICO_MESES.length - 1]?.split('/')[1];
    const indiceYtd = HISTORICO_MESES.findIndex(mes => mes.endsWith(`/${ultimoAno}`) && mes.startsWith('Jan'));
    inicio = indiceYtd >= 0 ? indiceYtd : 0;
  }
  
  construirGraficoLinha(todosRotulos.slice(inicio), todosCustos.slice(inicio), todasReceitas.slice(inicio), prevCustoLn.slice(inicio), prevReceitaLn.slice(inicio), orcamentoLn.slice(inicio));
  
  if (estadoFiltroGrafico !== 'todos') alternarGraficoLinha(estadoFiltroGrafico, true);
}



function alternarGraficoLinha(tipo, ignorarRolagem = false) {
  if (!ignorarRolagem) {
    document.getElementById('charts-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
    const cartaoGrafico = document.getElementById('line-chart-card');
    cartaoGrafico.classList.remove('pulso-destaque');
    void cartaoGrafico.offsetWidth; 
    cartaoGrafico.classList.add('pulso-destaque');
    setTimeout(() => cartaoGrafico.classList.remove('pulso-destaque'), 1500);
  }
  
  if (estadoFiltroGrafico === tipo && !ignorarRolagem) {
    estadoFiltroGrafico = 'todos';
    graficoLinha.data.datasets.forEach(ds => ds.hidden = false);
  } else {
    estadoFiltroGrafico = tipo;
    graficoLinha.data.datasets.forEach((ds, i) => {
      if (tipo === 'custo')   ds.hidden = (i === 1 || i === 3);
      else if (tipo === 'receita') ds.hidden = (i === 0 || i === 2);
    });
  }
  graficoLinha.update();
}


// ══════════════════════════════════════════════
// GRAFICO DE DONUTS
   

const dColors = ['#66C0F4','#0F1C2E','#F5CC4D','#F5A623','#E05050'];
let dLabels = ['Energia','Hardware','Licenças','Manutenção','Rede'];
let dValues = [38,28,16,12,6];
let dAbsValues = [];
let donutChartInst;

function buildDonutChart() {
  if (donutChartInst) donutChartInst.destroy();

  donutChartInst = new Chart(document.getElementById('donutChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: dLabels,
      datasets: [{ data: dValues, backgroundColor: dColors, borderWidth: 2, borderColor: '#fff' }]
    },
    options: {
      responsive: true,
      cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${c.label}: ${c.raw}%` } }
      }
    }
  });

  const dl = document.getElementById('donut-legend');
  dl.innerHTML = '';
  dLabels.forEach((l, i) => {
    const absVal = dAbsValues[i] ?? Math.round(562000 * dValues[i] / 100);
    dl.innerHTML += `<div class="item-legenda-donut">
      <div class="esq-legenda-donut">
        <div class="ponto-donut" style="background:${dColors[i]}"></div>
        <span style="color:var(--text-muted);font-size:12px;">${l}</span>
      </div>
      <div style="text-align:right;">
        <span class="pct-donut">${dValues[i]}%</span>
        <div id="donut-abs-${i}" style="font-size:10px;color:var(--text-muted);margin-top:1px;">${formatarMoeda(absVal)}</div>
      </div>
    </div>`;
  });
}

function aplicarDonutCustos(donutCustos) {
  const entradas = Object.entries(donutCustos);
  const total = entradas.reduce((soma, [, valor]) => soma + Number(valor || 0), 0);
  if (total <= 0) return;

  const nomes = {
    energia: 'Energia',
    rede: 'Rede',
    hardware: 'Hardware',
    fixo_global: 'Fixo global'
  };

  dLabels = entradas.map(([chave]) => nomes[chave] || chave.replace(/_/g, ' '));
  dAbsValues = entradas.map(([, valor]) => Number(valor || 0));
  dValues = dAbsValues.map(valor => Number(((valor / total) * 100).toFixed(1)));

  buildDonutChart();
}


// ══════════════════════════════════════════════
// GRAFICO DE BARRA (custo / ROI por datacenter)
   
let dcLabels = ['DC01-SP','DC02-RJ','DC03-MG','DC04-RS','DC05-PE'];
let dcCosts  = [180000, 138000, 102000, 80000, 62000];
let dcRevs   = [302000, 223000, 172000, 115000, 48000];
let dcRois   = dcCosts.map((c, i) => parseFloat((((dcRevs[i] - c) / c) * 100).toFixed(1)));

let barChartInst;
let barView = 'custo';

function setBarView(view, btn) {
  barView = view;
  document.querySelectorAll('.alternador-vista .btn-alternador').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('bar-title').textContent = view === 'custo'
    ? 'Comparação de custo entre datacenters'
    : 'ROI por datacenter';
  document.getElementById('bar-sub').textContent = view === 'custo'
    ? 'Custo mensal — soma = ' + 562000
    : 'Receita sobre custo por DC (negativo = prejuízo)';
  buildBarChart();
}

function aplicarBarrasDatacenter(barrasDatacenter) {
  if (!barrasDatacenter.length) return;

  dcLabels = barrasDatacenter.map(item => primeiroValorObjeto(item, ['datacenter', 'DATACENTER', 'dc', 'DC', 'nome', 'NOME', 'name', 'label'], 'DC'));
  dcCosts = barrasDatacenter.map(item => Number(primeiroValorObjeto(item, ['custo', 'CUSTO', 'custo_total', 'CUSTO_TOTAL', 'cost', 'valor', 'VALOR'], 0)));
  dcRevs = barrasDatacenter.map(item => Number(primeiroValorObjeto(item, ['receita', 'RECEITA', 'receita_total', 'RECEITA_TOTAL', 'rev', 'revenue'], 0)));
  dcRois = barrasDatacenter.map((item, i) => {
    const roi = primeiroValorObjeto(item, ['roi', 'ROI'], null);
    if (roi !== null) return Number(roi);
    return dcCosts[i] > 0 ? Number((((dcRevs[i] - dcCosts[i]) / dcCosts[i]) * 100).toFixed(1)) : 0;
  });

  document.getElementById('bar-sub').textContent = barView === 'custo'
    ? 'Custo mensal — soma = ' + formatarMoeda(dcCosts.reduce((soma, valor) => soma + valor, 0))
    : 'Receita sobre custo por DC (negativo = prejuízo)';
  buildBarChart();
}

function buildBarChart() {
  if (barChartInst) barChartInst.destroy();
  const isCusto = barView === 'custo';
  const data    = isCusto ? dcCosts.map(v => v) : dcRois;
  const colors  = isCusto
    ? dcCosts.map(() => '#66C0F4')
    : dcRois.map(r => r < 0 ? '#E05050' : r < 50 ? '#F5A623' : '#4CAF82');

  barChartInst = new Chart(document.getElementById('barChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: dcLabels,
      datasets: [{ label: isCusto ? 'Custo mensal' : 'ROI (%)', data, backgroundColor: colors, borderRadius: 5, borderSkipped: false }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => isCusto
          ? `R$ ${c.raw.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
          : `ROI: ${c.raw > 0 ? '+' : ''}${c.raw}%`
        }}
      },
      scales: {
        y: { ticks: { callback: v => isCusto ? (v >= 1000 ? (v/1000)+'k' : v) : v + '%', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false }, ticks: { font: { size: 11 } } }
      }
    }
  });
}


// ══════════════════════════════════════════════
// Tabela (Servidores / Zonas)
   
let servidoresRows = [
  { name:'DC02-CACHE-3', dc:'DC02-RJ', zona:'Zona Beta',    cost:17200,  energy:5400,  st:'critico', stl:'Custo Ocioso' },
  { name:'FK02-GH-02',   dc:'DC01-SP', zona:'Zona Alpha',   cost:28400,  energy:9200,  st:'ativo',   stl:'Ativo' },
  { name:'DC01-WEB-05',  dc:'DC01-SP', zona:'Zona Alpha',   cost:24100,  energy:7800,  st:'alerta',  stl:'Alerta' },
  { name:'DC01-DB-12',   dc:'DC02-RJ', zona:'Zona Beta',    cost:22650,  energy:8400,  st:'ativo',   stl:'Ativo' },
  { name:'DC03-APP-08',  dc:'DC03-MG', zona:'Zona Gama',    cost:19800,  energy:6100,  st:'ativo',   stl:'Ativo' },
  { name:'DC04-AUTH-1',  dc:'DC04-RS', zona:'Zona Delta',   cost:15600,  energy:4800,  st:'ativo',   stl:'Ativo' },
  { name:'DC05-EDGE-2',  dc:'DC05-PE', zona:'Zona Épsilon', cost:12900,  energy:3900,  st:'alerta',  stl:'Alerta' },
];
let zonasRows = [
  { zona:'Zona Alpha',   dc:'DC01-SP', serv:2, cost:52500, energy:17000, st:'alerta',  stl:'Alerta' },
  { zona:'Zona Beta',    dc:'DC02-RJ', serv:2, cost:39850, energy:13800, st:'critico', stl:'Ofensor' },
  { zona:'Zona Gama',    dc:'DC03-MG', serv:1, cost:19800, energy:6100,  st:'ativo',   stl:'Ativo' },
  { zona:'Zona Delta',   dc:'DC04-RS', serv:1, cost:15600, energy:4800,  st:'ativo',   stl:'Ativo' },
  { zona:'Zona Épsilon', dc:'DC05-PE', serv:1, cost:12900, energy:3900,  st:'alerta',  stl:'Alerta' },
];

function badge(s, l) { return `<span class="badge-status ${s}"><span class="ponto-status"></span>${l}</span>`; }

function renderServ() {
  return `<table class="tabela-dados"><thead><tr><th>Servidor</th><th>Datacenter</th><th>Zona</th><th>Custo/Mês</th><th>Energia</th><th>Status</th></tr></thead><tbody>
  ${servidoresRows.map(r => `<tr>
    <td><span class="link-servidor">${r.name}</span></td>
    <td>${r.dc}</td><td>${r.zona}</td>
    <td><span class="valor-custo">${r.cost}</span></td>
    <td>${r.energy}</td>
    <td>${badge(r.st, r.stl)}</td>
  </tr>`).join('')}
  </tbody></table>`;
}

function renderZonas() {
  return `<table class="tabela-dados"><thead><tr><th>Zona</th><th>Datacenter</th><th>Servidores</th><th>Custo Total</th><th>Energia</th><th>Status</th></tr></thead><tbody>
  ${zonasRows.map(r => `<tr>
    <td><span class="link-servidor">${r.zona}</span></td>
    <td>${r.dc}</td>
    <td style="font-weight:600;">${r.serv} servidor${r.serv > 1 ? 'es' : ''}</td>
    <td><span class="valor-custo">${r.cost}</span></td>
    <td>${r.energy}</td>
    <td>${badge(r.st, r.stl)}</td>
  </tr>`).join('')}
  </tbody></table>`;
}

function aplicarTopServidores(topServidores) {
  if (!topServidores.length) return;

  servidoresRows = topServidores.map(item => ({
    name: primeiroValorObjeto(item, ['servidor', 'SERVIDOR', 'nomeServidor', 'name', 'nome', 'NOME', 'host'], '-'),
    dc: primeiroValorObjeto(item, ['datacenter', 'DATACENTER', 'dc', 'DC'], '-'),
    zona: primeiroValorObjeto(item, ['zona', 'ZONA', 'zone'], '-'),
    cost: Number(primeiroValorObjeto(item, ['custo', 'CUSTO', 'custo_total', 'CUSTO_TOTAL', 'cost', 'valor', 'VALOR'], 0)),
    energy: Number(primeiroValorObjeto(item, ['energia', 'ENERGIA', 'energy', 'custo_energia'], 0)),
    st: primeiroValorObjeto(item, ['statusClasse', 'status_classe', 'st', 'status', 'STATUS'], 'ativo'),
    stl: primeiroValorObjeto(item, ['statusLabel', 'status_label', 'stl', 'status', 'STATUS'], 'Ativo')
  }));

  if (curView === 'servidores') {
    document.getElementById('table-wrap').innerHTML = renderServ();
  }
}

let curView = 'servidores';

function setTableView(view, btn) {
  if (view === curView && btn) return;
  curView = view;
  document.querySelectorAll('.btn-alternador').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('table-title').textContent = view === 'servidores' ? 'Top servidores por custo' : 'Top zonas por custo';
  document.getElementById('table-sub').textContent   = view === 'servidores' ? 'Maiores consumidores do orçamento mensal' : 'Custo consolidado por zona de disponibilidade';
  const w = document.getElementById('table-wrap');
  w.classList.add('fading');
  setTimeout(() => { w.innerHTML = view === 'servidores' ? renderServ() : renderZonas(); w.classList.remove('fading'); }, 200);
}



// ══════════════════════════════════════════════
// RELATÓRIOS
  
const reportsData = [
  { month:'Novembro 2025',  gen:'02/12/2025', cost:540000, rev:825000, roi:52.8 },
  { month:'Outubro 2025',   gen:'02/11/2025', cost:528000, rev:802000, roi:51.9 },
  { month:'Setembro 2025',  gen:'02/10/2025', cost:519000, rev:780000, roi:50.3 },
  { month:'Agosto 2025',    gen:'02/09/2025', cost:503000, rev:758000, roi:50.7 },
  { month:'Julho 2025',     gen:'02/08/2025', cost:491000, rev:742000, roi:51.1 },
  { month:'Junho 2025',     gen:'02/07/2025', cost:478000, rev:720000, roi:50.6 },
  { month:'Maio 2025',      gen:'02/06/2025', cost:452000, rev:695000, roi:53.8 },
  { month:'Abril 2025',     gen:'02/05/2025', cost:461000, rev:671000, roi:45.6 },
  { month:'Março 2025',     gen:'02/04/2025', cost:445000, rev:640000, roi:43.8 },
  { month:'Fevereiro 2025', gen:'02/03/2025', cost:428000, rev:612000, roi:43.0 },
  { month:'Janeiro 2025',   gen:'02/02/2025', cost:412000, rev:580000, roi:40.8 },
];

function renderReportsList() {
  const list = document.getElementById('reports-list');
  list.innerHTML = '';
  reportsData.forEach(r => {
    const margin = r.rev - r.cost;
    list.innerHTML += `
      <div class="item-relatorio">
        <div class="icone-doc-relatorio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <div>
          <div class="nome-relatorio">${r.month}</div>
          <div class="data-relatorio">Gerado em ${r.gen}</div>
        </div>
        <div class="meta-relatorio">
          <div class="item-meta-relatorio"><div class="rotulo-meta-relatorio">Custo</div><div class="valor-meta-relatorio">${r.cost}</div></div>
          <div class="item-meta-relatorio"><div class="rotulo-meta-relatorio">Receita</div><div class="valor-meta-relatorio">${r.rev}</div></div>
          <div class="item-meta-relatorio"><div class="rotulo-meta-relatorio">Margem</div><div class="valor-meta-relatorio" style="color:#2e7d5a;"> R$ ${(margin/1000).toFixed(0)}k</div></div>
          <div class="item-meta-relatorio"><div class="rotulo-meta-relatorio">ROI</div><div class="roi-relatorio pos">+${r.roi}%</div></div>
        </div>
        <button class="btn-baixar" onclick='openReportModal(${JSON.stringify(r)})'>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Visualizar
        </button>
      </div>`;
  });
}



document.getElementById('report-full-modal').addEventListener('click', function (e) {
  if (e.target === this) closeReportModal();
});

document.getElementById('roi-modal').addEventListener('click', function (e) {
  if (e.target === this) closeRoiModal();
});

document.getElementById('modal-preditivo').addEventListener('click', function (e) {
  if (e.target === this) fecharModalPreditivo();
});

// ══════════════════════════════════════════════
// INICIALIZAÇÃO
 
document.addEventListener('DOMContentLoaded', () => {


 
  // Gráfico de linha (período padrão: 12 meses)
  definirPeriodo(3, document.querySelector('.btn-periodo.active:not(.roi-period-btn)'));

  // Donut
  buildDonutChart();

  // Bar
  buildBarChart();

  // Tabela
  setTableView('servidores', null);

     // Relatórios
  renderReportsList();
});
