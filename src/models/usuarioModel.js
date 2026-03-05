var database = require("../database/config")

function autenticar(emailVar,senhaVar) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", emailVar, senhaVar)
    var instrucaoSql = `
        SELECT nome, email FROM usuario WHERE email = '${emailVar}' AND senha = '${senhaVar}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// Coloque os mesmos parâmetros aqui. Vá para a var instrucaoSql
function cadastrar(nome, email, senha,cpf) {

    var instrucaoSql = `
        INSERT INTO usuario ( nome, email, cpf, senha)
        VALUES ( '${nome}', '${email}', '00000000000', '${senha}');
    `;

    return database.executar(instrucaoSql);
}

module.exports = {
    autenticar,
    cadastrar
};