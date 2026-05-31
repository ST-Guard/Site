var database = require("../database/config");

function listarRegioes(idUsuario){
    var instrucao=`
    SELECT DISTINCT r.estado, r.idRegiao FROM usuario as u JOIN datacenters_gestores as dg 
	ON dg.fk_usuario = u.idUsuario 
		JOIN datacenter as d 
			ON dg.fk_datacenter = d.idDataCenter 
				JOIN regiao as r ON fkRegiaoDataCenter = d.idDataCenter
				WHERE u.fkPapel = 1 AND dg.fk_usuario = ${idUsuario};
    `;
    return database.executar(instrucao);

}

function listarDatacenters( idUsuario,idRegiao) {
    var instrucao = `
    SELECT d.nome, fk_datacenter FROM usuario as u JOIN datacenters_gestores as dg 
	ON dg.fk_usuario = u.idUsuario 
		JOIN datacenter as d 
			ON dg.fk_datacenter = d.idDataCenter 
				JOIN regiao as r ON fkRegiaoDataCenter = d.idDataCenter
				WHERE u.fkPapel = 1 AND dg.fk_usuario =${idUsuario} AND r.idRegiao = ${idRegiao};
    `;
    return database.executar(instrucao);
}

module.exports = {
    listarDatacenters,
    listarRegioes
};