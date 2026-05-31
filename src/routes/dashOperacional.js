var express = require("express");
var router = express.Router();

var dashOperacionalController = require("../controllers/dashOperacionalController");

router.get("/listarDatacenters/:idUsuario/:idRegiao", function (req, res) {
    dashOperacionalController.listarDatacenters(req, res);
});

router.get("/listarRegioes/:idUsuario/", function (req, res) {
    dashOperacionalController.listarRegioes(req, res);
});

module.exports = router;


