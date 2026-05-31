var database = require("../database/config");

function carregarDatabases(fkEmpresa) {

    const instrucaoSql = `
		SELECT dc.idDatacenter, dc.nome FROM
        datacenter as dc JOIN datacenters_gestores 
        ON fk_datacenter = idDataCenter 
        JOIN usuario 
        ON idUsuario = fk_usuario
        JOIN papel ON fkPapel = idPapel
        WHERE fkEmpresa = ${fkEmpresa};
    `;
    return database.executar(instrucaoSql);
}

function listarZonas(idDataCenter) {

    console.log(`o id do datacenter é: ${idDataCenter}`)
    const instrucaoSql = `
        SELECT idZona, nome FROM zona
        WHERE fkDatacenter = ?;
    `;
    return database.executar(instrucaoSql, [idDataCenter]);
}

async function cadastrarServidor(nome, tipo, estado, fkZona) {

    const resultado = await database.executar(`
        INSERT INTO servidor (nome, tipo, estado, fkZona)
        VALUES (?, ?, ?, ?);
    `, [nome, tipo, estado, fkZona]);

    return resultado;
}

async function cadastrarComponente(nome, tipo, unidade, capacidade, fkServidor) {

    const componenteResult = await database.executar(`
        INSERT INTO componentes (nome, tipo, unidadeMedida, capacidadeMaxima)
        VALUES (?, ?, ?, ?);
    `, [nome, tipo, unidade, capacidade]);

    const idComponente = componenteResult.insertId;

    await database.executar(`
        INSERT INTO componentes_servidores (limite, fkServidor, fkComponentes)
        VALUES (?, ?, ?);
    `, [capacidade, fkServidor, idComponente]);
}

function listarServidores(idEmpresa) {

    var instrucao = `
                SELECT
            s.idServidor,
            s.nome,
            s.estado,

            MAX(CASE WHEN c.nome = 'CPU' THEN cs.limite END) AS limiteCpu,
            MAX(CASE WHEN c.nome = 'RAM' THEN cs.limite END) AS limiteRam,
            MAX(CASE WHEN c.nome = 'DISCO' THEN cs.limite END) AS limiteDisco,
            MAX(CASE WHEN c.nome = 'REDE' THEN cs.limite END) AS limiteRede

        FROM servidor s JOIN zona z ON z.idZona = s.fkZona
            JOIN datacenter d ON d.idDataCenter = z.fkDataCenter
		JOIN datacenters_gestores dg 
        ON dg.fk_datacenter = d.idDataCenter 
        JOIN usuario u
        ON u.idUsuario = dg.fk_usuario
        JOIN papel p ON u.fkPapel = p.idPapel
            LEFT JOIN componentes_servidores cs ON cs.fkServidor = s.idServidor
            LEFT JOIN componentes c ON c.idComponente = cs.fkComponentes

        WHERE p.fkEmpresa =  ? 
        GROUP BY s.idServidor, s.nome, s.estado
        ORDER BY s.idServidor;
    `;

    return database.executar(instrucao, [idEmpresa]);
}

function listarComponentes(idEmpresa) {

    var instrucao = `
        SELECT
            s.idServidor,
            s.nome,
            s.estado
        FROM servidor s
            JOIN zona z ON z.idZona = s.fkZona
            JOIN datacenter d ON d.idDataCenter = z.fkDataCenter
            JOIN usuario u ON u.idUsuario = d.fkUsuarioDataCenter
            JOIN papel p ON p.idPapel = u.fkPapel
        WHERE p.fkEmpresa = ?
        ORDER BY s.idServidor;
    `;

    return database.executar(instrucao, [idEmpresa]);
}

module.exports = {
    carregarDatabases,
    listarZonas,
    listarServidores,
    listarComponentes,
    cadastrarServidor,
    cadastrarComponente
};