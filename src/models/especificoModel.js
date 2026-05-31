var database = require("../database/config");

function selectServidor(idZona) {

    const instrucaoSql = `
        SELECT * FROM SERVIDOR
            WHERE fkzona = ?;
    `;
    return database.executar(instrucaoSql, [idZona]);
}

module.exports = {
    selectServidor
};