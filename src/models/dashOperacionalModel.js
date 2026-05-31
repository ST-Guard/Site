var database = require("../database/config");

function listarRegioes(idUsuario) {
    var instrucao = `
        SELECT DISTINCT 
            r.uf,
            r.cidade,
            r.idRegiao
        FROM usuario AS u
        JOIN datacenters_gestores AS dg 
            ON dg.fk_usuario = u.idUsuario 
        JOIN datacenter AS d 
            ON dg.fk_datacenter = d.idDataCenter 
        JOIN regiao AS r 
            ON r.fkRegiaoDataCenter = d.idDataCenter
        WHERE u.fkPapel = 1 
        AND dg.fk_usuario = ${idUsuario};
    `;

    console.log(" listarRegioes:", instrucao);
    return database.executar(instrucao);
}

function listarDatacenters(idUsuario, idRegiao) {
    var instrucao = `
        SELECT 
            d.nome,
            dg.fk_datacenter
        FROM usuario AS u
        JOIN datacenters_gestores AS dg 
            ON dg.fk_usuario = u.idUsuario 
        JOIN datacenter AS d 
            ON dg.fk_datacenter = d.idDataCenter 
        JOIN regiao AS r 
            ON r.fkRegiaoDataCenter = d.idDataCenter
        WHERE u.fkPapel = 1 
        AND dg.fk_usuario = ${idUsuario} 
        AND r.idRegiao = ${idRegiao};
    `;

    console.log(" listarDatacenters:", instrucao);
    return database.executar(instrucao);
}

function listarRegioesDaEmpresa(idEmpresa) {
    var instrucao = `
        SELECT DISTINCT 
            r.idRegiao,
            r.uf,
            r.cidade
        FROM regiao AS r
        JOIN datacenter AS d
            ON d.idDataCenter = r.fkRegiaoDataCenter
        JOIN empresa AS e
            ON e.idEmpresa = r.fkRegiaoEmpresa
        WHERE e.idEmpresa = ${idEmpresa};
    `;

    console.log(" listarRegioesDaEmpresa:", instrucao);
    return database.executar(instrucao);
}

module.exports = {
    listarDatacenters,
    listarRegioes,
    listarRegioesDaEmpresa
};