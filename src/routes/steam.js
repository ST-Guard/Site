var express = require("express");
var router = express.Router();
const cheerio = require("cheerio");

let cacheSteam = null;

async function atualizarDados() {
    const resposta = await fetch("https://cdn.fastly.steamstatic.com/steam/publicstats/download_traffic_per_country.jsonp?v=05-19-2026-17");
    const texto = await resposta.text();
    const jsonLimpo = texto
        .replace(/^.*?\(/, "")
        .replace(/\);?$/, "");
    cacheSteam = JSON.parse(jsonLimpo);
}

router.get("/steamDownloads", (req, res) => {
    if (!cacheSteam) {
        return res.status(503).json({
            erro: "Dados ainda carregando"
        });
    }
    res.json(cacheSteam);
});

router.get("/volumeLancamentosSteam", async (req, res) => {
    try {
        const resposta = await fetch("https://store.steampowered.com/search/results/?query&start=0&count=50&dynamic_data=&sort_by=Released_DESC&force_infinite=1&category1=998&filter=popularcomingsoon&infinite=1");
        const dados = await resposta.json();
        const html = dados.results_html;
        const leituraHTML = cheerio.load(html);
        const jogos = [];

        leituraHTML("a.search_result_row").each((_, row) => {
            const nome = leituraHTML(row).find(".title").text().trim();
            const dataLancamento = leituraHTML(row).find(".search_released").text().trim();

            if (!nome) return;

            jogos.push({
                nome,
                dataLancamento
            });
        });

        const totalLancamentos = jogos.length;
        let criticidade = "Aviso";

        if (totalLancamentos >= 71) {
            criticidade = "Crítico";
        } else if (totalLancamentos >= 41) {
            criticidade = "Relevante";
        }
        res.json({
            totalLancamentos,
            criticidade,
            jogos
        });

    } catch (erro) {
        console.log(erro);
        res.status(500).json({
            erro: "Erro ao buscar lançamentos da Steam"
        });
    }
});

router.get("/volumeCompradosSteam", async (req, res) => {
    try {
        const resposta = await fetch("https://store.steampowered.com/search/results/?query&start=0&count=50&dynamic_data=&sort_by=Released_DESC&force_infinite=1&category1=998&filter=popularcomingsoon&infinite=1");
        const dados = await resposta.json();
        const html = dados.results_html;
        const leituraHTML = cheerio.load(html);
        const comprados = [];

        leituraHTML("a.search_result_row").each((i, row) => {
            const nome = leituraHTML(row).find(".title").text().trim();
            const link = leituraHTML(row).attr("href");

            if (nome && link) {
                comprados.push({
                    nome,
                    link
                });
            }
        });
        res.json({
            quantidade: comprados.length,
            comprados
        });
    } catch (erro) {
        console.log(erro);
        res.status(500).json({
            erro: "Erro ao buscar jogos"
        });
    }
});

router.get("/topSellers", async (req, res) => {
    try {
        const resposta = await fetch( "https://store.steampowered.com/search/results/?query&start=0&count=10&dynamic_data=&sort_by=_ASC&os=win&filter=topsellers&cc=BR&l=portuguese&infinite=1",
            {
                headers: {
                    "User-Agent": "Mozilla/5.0"
                }
            }
        );

        const dados = await resposta.json();
        const leituraHTML = cheerio.load(dados.results_html);
        const jogos = [];

        leituraHTML("a[href*='/app/']").each((i, elemento) => {
            const nome = leituraHTML(elemento).find(".title").text().trim();
            const link = leituraHTML(elemento).attr("href");
            const appId = leituraHTML(elemento).attr("data-ds-appid");

            if (nome && link) {
                jogos.push({nome, link, appId});
            }
        });
        res.json(jogos.slice(0, 10));
    } catch (erro) {
        res.status(500).json({
            erro: erro.message
        });
    }
});

