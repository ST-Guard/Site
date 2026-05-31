var database = require("../database/config");

function BuscarZona(idUsuario) {
    var instrucao = `SELECT z.idZona, z.nome, z.fkDataCenter FROM analista_zona JOIN usuario ON idUsuario = usuario_id JOIN zona  as z ON  zona_id = z.idZona WHERE idUsuario = ${idUsuario};`;
    return database.executar(instrucao);
}

module.exports = {
    BuscarZona
};