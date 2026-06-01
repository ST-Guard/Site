var express = require("express");
var router = express.Router();

var dashOperacionalController = require("../controllers/dashOperacionalController");

router.get("/listarDatacenters/:idUsuario/:idRegiao", function (req, res) {
    dashOperacionalController.listarDatacenters(req, res);
});

router.get("/listarRegioes/:idUsuario/", function (req, res) {
    dashOperacionalController.listarRegioes(req, res);
});

router.get("/listarRegioesDaEmpresa/:idEmpresa/", function (req, res) {
    dashOperacionalController.listarRegioesDaEmpresa(req, res);
});

router.get("/buscarGestoraOpJson", function (req, res) {
    dashOperacionalController.buscarGestoraOpJson(req, res);
});
module.exports = router;

