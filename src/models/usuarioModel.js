var database = require("../database/config")

function autenticar(emailVar, senhaVar) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", emailVar, senhaVar)
    
    var instrucaoSql = `
        SELECT u.idUsuario, u.nome, u.email, u.fkPapel, p.fkEmpresa FROM usuario u
        JOIN papel p ON u.fkPapel = p.idPapel
            WHERE u.email = '${emailVar}' AND u.senha = '${senhaVar}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function cadastrar(nome, email, cpf, telefone, senha, fkPapel, fkZona) {
    console.log("ACESSEI O USUARIO MODEL \n\n\t\t >> Função cadastrar():", nome, email);

    var instrucaoSql = `
        INSERT INTO usuario (nome, email, cpf, telefone, senha, fkPapel, status) 
        VALUES (?, ?, ?, ?, ?, ?, 'Ativo');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    return database.executar(instrucaoSql, [nome, email, cpf, telefone, senha, fkPapel])
        .then(function (resultado) {
            var idUsuario = resultado.insertId;

            var instrucaoZona = `

            INSERT INTO analista_zona (usuario_id, zona_id, ativo) VALUES
				(?, ?, 1);
            `;

            console.log("Executando a instrução SQL da zona: \n" + instrucaoZona);

            return database.executar(instrucaoZona, [idUsuario, fkZona]);
        });
}


function listar() {
    
    var instrucao = `
                SELECT 
            u.idUsuario,
            u.nome,
            u.email,
            u.telefone,
            u.status,
            z.nome AS zona
        FROM usuario u
        LEFT JOIN analista_zona az
        ON u.idUsuario = az.usuario_id
        JOIN zona z
            ON z.idZona = az.zona_id
        WHERE u.fkPapel = 2;
    `;
    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.executar(instrucao);
}

function mudarStatus(idUsuario, novoStatus) {
    var instrucaoSql = `
        UPDATE usuario SET status = '${novoStatus}' WHERE idUsuario = ${idUsuario};
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function deletar(idUsuario) {
    console.log("Deletando usuário:", idUsuario);

    var instrucaoSql = `
        DELETE FROM usuario 
        WHERE idUsuario = ?;
    `;

    return database.executar(instrucaoSql, [idUsuario]);
}


module.exports = {
    autenticar,
    cadastrar,
    listar,
    mudarStatus,
    deletar
};