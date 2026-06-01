require("dotenv").config();

var dashOperacionalModel = require("../models/dashOperacionalModel");

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);
console.log("TEM ACCESS KEY:", !!process.env.AWS_ACCESS_KEY_ID);
console.log("TEM SECRET KEY:", !!process.env.AWS_SECRET_ACCESS_KEY);
console.log("TEM SESSION TOKEN:", !!process.env.AWS_SESSION_TOKEN);

const s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        sessionToken: process.env.AWS_SESSION_TOKEN
    }
});

async function buscarGestoraOpJson(req, res) {
    try {
        const comando = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: "client/gestoraOp_master.json"
        });

        const resposta = await s3.send(comando);
        const conteudo = await resposta.Body.transformToString();
        const json = JSON.parse(conteudo);

        res.status(200).json(json);

    } catch (erro) {
        console.error("Erro ao buscar gestoraOp_master.json no S3:", erro);

        res.status(500).json({
            erro: "Erro ao buscar JSON da gestora no S3",
            detalhe: erro.message
        });
    }
}

function listarRegioes(req, res) {
    const idUsuario = req.params.idUsuario;

    dashOperacionalModel.listarRegioes(idUsuario)
        .then(resultado => {
            res.status(200).json(resultado);
        })
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarDatacenters(req, res) {
    const idUsuario = req.params.idUsuario;
    const idRegiao = req.params.idRegiao;

    dashOperacionalModel.listarDatacenters(idUsuario, idRegiao)
        .then(resultado => {
            res.status(200).json(resultado);
        })
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarRegioesDaEmpresa(req, res) {
    const idEmpresa = req.params.idEmpresa;

    console.log("REQ PARAMS:", req.params);
    console.log("ID EMPRESA RECEBIDO NO CONTROLLER:", idEmpresa);

    dashOperacionalModel.listarRegioesDaEmpresa(idEmpresa)
        .then(resultado => {
            res.status(200).json(resultado);
        })
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    listarDatacenters,
    listarRegioes,
    listarRegioesDaEmpresa,
    buscarGestoraOpJson
};