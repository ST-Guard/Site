var express = require("express");
var router = express.Router();

router.get("/steamGlobal", async (req, res) => {

    try {
        const resposta = await fetch("https://store.steampowered.com/stats/userdata.json");
        const dados = await resposta.json();
        const historico = dados[0].data;
        const ultimoRegistro = historico[historico.length - 1];
        const onlineAgora = ultimoRegistro[1];

        res.json({onlineAgora});
        
    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Falha ao buscar dados globais da Steam"
        });
    }

});

module.exports = router;