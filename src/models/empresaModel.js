var database = require("../database/config")

function cadastrarEmpresa(nome, cnpj) {

    var instrucaoSql = `
        INSERT INTO empresa (nome, cnpj)
        VALUES ('${nome}', '${cnpj}');
    `;

    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrarEmpresa
}