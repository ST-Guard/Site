
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
}


/* ══════════════════════════════════════════════  */
//    MOEDA (BRL vs USD)

let isUSD = false;
const exRate = 5.0;

function getCurr() { return isUSD ? 'US$' : 'R$'; }
function cvt(val)  { return isUSD ? (val / exRate) : val; }

function fmtFull(val) {
  return getCurr() + ' ' + Math.round(cvt(val)).toLocaleString('pt-BR');
}
function fmtK(valInK) {
  return getCurr() + ' ' + cvt(valInK).toLocaleString('pt-BR', {
    minimumFractionDigits: isUSD ? 1 : 0,
    maximumFractionDigits: 1
  }) + 'k';
}

function toggleCurrency() {
  isUSD = !isUSD;
  const btn = document.getElementById('currency-btn');
  const svgDolar = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`;
  btn.innerHTML = isUSD
    ? `${svgDolar} Mudar para BRL`
    : `${svgDolar} Mudar para USD`;
  updateAllValues();
}


/* ══════════════════════════════════════════════  */
//    DADOS HISTÓRICOS

const MONTHS_HIST    = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const historicalCost = [412,428,445,461,452,478,491,503,519,528,540,562];
const historicalRev  = [580,612,640,671,695,720,742,758,780,802,825,860];


/* ══════════════════════════════════════════════  */
//    REGRESSÃO LINEAR

function linReg(y) {
  const n = y.length, meanX = (n + 1) / 2;
  const meanY = y.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (i + 1 - meanX) * (y[i] - meanY); den += (i + 1 - meanX) ** 2; }
  const slope = num / den, intercept = meanY - slope * meanX;
  let sse = 0;
  for (let i = 0; i < n; i++) sse += (y[i] - (slope * (i + 1) + intercept)) ** 2;
  return { slope, intercept, se: Math.sqrt(sse / (n - 2)) };
}

const cM = linReg(historicalCost);
const rM = linReg(historicalRev);

function forecast(model, x) { return Math.round(model.slope * x + model.intercept); }

function calcR2(y, model) {
  const meanY = y.reduce((a, b) => a + b, 0) / y.length;
  let ssTot = 0, ssRes = 0;
  y.forEach((yi, i) => { ssTot += (yi - meanY) ** 2; ssRes += (yi - forecast(model, i + 1)) ** 2; });
  return 1 - ssRes / ssTot;
}
function calcMAE(y, model) {
  const errs = y.map((yi, i) => Math.abs(yi - forecast(model, i + 1)));
  return Math.round(errs.reduce((a, b) => a + b, 0) / errs.length);
}

const modelR2  = calcR2(historicalCost, cM);
const modelMAE = calcMAE(historicalCost, cM);

function modelConf(stepsAhead) {
  return Math.max(50, Math.round(modelR2 * 100 * (1 - stepsAhead * 0.03)));
}


// ══════════════════════════════════════════════
//    ORÇAMENTO DINÂMICO
 
let budgetMarginPct = 5;

function calcBudget(targetX) {
  return Math.round(forecast(cM, targetX) * (1 + budgetMarginPct / 100));
}
function getCurrentBudgetK()    { return calcBudget(historicalCost.length); }
function getCurrentBudgetFull() { return getCurrentBudgetK() * 1000; }


// ══════════════════════════════════════════════
//    PREVISÕES

function generateForecasts(n) {
  return Array.from({ length: n }, (_, i) => {
    const x = historicalCost.length + i + 1;
    const cost = forecast(cM, x), revenue = forecast(rM, x);
    return { x, cost, revenue, roi: (((revenue - cost) / cost) * 100).toFixed(1),
             ci: Math.round(1.96 * cM.se), conf: modelConf(i + 1) };
  });
}

function monthLabel(i) {
  const d = new Date(2026, i);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    .replace('. ', '/').replace('.', '').replace(/^\w/, c => c.toUpperCase());
}

function fecharModalPreditivo() {
  document.getElementById('modal-preditivo').style.display = 'none';
}

function abrirModalPreditivo() {
  document.getElementById('modal-preditivo').style.display = 'flex';
}

// ══════════════════════════════════════════════
//    DADOS PARA OS GRÁFICOS

const foreL3   = generateForecasts(3);
const allLbls  = [...MONTHS_HIST, ...foreL3.map((_, i) => monthLabel(i))];
const allCost  = [...historicalCost, ...Array(3).fill(null)];
const allRev   = [...historicalRev, ...Array(3).fill(null)];
const fCostLn  = [...historicalCost.map(() => null), historicalCost[11], ...foreL3.map(f => f.cost)];
const fRevLn   = [...historicalRev.map(() => null),  historicalRev[11],  ...foreL3.map(f => f.revenue)];
const histRoi  = historicalCost.map((c, i) => parseFloat((((historicalRev[i] - c) / c) * 100).toFixed(1)));
const foreRoi  = foreL3.map(f => parseFloat(f.roi));
const allHistRoi = [...histRoi, ...Array(3).fill(null)];
const allForeRoi = [...Array(11).fill(null), histRoi[11], ...foreRoi];
   
Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";
Chart.defaults.color = '#6B7E91';


// ══════════════════════════════════════════════
//  POPUP DO ORÇAMENTO
  
function toggleBudgetPopover(e) {
  e.stopPropagation();
  const pop = document.getElementById('budget-popover');
  pop.classList.toggle('open');
  if (pop.classList.contains('open')) updateBudgetPanel();
}

function closeBudgetPopover(e) {
  e.stopPropagation();
  document.getElementById('budget-popover').classList.remove('open');
}

document.addEventListener('click', function (e) {
  const wrap = document.querySelector('.envoltorio-popover-orcamento');
  if (wrap && !wrap.contains(e.target)) {
    document.getElementById('budget-popover').classList.remove('open');
  }
});

function onBudgetMarginChange(val) {
  budgetMarginPct = parseFloat(val);
  document.getElementById('budget-margin-display').textContent = val;
  const lbl = document.getElementById('forecast-margin-label');
  if (lbl) lbl.textContent = val;
  updateAllValues();
}

function updateBudgetPanel() {
  const nextX        = historicalCost.length + 1;
  const regressionK  = forecast(cM, nextX);
  const budgetK      = calcBudget(nextX);
  const actualK      = historicalCost[historicalCost.length - 1];
  document.getElementById('budget-regression-val').innerText = fmtK(regressionK);
  document.getElementById('budget-approved-val').innerText   = fmtK(budgetK);
  document.getElementById('budget-actual-val').innerText     = fmtK(actualK);
}


// ══════════════════════════════════════════════
// ATUALIZAR OS VALORES (moeda / margem)
   
function updateAllValues() {
  document.getElementById('kpi-rev-val').innerText  = fmtFull(860000);
  document.getElementById('kpi-cost-val').innerText = fmtFull(562000);

  const prevCost = 540000, prevRev = 825000;
  const deltaCost = 562000 - prevCost;
  const deltaRev  = 860000 - prevRev;

  const costDeltaEl = document.getElementById('kpi-cost-delta');
  costDeltaEl.style.background = deltaCost > 0 ? 'rgba(224,80,80,0.10)' : 'rgba(76,175,130,0.12)';
  costDeltaEl.style.color      = deltaCost > 0 ? '#E05050' : '#4CAF82';
  costDeltaEl.innerText = `${deltaCost > 0 ? '▲' : '▼'} ${deltaCost > 0 ? '+' : ''}${getCurr()} ${Math.abs(Math.round(cvt(deltaCost))).toLocaleString('pt-BR')} vs Nov/25`;

  const revDeltaEl = document.getElementById('kpi-rev-delta');
  revDeltaEl.style.background = deltaRev > 0 ? 'rgba(76,175,130,0.12)' : 'rgba(224,80,80,0.10)';
  revDeltaEl.style.color      = deltaRev > 0 ? '#4CAF82' : '#E05050';
  revDeltaEl.innerText = `${deltaRev > 0 ? '▲' : '▼'} ${deltaRev > 0 ? '+' : ''}${getCurr()} ${Math.abs(Math.round(cvt(deltaRev))).toLocaleString('pt-BR')} vs Nov/25`;

  // Orçamento Jan/26
  const nextX       = historicalCost.length + 1;
  const budgetK     = calcBudget(nextX);
  const regressionK = forecast(cM, nextX);
  document.getElementById('kpi-budget-val').innerText  = fmtFull(budgetK * 1000);
  document.getElementById('kpi-budget-ref').innerText  = fmtFull(regressionK * 1000);
  const marginLbl = document.getElementById('kpi-budget-margin-label');
  if (marginLbl) marginLbl.textContent = budgetMarginPct;

  // Orçamento Dez/25 na KPI de custo
  const currBudgetFull = calcBudget(historicalCost.length) * 1000;
  const isOverCurr     = 562000 > currBudgetFull;
  const currStatusEl   = document.getElementById('kpi-cost-budget-status');
  const currRefEl      = document.getElementById('kpi-cost-budget-ref');
  if (currRefEl) currRefEl.innerText = fmtFull(currBudgetFull);
  if (currStatusEl) {
    currStatusEl.style.background = isOverCurr ? 'rgba(224,80,80,0.10)' : 'rgba(76,175,130,0.12)';
    currStatusEl.style.color      = isOverCurr ? '#E05050' : '#4CAF82';
  }

  updateBudgetPanel();

  // Donut valores absolutos
  const dVals = [38,28,16,12,6];
  dVals.forEach((v, i) => {
    const el = document.getElementById(`donut-abs-${i}`);
    if (el) el.innerText = fmtFull(Math.round(562000 * v / 100));
  });

  // KPI previsto
  const f0 = generateForecasts(1)[0];
  document.getElementById('kpi-predicted').innerText = fmtK(f0.cost);

  // Gráfico de linha (período ativo)
  const periodBtn = document.querySelector('.btn-periodo.active:not(.roi-period-btn)');
  if (periodBtn) {
    const pIndex = Array.from(document.querySelectorAll('.btn-periodo:not(.roi-period-btn)')).indexOf(periodBtn) + 1;
    setPeriod(pIndex, periodBtn);
  }

  buildBarChart();

  const nMonths = parseInt(document.getElementById('month-slider').value);
  buildPredictGrid(nMonths);
  buildForecastChart(nMonths);

  document.getElementById('table-wrap').innerHTML = curView === 'servidores' ? renderServ() : renderZonas();
  renderReportsList();
}


// ══════════════════════════════════════════════
// MODAL DA KPIA ROI (GRAFICO DE LINHA)
   
let roiChartInst;

function buildRoiChart(labels, hist) {
  if (roiChartInst) roiChartInst.destroy();
  roiChartInst = new Chart(document.getElementById('roiChart').getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'ROI',
        data: hist,
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

function setRoiPeriod(p, btn) {
  document.querySelectorAll('.roi-period-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  let s = 0;
  if (p === 1) s = 11;
  else if (p === 2) s = 6;
  buildRoiChart(MONTHS_HIST.slice(s), histRoi.slice(s));
}

function openRoiModal() {
  document.getElementById('roi-modal').classList.add('active');
  const activeBtn = document.querySelector('.roi-period-btn.active') || document.querySelectorAll('.roi-period-btn')[2];
  const pIndex = Array.from(document.querySelectorAll('.roi-period-btn')).indexOf(activeBtn) + 1;
  setRoiPeriod(pIndex, activeBtn);
}

function closeRoiModal() {
  document.getElementById('roi-modal').classList.remove('active');
}


// ══════════════════════════════════════════════
// GRAFICO DE LINHAS (Custo x Receita)


let lineChart;
let chartFilterState = 'all';

function buildLineChart(labels, cost, rev, fc, fr) {
  const budgetLine = labels.map((_, i) => cvt(Math.round(forecast(cM, i + 1) * (1 + budgetMarginPct / 100))));

  if (lineChart) lineChart.destroy();
  lineChart = new Chart(document.getElementById('lineChart').getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Custo',            data: cost.map(v => cvt(v)),       borderColor: '#2C5D86', backgroundColor: 'rgba(44,93,134,0.07)', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#2C5D86', tension: 0.35, fill: true, spanGaps: false },
        { label: 'Receita',          data: rev.map(v => cvt(v)),        borderColor: '#F5CC4D', backgroundColor: 'rgba(245,204,77,0.06)', borderWidth: 2.5, pointRadius: 4, pointBackgroundColor: '#F5CC4D', tension: 0.35, fill: true, spanGaps: false },
        { label: 'Previsão Custo',   data: fc.map(v => cvt(v)),        borderColor: '#66C0F4', borderWidth: 2, borderDash: [6,4], pointRadius: 5, pointStyle: 'rectRot', pointBackgroundColor: '#66C0F4', tension: 0.35, fill: false, spanGaps: false },
        { label: 'Previsão Receita', data: fr.map(v => cvt(v)),        borderColor: '#FFF47C', borderWidth: 2, borderDash: [6,4], pointRadius: 5, pointStyle: 'rectRot', pointBackgroundColor: '#FFF47C', tension: 0.35, fill: false, spanGaps: false },
        { label: 'Orçamento',        data: budgetLine,                  borderColor: '#F5CC4D', borderWidth: 1.5, borderDash: [3,3], pointRadius: 0, tension: 0.35, fill: false, spanGaps: true, backgroundColor: 'transparent' },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${getCurr()} ${c.raw ? c.raw.toLocaleString('pt-BR', { minimumFractionDigits: isUSD ? 1 : 0, maximumFractionDigits: 1 }) : '--'}k` } }
      },
      scales: {
        y: { ticks: { callback: v => v + 'k', font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

function setPeriod(p, btn) {
  document.querySelectorAll('.btn-periodo:not(.roi-period-btn)').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  let s = 0;
  if (p === 1) s = 11;
  else if (p === 2) s = 6;
  buildLineChart(allLbls.slice(s), allCost.slice(s), allRev.slice(s), fCostLn.slice(s), fRevLn.slice(s));
  if (chartFilterState !== 'all') toggleLineChart(chartFilterState, true);
}

function scrollToPredict() {
  const section = document.querySelector('.secao-preditiva');
  section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  section.style.transition = 'box-shadow 0.3s ease';
  section.style.boxShadow  = '0 0 0 6px rgba(102,192,244,0.4)';
  setTimeout(() => section.style.boxShadow = 'none', 1500);
}

function toggleLineChart(type, bypassScroll = false) {
  if (!bypassScroll) {
    document.getElementById('charts-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
    const chartCard = document.getElementById('line-chart-card');
    chartCard.classList.remove('pulso-destaque');
    void chartCard.offsetWidth;
    chartCard.classList.add('pulso-destaque');
    setTimeout(() => chartCard.classList.remove('pulso-destaque'), 1500);
  }
  if (chartFilterState === type && !bypassScroll) {
    chartFilterState = 'all';
    lineChart.data.datasets.forEach(ds => ds.hidden = false);
  } else {
    chartFilterState = type;
    lineChart.data.datasets.forEach((ds, i) => {
      if (type === 'custo')   ds.hidden = (i === 1 || i === 3);
      else if (type === 'receita') ds.hidden = (i === 0 || i === 2);
    });
  }
  lineChart.update();
}

function toggleDataset(index) {
  const meta = lineChart.getDatasetMeta(index);
  meta.hidden = meta.hidden === null ? !lineChart.data.datasets[index].hidden : null;
  lineChart.update();
}


// ══════════════════════════════════════════════
// GRAFICO DE DONUTS
   

const dColors = ['#66C0F4','#0F1C2E','#F5CC4D','#F5A623','#E05050'];
const dLabels = ['Energia','Hardware','Licenças','Manutenção','Rede'];
const dValues = [38,28,16,12,6];

function buildDonutChart() {
  new Chart(document.getElementById('donutChart').getContext('2d'), {
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
  dLabels.forEach((l, i) => {
    const absVal = Math.round(562000 * dValues[i] / 100);
    dl.innerHTML += `<div class="item-legenda-donut">
      <div class="esq-legenda-donut">
        <div class="ponto-donut" style="background:${dColors[i]}"></div>
        <span style="color:var(--text-muted);font-size:12px;">${l}</span>
      </div>
      <div style="text-align:right;">
        <span class="pct-donut">${dValues[i]}%</span>
        <div id="donut-abs-${i}" style="font-size:10px;color:var(--text-muted);margin-top:1px;">${fmtFull(absVal)}</div>
      </div>
    </div>`;
  });
}


// ══════════════════════════════════════════════
// GRAFICO DE BARRA (custo / ROI por datacenter)
   
const dcLabels = ['DC01-SP','DC02-RJ','DC03-MG','DC04-RS','DC05-PE'];
const dcCosts  = [180000, 138000, 102000, 80000, 62000];
const dcRevs   = [302000, 223000, 172000, 115000, 48000];
const dcRois   = dcCosts.map((c, i) => parseFloat((((dcRevs[i] - c) / c) * 100).toFixed(1)));

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
    ? 'Custo mensal — soma = ' + fmtFull(562000)
    : 'Receita sobre custo por DC (negativo = prejuízo)';
  buildBarChart();
}

function buildBarChart() {
  if (barChartInst) barChartInst.destroy();
  const isCusto = barView === 'custo';
  const data    = isCusto ? dcCosts.map(v => cvt(v)) : dcRois;
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
          ? `${getCurr()} ${c.raw.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
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
   
const servidoresRows = [
  { name:'DC02-CACHE-3', dc:'DC02-RJ', zona:'Zona Beta',    cost:17200,  energy:5400,  st:'critico', stl:'Custo Ocioso' },
  { name:'FK02-GH-02',   dc:'DC01-SP', zona:'Zona Alpha',   cost:28400,  energy:9200,  st:'ativo',   stl:'Ativo' },
  { name:'DC01-WEB-05',  dc:'DC01-SP', zona:'Zona Alpha',   cost:24100,  energy:7800,  st:'alerta',  stl:'Alerta' },
  { name:'DC01-DB-12',   dc:'DC02-RJ', zona:'Zona Beta',    cost:22650,  energy:8400,  st:'ativo',   stl:'Ativo' },
  { name:'DC03-APP-08',  dc:'DC03-MG', zona:'Zona Gama',    cost:19800,  energy:6100,  st:'ativo',   stl:'Ativo' },
  { name:'DC04-AUTH-1',  dc:'DC04-RS', zona:'Zona Delta',   cost:15600,  energy:4800,  st:'ativo',   stl:'Ativo' },
  { name:'DC05-EDGE-2',  dc:'DC05-PE', zona:'Zona Épsilon', cost:12900,  energy:3900,  st:'alerta',  stl:'Alerta' },
];
const zonasRows = [
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
    <td><span class="valor-custo">${fmtFull(r.cost)}</span></td>
    <td>${fmtFull(r.energy)}</td>
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
    <td><span class="valor-custo">${fmtFull(r.cost)}</span></td>
    <td>${fmtFull(r.energy)}</td>
    <td>${badge(r.st, r.stl)}</td>
  </tr>`).join('')}
  </tbody></table>`;
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
// GRAFICO DE LINHAS PREDITVAS
   
let forecastChart;
function buildForecastChart(nM) {
  const fcs = generateForecasts(nM);
  const labels   = [...MONTHS_HIST, ...fcs.map((_, i) => monthLabel(i))];
  const costFull = [...historicalCost, ...fcs.map(f => f.cost)];
  const ciUp     = [...historicalCost.map(() => null), ...fcs.map(f => f.cost + f.ci)];
  const ciDn     = [...historicalCost.map(() => null), ...fcs.map(f => f.cost - f.ci)];
  const budgetLine = labels.map((_, i) => cvt(Math.round(forecast(cM, i + 1) * (1 + budgetMarginPct / 100))));
  const hl = historicalCost.length;

  if (forecastChart) forecastChart.destroy();
  forecastChart = new Chart(document.getElementById('forecastChart').getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Custo', data: costFull.map(v => cvt(v)),
          segment: { borderColor: c => c.p1DataIndex >= hl ? '#66C0F4' : '#2C5D86', borderDash: c => c.p1DataIndex >= hl ? [5,4] : [] },
          borderWidth: 2, backgroundColor: 'rgba(44,93,134,0.06)',
          pointRadius: c => c.dataIndex >= hl ? 5 : 3,
          pointStyle: c => c.dataIndex >= hl ? 'rectRot' : 'circle',
          pointBackgroundColor: c => c.dataIndex >= hl ? '#66C0F4' : '#2C5D86',
          tension: 0.35, fill: true },
        { label: 'IC+', data: ciUp.map(v => v ? cvt(v) : null), borderColor: 'rgba(102,192,244,0.35)', borderWidth: 1, borderDash: [3,3], pointRadius: 0, fill: false, tension: 0.35 },
        { label: 'IC-', data: ciDn.map(v => v ? cvt(v) : null), borderColor: 'rgba(102,192,244,0.35)', borderWidth: 1, borderDash: [3,3], pointRadius: 0, fill: '-1', backgroundColor: 'rgba(102,192,244,0.08)', tension: 0.35 },
        { label: 'Orçamento', data: budgetLine, borderColor: '#F5CC4D', borderWidth: 1.5, borderDash: [4,3], pointRadius: 0, fill: false, tension: 0.35, spanGaps: true },
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: c => c.dataset.label.startsWith('IC') ? null : `${getCurr()} ${c.raw ? c.raw.toLocaleString('pt-BR', { minimumFractionDigits: isUSD ? 1 : 0, maximumFractionDigits: 1 }) : '--'}k` },
          filter: i => !i.dataset.label.startsWith('IC')
        }
      },
      scales: {
        y: { ticks: { callback: v => v + 'k', color: 'rgba(255,255,255,0.35)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { ticks: { color: 'rgba(255,255,255,0.35)', font: { size: 10 }, maxTicksLimit: 10 }, grid: { display: false } }
      }
    }
  });
}


// ══════════════════════════════════════════════
// GRADE PREDIDITIVA
   
function buildPredictGrid(nM) {
  const fcs  = generateForecasts(nM);
  const grid = document.getElementById('predict-grid');
  grid.innerHTML = '';
  fcs.forEach((f, i) => {
    const budgetK    = calcBudget(f.x);
    const isOver     = (f.cost * 1000) > (budgetK * 1000);
    const diffK      = Math.abs(f.cost - budgetK);
    const diffColor  = isOver ? '#E05050' : '#4CAF82';
    const diffLabel  = isOver ? `${fmtK(diffK)} acima` : `${fmtK(diffK)} abaixo`;

    const el = document.createElement('div');
    el.className = 'cartao-mes-preditivo';
    el.style.animationDelay = (i * 25) + 'ms';
    el.innerHTML = `
      <div class="rotulo-mes-preditivo"><span class="num-mes">${i+1}</span>${monthLabel(i)}</div>
      <div class="linha-preditiva"><span class="rotulo-linha-preditiva">Custo prev.</span><span class="valor-linha-preditiva custo">${fmtK(f.cost)}</span></div>
      <div class="linha-preditiva"><span class="rotulo-linha-preditiva">Orçamento</span><span class="valor-linha-preditiva" style="color:var(--gold);">${fmtK(budgetK)}</span></div>
      <div class="linha-preditiva"><span class="rotulo-linha-preditiva">Receita</span><span class="valor-linha-preditiva receita">${fmtK(f.revenue)}</span></div>
      <div class="linha-preditiva"><span class="rotulo-linha-preditiva">ROI</span><span class="valor-linha-preditiva roi">+${f.roi}%</span></div>
      <div class="linha-preditiva" style="border-top:1px solid rgba(255,255,255,0.07);padding-top:6px;margin-top:2px;">
        <span class="rotulo-linha-preditiva" style="font-size:9.5px;">vs Orçamento</span>
        <span style="font-size:10.5px;font-weight:700;color:${diffColor};">${diffLabel}</span>
      </div>
      <div class="confianca-preditiva">Confiança do modelo: ${f.conf}%
        <div class="barra-confianca"><div class="preenchimento-confianca" style="width:${f.conf}%"></div></div>
      </div>`;
    grid.appendChild(el);
  });
}

   
function applyN(n) {
  document.getElementById('month-slider').value = n;
  document.getElementById('slider-display').textContent = n;
  buildPredictGrid(n);
  buildForecastChart(n);
}

function setForecastMonths(n, btn) {
  document.querySelectorAll('.btn-mr').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyN(n);
}

function onSliderInput(val) {
  const n = parseInt(val);
  document.querySelectorAll('.btn-mr').forEach((b, i) => {
    b.classList.toggle('active', [1,3,6,12][i] === n);
  });
  applyN(n);
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
          <div class="item-meta-relatorio"><div class="rotulo-meta-relatorio">Custo</div><div class="valor-meta-relatorio">${fmtFull(r.cost)}</div></div>
          <div class="item-meta-relatorio"><div class="rotulo-meta-relatorio">Receita</div><div class="valor-meta-relatorio">${fmtFull(r.rev)}</div></div>
          <div class="item-meta-relatorio"><div class="rotulo-meta-relatorio">Margem</div><div class="valor-meta-relatorio" style="color:#2e7d5a;">${getCurr()} ${(cvt(margin)/1000).toFixed(0)}k</div></div>
          <div class="item-meta-relatorio"><div class="rotulo-meta-relatorio">ROI</div><div class="roi-relatorio pos">+${r.roi}%</div></div>
        </div>
        <button class="btn-baixar" onclick='openReportModal(${JSON.stringify(r)})'>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Visualizar
        </button>
      </div>`;
  });
}

function openReportModal(r) {
  const idx   = reportsData.findIndex(x => x.month === r.month);
  const prev  = idx < reportsData.length - 1 ? reportsData[idx + 1] : null;
  const deltaCost = prev ? r.cost - prev.cost : 0;
  const deltaRev  = prev ? r.rev  - prev.rev  : 0;
  const deltaRoi  = prev ? (r.roi - prev.roi).toFixed(1) : 0;
  const margin    = r.rev - r.cost;
  const marginPct = ((margin / r.cost) * 100).toFixed(1);
  const budgetForMonth = Math.round(r.cost * 1.05);
  const withinBudget   = r.cost <= budgetForMonth;

  const cats = [
    { name: 'Energia elétrica',      pct: 0.38 },
    { name: 'Hardware e manutenção', pct: 0.28 },
    { name: 'Licenças de software',  pct: 0.20 },
    { name: 'Operação e pessoal',    pct: 0.14 },
  ];

  document.getElementById('report-modal-title').innerText = `Relatório Mensal — ${r.month}`;
  document.getElementById('report-modal-sub').innerText   = `Gerado em ${r.gen} · Infraestrutura STEAM`;

  document.getElementById('report-doc-body').innerHTML = `
    <div class="capa-relatorio">
      <div class="cabecalho-capa-relatorio">
        <div class="logo-capa-relatorio">
          <div class="icone-logo-capa-relatorio">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div>
            <div class="texto-logo-capa-relatorio">STEAM Infrastructure</div>
            <div class="sub-logo-capa-relatorio">Financial Monitoring Dashboard</div>
          </div>
        </div>
        <div class="badge-capa-relatorio">
          <div class="rotulo-badge-capa-relatorio">Período</div>
          <div class="val-badge-capa-relatorio">${r.month}</div>
        </div>
      </div>
      <div class="titulo-capa-relatorio">
        <h1>Relatório Financeiro Mensal</h1>
        <p>Monitoramento de infraestrutura de servidores — Análise de custos, receita e performance financeira.</p>
      </div>
      <div class="tags-capa-relatorio">
        <span class="tag-relatorio blue">Infraestrutura STEAM</span>
        <span class="tag-relatorio ${withinBudget ? 'green' : 'gold'}">${withinBudget ? 'Dentro do orçamento' : 'Atenção ao orçamento'}</span>
        <span class="tag-relatorio blue">Gerado em ${r.gen}</span>
      </div>
    </div>

    <div class="secao-relatorio">
      <div class="titulo-secao-relatorio">Sumário Executivo</div>
      <div class="grade-kpi-relatorio">
        <div class="kpi-relatorio">
          <div class="rotulo-kpi-relatorio">Custo Total</div>
          <div class="val-kpi-relatorio">${fmtFull(r.cost)}</div>
          <div class="delta-kpi-relatorio ${deltaCost > 0 ? 'up-bad' : 'down-good'}">${deltaCost > 0 ? '▲' : '▼'} R$ ${Math.abs(deltaCost/1000).toFixed(0)}k vs mês anterior</div>
        </div>
        <div class="kpi-relatorio">
          <div class="rotulo-kpi-relatorio">Receita Gerada</div>
          <div class="val-kpi-relatorio">${fmtFull(r.rev)}</div>
          <div class="delta-kpi-relatorio ${deltaRev > 0 ? 'up-good' : 'up-bad'}">${deltaRev > 0 ? '▲' : '▼'} R$ ${Math.abs(deltaRev/1000).toFixed(0)}k vs mês anterior</div>
        </div>
        <div class="kpi-relatorio">
          <div class="rotulo-kpi-relatorio">Margem Líquida</div>
          <div class="val-kpi-relatorio" style="color:#2e7d5a;">${fmtFull(margin)}</div>
          <div class="delta-kpi-relatorio up-good">${marginPct}% sobre o custo</div>
        </div>
        <div class="kpi-relatorio">
          <div class="rotulo-kpi-relatorio">ROI</div>
          <div class="val-kpi-relatorio" style="color:#2e7d5a;">+${r.roi}%</div>
          <div class="delta-kpi-relatorio ${deltaRoi >= 0 ? 'up-good' : 'up-bad'}">${deltaRoi >= 0 ? '▲' : '▼'} ${Math.abs(deltaRoi)}pp vs mês anterior</div>
        </div>
      </div>
    </div>

    <div class="secao-relatorio">
      <div class="titulo-secao-relatorio">Aderência ao Orçamento</div>
      <div class="caixa-insight-relatorio ${withinBudget ? 'good' : 'warn'}">
        <div class="titulo-insight-relatorio">${withinBudget ? '✓ Orçamento respeitado' : '⚠ Orçamento extrapolado'}</div>
        <div class="texto-insight-relatorio">
          Orçamento aprovado para ${r.month}: <strong>${fmtFull(budgetForMonth)}</strong> (previsão de regressão + 5% de margem de segurança).<br>
          Custo realizado: <strong>${fmtFull(r.cost)}</strong> — 
          ${withinBudget
            ? `economia de <strong>R$ ${((budgetForMonth - r.cost)/1000).toFixed(0)}k</strong> em relação ao teto aprovado.`
            : `desvio de <strong>R$ ${((r.cost - budgetForMonth)/1000).toFixed(0)}k</strong> acima do teto aprovado.`}
        </div>
      </div>
    </div>

    <div class="secao-relatorio">
      <div class="titulo-secao-relatorio">Detalhamento de Custos por Categoria</div>
      <table class="tabela-relatorio">
        <thead><tr><th>Categoria</th><th>Custo (R$)</th><th>Participação</th><th>vs Mês Anterior</th></tr></thead>
        <tbody>
          ${cats.map(c => {
            const val = Math.round(r.cost * c.pct);
            const prevVal = prev ? Math.round(prev.cost * c.pct) : val;
            const diff = val - prevVal;
            return `<tr>
              <td>${c.name}</td>
              <td class="td-num">${fmtFull(val)}</td>
              <td class="td-num">${(c.pct*100).toFixed(0)}%</td>
              <td class="${diff > 0 ? 'td-neg' : 'td-pos'}">${diff > 0 ? '+' : ''}R$ ${(diff/1000).toFixed(1)}k</td>
            </tr>`;
          }).join('')}
          <tr style="font-weight:700;background:#f0f5fa;">
            <td><strong>Total</strong></td>
            <td class="td-num"><strong>${fmtFull(r.cost)}</strong></td>
            <td class="td-num"><strong>100%</strong></td>
            <td class="${deltaCost > 0 ? 'td-neg' : 'td-pos'}"><strong>${deltaCost > 0 ? '+' : ''}R$ ${(deltaCost/1000).toFixed(1)}k</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="secao-relatorio">
      <div class="titulo-secao-relatorio">Análise e Insights</div>
      <div class="caixa-insight-relatorio good">
        <div class="titulo-insight-relatorio">Tendência de receita positiva</div>
        <div class="texto-insight-relatorio">A receita de ${fmtFull(r.rev)} representa crescimento consistente. A margem líquida de ${marginPct}% está acima do benchmark histórico da operação.</div>
      </div>
      <div class="caixa-insight-relatorio">
        <div class="titulo-insight-relatorio">Energia elétrica — maior componente de custo</div>
        <div class="texto-insight-relatorio">Com ${(cats[0].pct*100).toFixed(0)}% do custo total (${fmtFull(Math.round(r.cost * cats[0].pct))}), o consumo energético dos servidores permanece o principal ofensor.</div>
      </div>
      <div class="caixa-insight-relatorio">
        <div class="titulo-insight-relatorio">Modelo preditivo — referência para próximo mês</div>
        <div class="texto-insight-relatorio">Com base na regressão linear aplicada ao histórico acumulado, o custo projetado para o próximo mês é de aproximadamente <strong>${fmtFull(Math.round(r.cost * 1.028))}</strong>, com margem de segurança de 5% definindo o teto orçamentário em <strong>${fmtFull(Math.round(r.cost * 1.028 * 1.05))}</strong>.</div>
      </div>
    </div>

    <div class="secao-relatorio">
      <div class="titulo-secao-relatorio">Histórico dos Últimos Meses</div>
      <table class="tabela-relatorio">
        <thead><tr><th>Mês</th><th>Custo</th><th>Receita</th><th>Margem</th><th>ROI</th></tr></thead>
        <tbody>
          ${reportsData.slice(0, 4).map(x => `<tr>
            <td>${x.month}</td>
            <td class="td-num">${fmtFull(x.cost)}</td>
            <td class="td-num">${fmtFull(x.rev)}</td>
            <td class="td-num td-pos">${fmtFull(x.rev - x.cost)}</td>
            <td class="td-num td-pos">+${x.roi}%</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="rodape-relatorio">
      <div class="esq-rodape-relatorio">STEAM Infrastructure Financial Dashboard<br>Dados simulados para fins acadêmicos. Gerado automaticamente pelo sistema de monitoramento.</div>
      <div class="dir-rodape-relatorio">Relatório ref. ${r.month}<br>Gerado em ${r.gen}</div>
    </div>
  `;

  document.getElementById('report-full-modal').classList.add('active');
  document.getElementById('report-modal-box').scrollTop = 0;
}

function closeReportModal() {
  document.getElementById('report-full-modal').classList.remove('active');
}

document.getElementById('report-full-modal').addEventListener('click', function (e) {
  if (e.target === this) closeReportModal();
});

document.getElementById('roi-modal').addEventListener('click', function (e) {
  if (e.target === this) closeRoiModal();
});


// ══════════════════════════════════════════════
// INICIALIZAÇÃO
 
document.addEventListener('DOMContentLoaded', () => {
  // KPI previsto inicial
  document.getElementById('kpi-predicted').innerText = fmtK(generateForecasts(1)[0].cost);

  // Atualiza todos os valores/KPIs
  updateAllValues();
  updateBudgetPanel();

  // Badge MAE
  document.getElementById('model-mae-badge').innerText = `MAE ±${fmtK(modelMAE)}`;

  // Gráfico de linha (período padrão: 12 meses)
  setPeriod(3, document.querySelector('.btn-periodo.active:not(.roi-period-btn)'));

  // Donut
  buildDonutChart();

  // Bar
  buildBarChart();

  // Tabela
  setTableView('servidores', null);

  // Predict (3 meses)
  applyN(3);

  // Relatórios
  renderReportsList();
});