// app.js (cole e substitua o existente)
var ambiente_processo = 'desenvolvimento';
var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
require("dotenv").config({ path: caminho_env });

const express = require("express");
const cors = require("cors");
const path = require("path");

// porta principal - usa APP_PORT, se não existir tenta PORTA, senão 3333
const PORT = process.env.APP_PORT || process.env.PORTA || 3333;
const HOST = process.env.APP_HOST || 'localhost';

const app = express();

// routers (ajuste se algum não existir)
const indexRouter = require("./src/routes/index");
const usuarioRouter = require("./src/routes/usuarios");
const empresasRouter = require("./src/routes/empresas");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// rotas
app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);
app.use("/empresas", empresasRouter);


// inicia o servidor
app.listen(PORT, function () {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`Ambiente: ${process.env.AMBIENTE_PROCESSO || ambiente_processo}`);
});