router.get("/reviews/nome/:nomeJogo", async (req, res) => {
    const nomeJogo = req.params.nomeJogo;

    try {
        const urlBusca = `https://store.steampowered.com/search/suggest?term=${encodeURIComponent(nomeJogo)}&f=games&cc=BR&l=brazilian`;
        const respostaBusca = await fetch(urlBusca, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });
        const html = await respostaBusca.text();
        const buscaHTML = html.match(/data-ds-appid="(\d+)"/);

        if (!buscaHTML) {
            return res.status(404).json({
                erro: "AppID não encontrado",
                nomeJogo
            });
        }

        const appid = buscaHTML[1];
        let cursor = "*";
        let totalReviews = 0;

        const seteDiasAtras =
            Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

        while (true) {
            const urlReviews = `https://store.steampowered.com/appreviews/${appid}?json=1&filter=recent&language=all&purchase_type=all&num_per_page=100&cursor=${encodeURIComponent(cursor)}`;
            const respostaReviews = await fetch(urlReviews);
            const dados = await respostaReviews.json();

            if (!dados.reviews || dados.reviews.length === 0) {
                break;
            }

            let reviewAntiga = false;

            for (let i = 0; i < dados.reviews.length; i++) {
                const review = dados.reviews[i];

                if (review.timestamp_created >= seteDiasAtras) {
                    totalReviews++;
                } else {
                    reviewAntiga = true;
                    break;
                }
            }

            if (reviewAntiga) {
                break;
            }

            cursor = dados.cursor;
        }
        res.json({
            nomeJogo,
            appid,
            reviewsUltimos7Dias: totalReviews
        });
    } catch (erro) {
        res.status(500).json({
            erro: erro.message
        });
    }
});

router.get("/reviews/app/:appId", async (req, res) => {
    const appId = req.params.appId;

    try {
        const resposta = await fetch(
            `https://store.steampowered.com/appreviews/${appId}?json=1&language=portuguese&purchase_type=all`
        );

        const dados = await resposta.json();

        res.json({
            totalReviews: dados.query_summary.total_reviews || 0,
            positivas: dados.query_summary.total_positive || 0,
            negativas: dados.query_summary.total_negative || 0,
            score: dados.query_summary.review_score_desc || "Sem dados"
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: erro.message
        });
    }
});

router.get("/reviews/:appid", async (req, res) => {
    const appid = req.params.appid;
    let cursor = "*";
    let totalReviews = 0;
    const seteDiasAtras = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);

    try {
        while (true) {
            const url = `https://store.steampowered.com/appreviews/${appid}?json=1&filter=recent&language=all&purchase_type=all&num_per_page=100&cursor=${encodeURIComponent(cursor)}`;
            const resposta = await fetch(url);
            const dados = await resposta.json();

            if (!dados.reviews || dados.reviews.length === 0) {
                break;
            }

            let reviewAntiga = false;
            for (let i = 0; i < dados.reviews.length; i++) {
                const review = dados.reviews[i];

                if (review.timestamp_created >= seteDiasAtras) {
                    totalReviews++;
                } else {
                    reviewAntiga = true;
                    break;
                }
            }

            if (reviewAntiga) {
                break;
            }
            cursor = dados.cursor;
        }
        res.json({
            appid,
            reviewsUltimos7Dias: totalReviews
        });
    } catch (erro) {
        res.status(500).json({
            erro: erro.message
        });
    }
});

router.get("/steamGlobal", async (req, res) => {
    try {
        const resposta = await fetch("https://store.steampowered.com/stats/stats/?l=english", {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const html = await resposta.text();
        const leituraHTML = cheerio.load(html);
        const textoPagina = leituraHTML("body").text().replace(/\s+/g, " ");

        const online = textoPagina.match(/Concurrent Steam Users:\s*([\d,]+)/i);

        const onlineAgora = online
            ? Number(online[1].replace(/,/g, ""))
            : 0;

        let jogandoAgora = 0;

        leituraHTML("tr").each((_, linha) => {
            const textoLinha = leituraHTML(linha).text().replace(/\s+/g, " ").trim();

            const matchJogadores = textoLinha.match(/^([\d,]+)\s+[\d,]+\s+/);

            if (matchJogadores) {
                jogandoAgora += Number(matchJogadores[1].replace(/,/g, ""));
            }
        });

        res.json({
            onlineAgora,
            jogandoAgora
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: erro.message
        });
    }
});

atualizarDados();

setInterval(atualizarDados, 1800000);

module.exports = router;