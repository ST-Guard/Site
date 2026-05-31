var dashOperacionalModel = require("../models/dashOperacionalModel");

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

module.exports = {
     listarDatacenters,
     listarRegioes

};