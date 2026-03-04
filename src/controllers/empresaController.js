var empresaModel = require("../models/empresaModel");

function cadastrarEmpresa(req, res) {

    var nome = req.body.nomeServer;
    var cnpj = req.body.cnpjServer;

    if (nome == undefined) {
        return res.status(400).send("Nome está undefined!");
    } else if (cnpj == undefined) {
        return res.status(400).send("CNPJ está undefined!");
    }

    empresaModel.cadastrarEmpresa(nome, cnpj)
        .then(function (resultado) {
            res.status(201).json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    cadastrarEmpresa
};