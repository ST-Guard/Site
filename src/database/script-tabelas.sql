CREATE DATABASE stsecurity;

USE stsecurity;

CREATE TABLE empresa (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(100) NOT NULL,
	cnpj CHAR(14) NOT NULL UNIQUE
);

CREATE TABLE usuario (
	idUsuario INT AUTO_INCREMENT,
	fkEmpresa INT NOT NULL,
		CONSTRAINT fkUsuarioEmpresa
			FOREIGN KEY (fkEmpresa)
				REFERENCES empresa (id),
		PRIMARY KEY (idUsuario, fkEmpresa),
	nome VARCHAR(100) NOT NULL,
	email VARCHAR(200) NOT NULL UNIQUE,
	cpf CHAR(11) NOT NULL UNIQUE,
	senha VARCHAR(50) NOT NULL,
	gestor INT,
		CONSTRAINT fkUsuarioGestor
			FOREIGN KEY (gestor)
				REFERENCES usuario (idUsuario)
);

CREATE TABLE dataCenter (
	idDataCenter INT AUTO_INCREMENT,
	fkEmpresa INT NOT NULL,
		CONSTRAINT fkDataCenterEmpresa
			FOREIGN KEY (fkEmpresa)
				REFERENCES empresa(id),
		PRIMARY KEY (idDataCenter, fkEmpresa),
	cep VARCHAR(45) NOT NULL,
	pais VARCHAR(45) NOT NULL,
	estado VARCHAR(45) NOT NULL,
	cidade VARCHAR(45) NOT NULL,
	logradouro VARCHAR(45) NOT NULL,
	numero VARCHAR(10) NOT NULL,
	complemento VARCHAR(45),
	qtdServidor INT NOT NULL,
	tamArea INT NOT NULL
);

CREATE TABLE servidor (
	idServidores INT PRIMARY KEY AUTO_INCREMENT,
	modelRam VARCHAR(100) NOT NULL,
	qtdRam INT NOT NULL,
	modelDisco VARCHAR(100) NOT NULL,
	qtdDisco INT NOT NULL,
	modelCpu VARCHAR(100) NOT NULL,
	qtdCpu INT NOT NULL,
	capacidadeProcesso VARCHAR(100) NOT NULL,
	fkDataCenter INT NOT NULL,
		CONSTRAINT fkServidorDataCenter
			FOREIGN KEY (fkDataCenter)
				REFERENCES dataCenter(idDataCenter),
	fkEmpresa INT NOT NULL,
		CONSTRAINT fkServidorEmpresa
			FOREIGN KEY (fkEmpresa)
				REFERENCES empresa(id)
);

CREATE TABLE registroServidor (
	idRegistroServidor INT AUTO_INCREMENT,
	fkServidor INT NOT NULL,
		CONSTRAINT fkRegistroServidor
			FOREIGN KEY (fkServidor)
				REFERENCES servidor(idServidores),
		PRIMARY KEY (idregistroServidor, fkServidor),
	dia DATE NOT NULL,
	hora TIME NOT NULL,
	ramPorcentagem INT NOT NULL,
	discoPorcentagem INT NOT NULL,
	cpuPorcentagem INT NOT NULL
);

INSERT INTO empresa VALUES
	(DEFAULT, 'Steam Inc.', '85952212605234');
    
INSERT INTO usuario VALUES
	(333, 1, 'Rogério Ragozzini', 'ragozzini@gmail.com', '12345678901', 'roro', NULL);