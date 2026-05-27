const express = require("express");
const db = require("./database");

const app = express();

const PORT = process.env.PORT || 3000;

const URL_STEAM =
    "https://cdn.fastly.steamstatic.com/steam/publicstats/download_traffic_per_country.jsonp?v=05-19-2026-17";

function salvarDownloadBrasil(dados) {
    const brasil = dados.BRA;

    db.prepare(`
        INSERT INTO steam_downloads (
            pais,
            totalbytes,
            avgmbps,
            criado_em
        )
        VALUES (?, ?, ?, ?)
    `).run(
        "BRA",
        String(brasil.totalbytes),
        Number(brasil.avgmbps),
        new Date().toISOString()
    );

    db.prepare(`
        DELETE FROM steam_downloads
        WHERE criado_em < datetime('now', '-72 hours')
    `).run();
}

async function coletarSteamDownloads() {
    try {
        const resposta = await fetch(URL_STEAM);
        const texto = await resposta.text();

        const jsonTexto = texto
            .replace(/^.*?\(/, "")
            .replace(/\);?$/, "");

        const dados = JSON.parse(jsonTexto);

        salvarDownloadBrasil(dados);

        console.log("Dados salvos:", new Date().toLocaleString("pt-BR"));
    } catch (erro) {
        console.error("Erro ao coletar Steam:", erro.message);
    }
}

app.get("/api/steamDownloadsHistorico", (req, res) => {
    const linhas = db.prepare(`
        SELECT *
        FROM steam_downloads
        WHERE criado_em >= datetime('now', '-48 hours')
        ORDER BY criado_em ASC
    `).all();

    res.json(linhas);
});

coletarSteamDownloads();
setInterval(coletarSteamDownloads, 10 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});