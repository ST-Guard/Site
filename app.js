
var ambiente_processo = 'desenvolvimento';
var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
require("dotenv").config({ path: caminho_env });
var express = require("express");
var cors = require("cors");
var path = require("path");
const cheerio = require("cheerio");

var PORT = process.env.APP_PORT || process.env.PORTA || 3333;
var HOST = process.env.APP_HOST || 'localhost';

var app = express();


var indexRouter = require("./src/routes/index");
var usuarioRouter = require("./src/routes/usuarios");
var falecosnosRouter = require("./src/routes/faleconosco")
var servidorRouter = require("./src/routes/servidor")
var zonaRouter = require("./src/routes/zona");
var sessaoRouter = require("./src/routes/sessao");
var financeira = require("./src/routes/financeiraRoute");
var steamRouter = require("./src/routes/steam");
var buscarzonasRouter = require("./src/routes/buscarzona")

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// rotas
app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/enviar", falecosnosRouter)
app.use("/servidor", servidorRouter)
app.use("/zonas", zonaRouter);
app.use("/sessao", sessaoRouter);
app.use("/api", steamRouter);
app.use("/bzonas", buscarzonasRouter)

//Rotas Financeira
app.use("/financeira", financeira);

// Rota grafico servidor especifico
let cacheSteam = null;

async function atualizarDados() {
    const resposta = await fetch("https://cdn.fastly.steamstatic.com/steam/publicstats/download_traffic_per_country.jsonp?v=05-19-2026-17")
    const texto = await resposta.text()
    const jsonLimpo = texto
        .replace(/^.*?\(/, "")
        .replace(/\);?$/, "")
    cacheSteam = JSON.parse(jsonLimpo)
}

atualizarDados();

setInterval(atualizarDados, 1800000);

app.get("/api/steamDownloads", (req, res) => {
    res.json(cacheSteam);
});

app.get("/api/volumeLancamentosSteam", async (req, res) => {
    try {
        const resposta = await fetch("https://store.steampowered.com/search/results/?query&start=0&count=50&dynamic_data=&sort_by=Released_DESC&force_infinite=1&category1=998&filter=popularcomingsoon&infinite=1");
        const dados = await resposta.json();
        const html = dados.results_html;
        const leituraHTML = cheerio.load(html);
        console.log(leituraHTML)
        const jogos = [];

        leituraHTML("a.search_result_row").each((_, row) => {
            const nome = leituraHTML(row).find(".title").text().trim();
            const dataLancamento = leituraHTML(row).find(".search_released").text().trim();

            if (!nome) return;

            jogos.push({
                nome,
                dataLancamento
            });
        });

        const totalLancamentos = jogos.length;
        let criticidade = "Aviso";

        if (totalLancamentos >= 71) {
            criticidade = "Crítico";
        } else if (totalLancamentos >= 41) {
            criticidade = "Relevante";
        }
        res.json({
            totalLancamentos,
            criticidade,
            jogos
        });

    } catch (erro) {
        console.log(erro);
        res.status(500).json({
            erro: "Erro ao buscar lançamentos da Steam"
        });
    }
});

app.get("/api/volumeCompradosSteam", async (req, res) => {
    try {
        const resposta = await fetch("https://store.steampowered.com/search/results/?query&start=0&count=50&dynamic_data=&sort_by=Released_DESC&force_infinite=1&category1=998&filter=popularcomingsoon&infinite=1");
        const html = await resposta.text();
        const leituraHTML = cheerio.load(html);
        console.log(leituraHTML)
        const comprados = [];

        leituraHTML("a[href*='/app/']").each((i, row) => {
            const nome = leituraHTML(row).text().trim();
            const link = leituraHTML(row).attr("href");

            if (nome && link) {
                comprados.push({
                    nome,
                    link
                });
            } else {
                console.log("Dados não capturados")
            }

            res.json({
                comprados,
            });

        });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({
            erro: "Erro ao buscar lançamentos da Steam"
        });
    }
});

// inicia o servidor
app.listen(PORT, function () {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`Ambiente: ${process.env.AMBIENTE_PROCESSO || ambiente_processo}`);
});