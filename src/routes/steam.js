var express = require("express");
var router = express.Router();

router.get("/steamGlobal", async (req, res) => {

    try {
        const resposta = await fetch(
            "https://store.steampowered.com/stats/userdata.json"
        );
        if (!resposta.ok) {
            throw new Error("Erro ao buscar dados da Steam");
        }

        const dados = await resposta.json();
        const onlineAgora =
            Number(dados.current_users);
        const jogandoAgora =
            Number(dados.current_ingame);

        res.status(200).json({
            onlineAgora,
            jogandoAgora
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Falha ao buscar dados globais da Steam"
        });
    }
});

module.exports = router;