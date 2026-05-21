var database = require("../database/config");
//return database.executar(instrucaoSql);


async function pegarDadosFinanceiro(bucket) {

    const urlS3 = `https://${bucket}.s3.amazonaws.com/client/financeiro_master.json`;
    try {
        console.log("Entrou no try")
        const resposta = await fetch(urlS3);
        if (!resposta.ok) {
            throw new Error("Erro de rede ao acessar o S3");
        }
        const dados = await resposta.json();
        console.log("Dados carregados com sucesso no Modal:", dados);
        return dados;

    } catch (erro) {
        console.error("Erro ao puxar dados do S3:", erro);
    }


}

module.exports = {
    pegarDadosFinanceiro
};