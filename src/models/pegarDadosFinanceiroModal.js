const database = require("../database/config");
require("dotenv").config({ path: ".env.dev" });
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
// npm install @aws-sdk/client-s3 dotenv

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.aws_access_key_id,
        secretAccessKey: process.env.aws_secret_access_key,
        sessionToken: process.env.aws_session_token
    }
});

async function pegarDadosFinanceiro(bucket) {
    
    const parametros = {
        Bucket: bucket,
        Key: "client/dashboard_financeiro.json" 
    };
    try {
        console.log("Entrou no try para buscar no S3 via AWS SDK");
        
        const command = new GetObjectCommand(parametros);
        const resposta = await s3Client.send(command);    
        const stringData = await resposta.Body.transformToString();
        const dados = JSON.parse(stringData);
        console.log("Dados carregados com sucesso do S3:", dados);
        return dados;
    } catch (erro) {
        console.error("Erro ao puxar dados do S3:", erro);
        throw erro; 
    }
}

module.exports = {
    pegarDadosFinanceiro
};