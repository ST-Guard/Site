
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
//    DADOS HISTÓRICOS

const MONTHS_HIST    = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const historicalCost = [412,428,445,461,452,478,491,503,519,528,540,562];
const historicalRev  = [580,612,640,671,695,720,742,758,780,802,825,860];



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
  if (periodo === 1) inicio = 11;
  else if (periodo === 2) inicio = 6;
  
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

const HISTORICO_MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const custoHistorico = [12, 14, 13, 15, 14, 16, 15, 17, 18, 16, 19, 20]; 
const receitaHistorica = [25, 28, 26, 30, 29, 32, 34, 33, 36, 35, 38, 40]; 
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


const todosRotulos = [...HISTORICO_MESES, ...previsoesL3.map((_, i) => rotuloMes(i))];
const todosCustos = [...custoHistorico, ...Array(3).fill(null)];
const todasReceitas = [...receitaHistorica, ...Array(3).fill(null)];
const prevCustoLn = [...custoHistorico.map(() => null), custoHistorico[11], ...previsoesL3.map(f => f.custo)];
const prevReceitaLn = [...receitaHistorica.map(() => null), receitaHistorica[11], ...previsoesL3.map(f => f.receita)];

const historicoRoi = custoHistorico.map((c, i) => parseFloat((((receitaHistorica[i] - c) / c) * 100).toFixed(1)));
const previsaoRoi = previsoesL3.map(f => parseFloat(f.roi));
const todoHistoricoRoi = [...historicoRoi, ...Array(3).fill(null)];
const todaPrevisaoRoi = [...Array(11).fill(null), historicoRoi[11], ...previsaoRoi];

Chart.defaults.font.family = "'IBM Plex Sans', sans-serif";
Chart.defaults.color = '#6B7E91';

let graficoLinha;
let estadoFiltroGrafico = 'todos';

function construirGraficoLinha(rotulos, custo, receita, prevCusto, prevReceita) {
  const linhaOrcamento = rotulos.map((_, i) => Math.round(calcularPrevisao(mesAtual, i + 1) * (1 + margemOrcamentoPct / 100)));
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
        { label: 'Orçamento',        data: linhaOrcamento,    borderColor: '#F5CC4D', borderWidth: 1.5, borderDash: [3,3], pointRadius: 0, tension: 0.35, fill: false, spanGaps: true, backgroundColor: 'transparent' },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: { 
            callbacks: { 
                label: c => `${c.dataset.label}: R$ ${c.raw ? c.raw.toLocaleString('pt-BR', { minimumFractionDigits: emDolar ? 1 : 0, maximumFractionDigits: 1 }) : '--'}k` 
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
  if (periodo === 1) inicio = 11;
  else if (periodo === 2) inicio = 6;
  
  construirGraficoLinha(todosRotulos.slice(inicio), todosCustos.slice(inicio), todasReceitas.slice(inicio), prevCustoLn.slice(inicio), prevReceitaLn.slice(inicio));
  
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
        <div id="donut-abs-${i}" style="font-size:10px;color:var(--text-muted);margin-top:1px;">${absVal}</div>
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
    ? 'Custo mensal — soma = ' + 562000
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