var express = require("express");
var router = express.Router();
var path = require("path");
const financeiraController = require('../controllers/financeiraController.js');



router.post("/pegarDadosFinanceira", function (req, res) {
    financeiraController.dadosFinanceira(req, res);
});





module.exports = router;