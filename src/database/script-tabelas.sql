CREATE DATABASE stsecurity;

USE stsecurity;

CREATE TABLE empresa (
	id INT PRIMARY KEY AUTO_INCREMENT,
	razao_social VARCHAR(50),
	cnpj CHAR(14),
	codigo_ativacao VARCHAR(50)
);

CREATE TABLE usuario (
	idPessoa INT PRIMARY KEY auto_increment,
    fkEmpresa INT, FOREIGN KEY (fkEmpresa) REFERENCES empresa(id),
    nome VARCHAR(100),
    email VARCHAR(200),
    numero CHAR(11),
    senha VARCHAR(50)
);

INSERT INTO empresa VALUES
	(DEFAULT, "teste", "12345678901234", "h2z");