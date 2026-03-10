show databases;
show tables;

CREATE DATABASE smartData;
USE smartData;

CREATE TABLE empresa(
idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
razaoSocial VARCHAR(100),
cpnj CHAR(14)
);

CREATE TABLE usuario(
idUsuario INT PRIMARY KEY AUTO_INCREMENT,
nome VARCHAR(100),
email VARCHAR(200),
cpf CHAR(11),
senha VARCHAR(50),
idGerente INT,
	CONSTRAINT idGerenteUsuario
    FOREIGN KEY(idGerente)
    REFERENCES usuario(idUsuario)
);

CREATE TABLE servidor(
idServidor INT PRIMARY KEY AUTO_INCREMENT,
tipoServidor VARCHAR(100),
qtdServidores INT
);

CREATE TABLE dataCenter(
idDataCenter INT PRIMARY KEY AUTO_INCREMENT,
identificadorDT VARCHAR(100),
capacidadeServidores INT,
fkEmpresa INT,
	CONSTRAINT fkDataCenterEmpresa
    FOREIGN KEY(fkEmpresa)
	REFERENCES empresa(idEmpresa),
fkServidor INT,
	CONSTRAINT fkDataCenterServidor
    FOREIGN KEY(fkServidor)
    REFERENCES servidor(idServidor)
);

CREATE TABLE endereco(
idEndereco INT PRIMARY KEY AUTO_INCREMENT,
cep CHAR(8),
numero VARCHAR(45),
complemento VARCHAR(45),
fkEmpresa INT,
	CONSTRAINT fkEnderecoEmpresa
    FOREIGN KEY(fkEmpresa)
    REFERENCES empresa(idEmpresa),
fkDataCenter INT,
	CONSTRAINT fkEnderecoDataCenter
	FOREIGN KEY(fkDataCenter)
    REFERENCES dataCenter(idDataCenter)
);

CREATE TABLE componentes(
idComponente INT PRIMARY KEY AUTO_INCREMENT,
nomeComponente VARCHAR(50),
tipoComponente VARCHAR(45),
unidadeMedida VARCHAR(45),
biblioteca VARCHAR(50),
comando VARCHAR(100),
parametro VARCHAR(50)
);

CREATE TABLE componentes_servidor(
limite FLOAT,
fkServidor INT,
fkComponentes INT,
	PRIMARY KEY (fkServidor, fkComponentes)
);

