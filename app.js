
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
var buscarzonasRouter = require("./src/routes/buscarzona")
/* VICTIN ROTA */
var dadosAlertaRouter = require("./src/routes/alertas")
var dadosAlertaRouter2 = require("./src/routes/alertas2")

var dashOperacionalRouter = require("./src/routes/dashOperacional");



// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));


app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/enviar", falecosnosRouter);
app.use("/servidor", servidorRouter);
app.use("/zonas", zonaRouter);
app.use("/sessao", sessaoRouter);
app.use("/bzonas", buscarzonasRouter)

/* VICTIN ROTA */
app.use("/alertas", dadosAlertaRouter)
app.use("/alertas2", dadosAlertaRouter2)

//Rotas Financeir.a
app.use("/dashOperacional", dashOperacionalRouter);
app.use("/financeira", financeira);
app.use("/bzonas", buscarzonasRouter);

// inicia o servidor
app.listen(PORT, function () {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`Ambiente: ${process.env.AMBIENTE_PROCESSO || ambiente_processo}`);
});