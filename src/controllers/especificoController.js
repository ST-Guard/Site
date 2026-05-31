var especificoModel = require("../models/especificoModel");

function selectServidor(req, res) {

    const idZona = req.params.idZona;

    especificoModel.selectServidor(idZona)
        .then(function (resultado) {
            console.log("RESULTADO:", resultado);
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    selectServidor
}