
var ambiente_processo = 'desenvolvimento';
var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
require("dotenv").config({ path: caminho_env });
var express = require("express");
var cors = require("cors");
var path = require("path");

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

//Rotas Financeira
app.use("/financeira", financeira);

// Rota grafico Steam
let cacheSteam = null;

async function atualizarDados() {

    const resposta = await fetch("https://cdn.fastly.steamstatic.com/steam/publicstats/download_traffic_per_country.jsonp?v=05-19-2026-17");

    const texto = await resposta.text();

    const jsonLimpo = texto
        .replace(/^.*?\(/, "")
        .replace(/\);?$/, "");

    cacheSteam = JSON.parse(jsonLimpo);

    console.log("Cache atualizado");
}

atualizarDados();

setInterval(atualizarDados, 10000);

app.get("/api/steam-downloads", (req, res) => {
    res.json(cacheSteam);
});

// inicia o servidor
app.listen(PORT, function () {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`Ambiente: ${process.env.AMBIENTE_PROCESSO || ambiente_processo}`);
});