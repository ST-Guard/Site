var express = require("express"); 
var router = express.Router();


var BuscarZonasControler = require("../controllers/BuscarZonaController")


router.post("/", function(req, res) {
    BuscarZonasControler.enviar(req, res);
    
    console.log("passou pelo router fale conosco")
})

module.exports = router