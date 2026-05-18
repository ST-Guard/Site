window.onload = () => {
    buscarDados()
    mostrarServidores()
}

function fnNavegar(caminho){
    window.location.href = caminho
}

// if (!sessionStorage.ID_USUARIO) {
//     conteiner_msg.innerHTML = "Você precisa estar logado!"
//     loadingModal()
//     window.location = "login.html";
// }

let idDataCenterSelecionado = null;

function buscarDados() {
    const idUsuario = sessionStorage.ID_USUARIO
    
    fetch(`/sessao/buscarUsuario/${idUsuario}`, {
    })
      .then(function (resposta) {
        return resposta.json();
    })
    .then(function (dados) {
        dados = dados[0]

        console.log(dados)
        username.innerHTML = dados.nomePessoa
        cargoname.innerHTML = dados.cargo
        // zonaTitulo.innerHTML = dados.nomeZona
        dataCenterTitulo.innerHTML = dados.nomeDataCenter
        if (dados.imagem) {
            imagemPerfilCima.src = `/assets/imgsBd/${dados.imagem}`
        } else {
            imagemPerfilCima.src = "../assets/dashConfig/usuario.png"
        }
    })
}

function fecharComponente() {
    boxComponente.style.display = "none"
    idServidorSelecionado = null;
}

function fecharCadastro() {
    boxCadastro.style.display = "none"
}

function cadastrarAbrir() {
    boxCadastro.style.display = "flex"
    carregarDatabases()
}

function voltarServidor() {
    boxCadastroServidor.style.display = "flex"
    boxCadastroCpu.style.display = "none"
}

function voltarCpu() {
    boxCadastroCpu.style.display = "flex"
    boxCadastroRam.style.display = "none"
}

function voltarRam() {
    boxCadastroCpu.style.display = "flex"
    boxCadastroRam.style.display = "none"
}

function voltarDisco() {
    boxCadastroRam.style.display = "flex"
    boxCadastroDisco.style.display = "none"
}

function voltarRede() {
    boxCadastroDisco.style.display = "flex"
    boxCadastroRede.style.display = "none"
}

function continuarCpu() {
    boxCadastroServidor.style.display = "none"
    boxCadastroCpu.style.display = "flex"
}

function continuarRam() {
    boxCadastroCpu.style.display = "none"
    boxCadastroRam.style.display = "flex"
}

function continuarDisco() {
    boxCadastroRam.style.display = "none"
    boxCadastroDisco.style.display = "flex"
}

function continuarRede() {
    boxCadastroDisco.style.display = "none"
    boxCadastroRede.style.display = "flex"
}

function verificar() {
    const nomeServidor = nomeServ.value.trim();
    const tipoServidor = tipoServ.value.trim();
    const estadoServidor = document.getElementById("estadoServidor").value;
    const database = document.getElementById("selectDataBase").value;
    const zona = document.getElementById("zonaServidor").value;

    const capCpu = document.getElementById("capCpu").value;
    const capRam = document.getElementById("capRam").value;
    const capDisco = document.getElementById("capDisco").value;
    const capRede = document.getElementById("capRede").value;

    if (!nomeServidor) {
        conteiner_msg.innerHTML = "Nome do servidor inválido!"
        loadingModal()
    } else if (!tipoServidor) {
        conteiner_msg.innerHTML = "Tipo de servidor inválido!"
        loadingModal()
    } else if (estadoServidor == "Selecione") {
        conteiner_msg.innerHTML = "Selecione um estado de servidor!"
        loadingModal()
    } else if (zona == "Selecione a zona"|| database == "Selecione um DataCenter") {
        conteiner_msg.innerHTML = "Selecione um datacenter e zona!"
        loadingModal()
    } else if (!capCpu || !capRam || !capDisco || !capRede) {
        conteiner_msg.innerHTML = "Tipo de capacidade inválida!"
        loadingModal()
    } else if (capCpu <= 20 || capRam <= 20 || capDisco <= 20 || capRede <= 10) {
        conteiner_msg.innerHTML = "Tipo de capacidade inválida!"
        loadingModal()
    } else {
        cadastrarServidor()
    }
}

function carregarDatabases() {
    const fkEmpresa = sessionStorage.FK_EMPRESA;

    fetch(`/servidor/carregarDatabases/${fkEmpresa}`)
        .then(resposta => resposta.json())
        .then(lista => {
            const selectDatabase = document.getElementById("selectDataBase");
            selectDatabase.innerHTML = `<option disabled selected>Selecione um datacenter</option>`;

            for (let i = 0; i < lista.length; i++) {
                selectDatabase.innerHTML += `
                    <option value="${lista[i].idDataCenter}">
                        ${lista[i].nome}
                    </option>
                `;
            }

            selectDatabase.addEventListener('change', function () {
                idDataCenterSelecionado = document.getElementById("selectDataBase").value;
                console.log('DataCenter selecionado:', idDataCenterSelecionado);
            });
        })
        .catch(erro => console.log(erro));
}

function adicionarComponente() {

    const modal = document.getElementById("modalComponente");
    const idServidor = idServidorSelecionado;
    const nome = document.getElementById("nomeCompoBox").value.trim();
    const tipo = document.getElementById("tipoCompoBox").value;
    const unidade = document.getElementById("unidCompoBox").value;
    const capacidadeInput = document.getElementById("capCompoBox").value;

    if (!nome || !tipo || !unidade || !capacidadeInput) {
        conteiner_msg.innerHTML = "Preencha todos os campos!"
        loadingModal()
        return;
    }
    const capacidade = Number(capacidadeInput);

    fetch("/servidor/adicionarComponente", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fkServidor: idServidor,
            nome,
            tipo,
            unidade,
            capacidade
        })
    })
        .then(async res => {

            const data = await res.json();
            if (!res.ok) {
                throw data.message || "Erro ao cadastrar componente";
            }
            conteiner_msg.innerHTML = "Componente adicionado com sucesso!"
            loadingModal()
            fecharComponente();
            mostrarServidores();
        })
        .catch(err => {
            console.error(err);
            alert(err);
        });
}

function carregarDatabases() {
    const fkEmpresa = sessionStorage.FK_EMPRESA;

    fetch(`/servidor/carregarDatabases/${fkEmpresa}`)
        .then(resposta => resposta.json())
        .then(lista => {
            const selectDatabase = document.getElementById("selectDataBase");
            selectDatabase.innerHTML = `<option disabled selected>Selecione um datacenter</option>`;

            for (let i = 0; i < lista.length; i++) {
                selectDatabase.innerHTML += `
                    <option value="${lista[i].idDataCenter}">
                        ${lista[i].nome}
                    </option>
                `;
            }

            selectDatabase.addEventListener('change', function () {
                idDataCenterSelecionado = document.getElementById("selectDataBase").value;
                console.log('DataCenter selecionado:', idDataCenterSelecionado);
            });
        })
        .catch(erro => console.log(erro));
}

function mostrarServidores() {

    var idEmpresa = sessionStorage.FK_EMPRESA;

    fetch(`/servidor/listarServidores/${idEmpresa}`)
        .then(res => res.json())
        .then(servidores => {
            console.log("SERVIDORES:", servidores);
            boxServidores.innerHTML = "";
            var mensagem = "";
            for (var i = 0; i < servidores.length; i++) {
                mensagem += `
                <div class="servidor">
                    <div class="inicioServidor">
                        <img src="../assets/dashboard-servidor/IconServidor.png">
                        <h3>${servidores[i].nome}</h3>
                        <div class="estadoServidor">
                            ${servidores[i].estado}
                        </div>
                    </div>

                    <div class="gridCompo" id="gridCompo${servidores[i].idServidor}">
                        <div class="boxCpu">
                            <div class="inicioCpu">
                                <img src="../assets/dashboard-servidor/iconCpu.png">
                                <span>CPU USO TOTAL</span>
                                <span class="infoSistema">8 nucleos</span>
                            </div>
                            <div class="porcentagemCpu">
                                <h2 id="cpuValor${servidores[i].idServidor}"></h2>
                                <span>%</span>
                            </div>
                            <div class="barraCpu">
                                <div class="barraPreenchimentoCpu" id="cpuBarra${servidores[i].idServidor}"></div>
                            </div>
                            <div class="porcentagemLadoCpu">
                                <div class="usuarioPorcentagem">
                                    <img src="../assets/dashboard-servidor/user.png" alt="">
                                    <span id="cpuUso${servidores[i].idServidor}">Usuario </span>
                                </div>
                                <div class="configPorcentagem">
                                    <img src="../assets/dashboard-servidor/iconConfig.jpg" alt="">
                                    <span id="cpuLivre${servidores[i].idServidor}">Sistema </span>
                                </div>
                            </div>
                        </div>
                        <div class="boxRam">
                            <div class="inicioRam">
                                <img src="../assets/dashboard-servidor/iconRam.png">
                                <span>RAM - ${servidores[i].limiteRam} GB</span>
                                <span class="infoSistema">GB</span>
                            </div>
                            <div class="porcentagemRam">
                                <h2 id="ramValor${servidores[i].idServidor}"></h2>
                                <span>GB</span>
                            </div>
                            <div class="barraRam">
                                <div class="barraPreenchimentoRam" id="ramBarra${servidores[i].idServidor}"></div>
                            </div>
                            <div class="porcentagemLadoRam">
                                <div class="usuarioPorcentagem">
                                    <img src="../assets/dashboard-servidor/iconBd.png" alt="">
                                    <span id="ramUso${servidores[i].idServidor}">Em cache </span>
                                </div>
                                <div class="configPorcentagem">
                                    <img src="../assets/dashboard-servidor/iconCheck.png" alt="">
                                    <span id="ramLivre${servidores[i].idServidor}">Livre </span>
                                </div>
                            </div>
                        </div>
                        <div class="boxDisco">
                            <div class="inicioDisco">
                                <img src="../assets/dashboard-servidor/iconCache.png">
                                <span>DISCO - ${servidores[i].limiteDisco} GB</span>
                                <span class="infoSistema">GB</span>
                            </div>
                            <div class="porcentagemDisco">
                                <h2 id="discoValor${servidores[i].idServidor}"></h2>
                                <span>GB</span>
                            </div>
                            <div class="barraDisco">
                                <div class="barraPreenchimentoDisco" id="discoBarra${servidores[i].idServidor}"></div>
                            </div>
                            <div class="porcentagemLadoDisco">
                                <div class="usuarioPorcentagem">
                                    <img src="../assets/dashboard-servidor/iconFolder.png" alt="">
                                    <span id="discoUso${servidores[i].idServidor}">Em uso </span>
                                </div>
                                <div class="configPorcentagem">
                                    <img src="../assets/dashboard-servidor/iconFolder.png" alt="">
                                    <span id="discoLivre${servidores[i].idServidor}">Livre </span>
                                </div>
                            </div>
                        </div>
                        <div class="boxRede">
                            <div class="inicioRede">
                                <img src="../assets/dashboard-servidor/iconWeb.png">
                                <span>REDE - ${servidores[i].limiteRede}</span>
                                <span class="infoSistema">ms</span>
                            </div>
                            <div class="porcentagemRede">
                                <h2 id="redeValor${servidores[i].idServidor}"></h2>
                                <span>ms</span>
                            </div>
                            <div class="barraRede">
                                <div class="barraPreenchimentoRede" id="redeBarra${servidores[i].idServidor}"></div>
                            </div>
                            <div class="porcentagemLadoDisco">
                                <div class="usuarioPorcentagem">
                                    <img src="../assets/dashboard-servidor/iconRede.png" alt="">
                                    <span id="redeUso${servidores[i].idServidor}">Em uso </span>
                                </div>
                                <div class="configPorcentagem">
                                    <img src="../assets/dashboard-servidor/iconPerda.png" alt="">
                                    <span id="redeLivre${servidores[i].idServidor}">Livre </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }

            boxServidores.innerHTML = mensagem;

            let totalServidor = 0
            let somaCpu = []
            let somaRam = []
            let somaDisco = []
            let somaRede = []

            for (let i = 0; i < servidores.length; i++) {
                const idServidor = servidores[i].idServidor

                const cpuValorPrincipal = document.getElementById("cpuValorPrincipal");
                const cpuUsoPrincipal = document.getElementById("cpuUsoPrincipal");
                const cpuLivrePrincipal = document.getElementById("cpuLivrePrincipal");
                const barraCpuPrincipal = document.getElementById("cpuBarraPrincipal");
                
                const ramValorPrincipal = document.getElementById("ramValorPrincipal");
                const ramUsoPrincipal = document.getElementById("ramUsoPrincipal");
                const ramLivrePrincipal = document.getElementById("ramLivrePrincipal");
                const barraRamPrincipal = document.getElementById("ramBarraPrincipal");

                const discoValorPrincipal = document.getElementById("discoValorPrincipal");
                const discoUsoPrincipal = document.getElementById("discoUsoPrincipal");
                const discoLivrePrincipal = document.getElementById("discoLivrePrincipal");
                const barraDiscoPrincipal = document.getElementById("discoBarraPrincipal");

                const redeValorPrincipal = document.getElementById("redeValorPrincipal");
                const redeUsoPrincipal = document.getElementById("redeUsoPrincipal");
                const redeLivrePrincipal = document.getElementById("redeLivrePrincipal");
                const barraRedePrincipal = document.getElementById("redeBarraPrincipal");

                cpuUsoPrincipal.innerHTML = 95.7
                cpuValorPrincipal.innerHTML = 95.7
                cpuLivrePrincipal.innerHTML = 4.3
                barraCpuPrincipal.style.width = 95.7 + "%";
                barraCpuPrincipal.style.backgroundColor = "#810606"

                ramUsoPrincipal.innerHTML = 65.3
                ramValorPrincipal.innerHTML = 65.3
                ramLivrePrincipal.innerHTML = 34.7
                barraRamPrincipal.style.width = 65.3 + "%"
                barraRamPrincipal.style.backgroundColor = "#f28647"

                discoUsoPrincipal.innerHTML = 14.1
                discoValorPrincipal.innerHTML = 14.1
                discoLivrePrincipal.innerHTML = 85.9
                barraDiscoPrincipal.style.width = 14.1 + "%"

                redeUsoPrincipal.innerHTML = 20
                redeValorPrincipal.innerHTML = 20
                redeLivrePrincipal.innerHTML = 30
                barraRedePrincipal.style.width = 20 + "%"
                
                const cpuValor = document.getElementById("cpuValor" + idServidor);
                const cpuUso = document.getElementById("cpuUso" + idServidor);
                const cpuLivre = document.getElementById("cpuLivre" + idServidor);
                const barraCpu = document.getElementById("cpuBarra" + idServidor);

                const ramValor = document.getElementById("ramValor" + idServidor);
                const ramUso = document.getElementById("ramUso" + idServidor);
                const ramLivre = document.getElementById("ramLivre" + idServidor);
                const barraRam = document.getElementById("ramBarra" + idServidor);

                const discoValor = document.getElementById("discoValor" + idServidor);
                const discoUso = document.getElementById("discoUso" + idServidor);
                const discoLivre = document.getElementById("discoLivre" + idServidor);
                const barraDisco = document.getElementById("discoBarra" + idServidor);

                const redeValor = document.getElementById("redeValor" + idServidor);
                const redeUso = document.getElementById("redeUso" + idServidor);
                const redeLivre = document.getElementById("redeLivre" + idServidor);
                const barraRede = document.getElementById("redeBarra" + idServidor);

                const aleatorioCpu = gerarPorcentagem()
                const aleatorioRam = gerarRam()
                const aleatorioDisco = gerarArmazenamento()
                const aleatorioRede = gerarRede()

                const ramPorcentagem = (aleatorioRam / servidores[i].limiteRam) * 100
                const discoPorcentagem = (aleatorioDisco / servidores[i].limiteDisco) * 100
                const redePorcentagem = (aleatorioRede / servidores[i].limiteRede) * 100

                const cpuUsoValor = 100 - aleatorioCpu
                const ramUsoValor = servidores[i].limiteRam - aleatorioRam
                const discoUsoValor = servidores[i].limiteDisco - aleatorioDisco
                const redeUsoValor = servidores[i].limiteRede - aleatorioRede

                totalServidor += 1
                somaCpu.push(aleatorioCpu)
                somaRam.push(ramPorcentagem)
                somaDisco.push(redePorcentagem)
                somaRede.push(aleatorioRede)

                cpuUso.innerHTML = `Em Uso ${aleatorioCpu}%`
                cpuLivre.innerHTML = `Sobrando ${cpuUsoValor}%`

                ramUso.innerHTML = `Em cache ${aleatorioRam} GB`
                ramLivre.innerHTML = `Livre ${ramUsoValor} GB`

                discoUso.innerHTML = `Em cache ${aleatorioDisco} GB`
                discoLivre.innerHTML = `Livre ${discoUsoValor} GB`

                redeUso.innerHTML = `Atual ${aleatorioRede} Ms`
                redeLivre.innerHTML = `Até perigo ${redeUsoValor} Ms`

                cpuValor.innerHTML = aleatorioCpu
                ramValor.innerHTML = aleatorioRam
                discoValor.innerHTML = aleatorioDisco
                redeValor.innerHTML = aleatorioRede

                barraCpu.style.width = aleatorioCpu + "%";
                barraRam.style.width = ramPorcentagem + "%";
                barraDisco.style.width = discoPorcentagem + "%";
                barraRede.style.width = redePorcentagem + "%";

                if (aleatorioCpu >= 85) {
                    barraCpu.style.backgroundColor = "#810606"
                } else if (aleatorioCpu >= 65) {
                    barraCpu.style.backgroundColor = "#f28647"
                }

                if (ramPorcentagem >= 85) {
                    barraRam.style.backgroundColor = "#810606"
                } else if (ramPorcentagem >= 65) {
                    barraRam.style.backgroundColor = "#f28647"
                }

                if (discoPorcentagem >= 85) {
                    barraDisco.style.backgroundColor = "#810606"
                } else if (discoPorcentagem >= 65) {
                    barraDisco.style.backgroundColor = "#f28647"
                }

                if (redePorcentagem >= 85) {
                    barraRede.style.backgroundColor = "#810606"
                } else if (redePorcentagem >= 65) {
                    barraRede.style.backgroundColor = "#f28647"
                }

                function gerarPorcentagem() {
                    return Math.floor(Math.random() * (servidores[i].limiteCpu - 10)) + 1;
                }

                function gerarRam() {
                    return Math.floor(Math.random() * (servidores[i].limiteRam - 2)) + 1;
                }

                function gerarArmazenamento() {
                    return Math.floor(Math.random() * (servidores[i].limiteDisco - 25)) + 1;
                }

                function gerarRede() {
                    return Math.floor(Math.random() * (servidores[i].limiteRede - 10)) + 1;
                }
            }

            totalServidor += 1
            somaCpu.push(95.7)
            somaDisco.push(14.1)
            somaRam.push(65.3)
            somaRede.push(20)

            const qtdServidores = document.getElementById("qtdServidores");
            const kpiP99Cpu = document.getElementById("kpiP99Cpu");
            const kpiP99Ram = document.getElementById("kpiP99Ram");
            const kpiP99Disco = document.getElementById("kpiP99Disco");
            const kpiP99Rede = document.getElementById("kpiP99Rede");

            const ordenadoCpu = [...somaCpu].sort((a, b) => a - b);
            const P99Cpu = ordenadoCpu[Math.floor(ordenadoCpu.length * 0.99)];
            const ordenadoRam = [...somaRam].sort((a, b) => a - b);
            const P99Ram = ordenadoRam[Math.floor(ordenadoRam.length * 0.99)];
            const ordenadoDisco = [...somaDisco].sort((a, b) => a - b);
            const P99Disco = ordenadoDisco[Math.floor(ordenadoDisco.length * 0.99)];
            const ordenadoRede = [...somaRede].sort((a, b) => a - b);
            const P99Rede = ordenadoRede[Math.floor(ordenadoRede.length * 0.99)];

            qtdServidores.innerHTML = totalServidor
            kpiP99Cpu.innerHTML = P99Cpu.toFixed(1) + "%"
            kpiP99Ram.innerHTML = P99Ram.toFixed(1) + "%"
            kpiP99Disco.innerHTML = P99Disco.toFixed(1) + "%"
            kpiP99Rede.innerHTML = P99Rede.toFixed(1)

            if (P99Cpu >= 75) {
                document.querySelector('#container_kpis .kpi3').style.borderColor = '#FF5252';
                document.querySelector('#container_kpis .kpi3 h1').style.color = '#FF5252';
                document.querySelector('#container_kpis .kpi3').style.boxShadow = `1.5px 1px 2px 1px #FF5252, 0 4px 12px rgba(0,0,0,0.1)`;
                imgKpi3.src = "../assets/dashboard-icons/icon_alerta.svg"
            } else if (P99Cpu >= 60) {
                document.querySelector('#container_kpis .kpi3').style.borderColor = '#F5CC4D';
                document.querySelector('#container_kpis .kpi3 h1').style.color = '#F5CC4D';
                document.querySelector('#container_kpis .kpi3').style.boxShadow = `1.5px 1px 2px 1px #F5CC4D, 0 4px 12px rgba(0,0,0,0.1)`;
                imgKpi3.src = "../assets/dashboard-icons/icon_atencao.svg"
            } else {
                document.querySelector('#container_kpis .kpi3').style.borderColor = '#23B26D';
                document.querySelector('#container_kpis .kpi3 h1').style.color = '#23B26D';
                document.querySelector('#container_kpis .kpi3').style.boxShadow = `1.5px 1px 2px 1px #23B26D, 0 4px 12px rgba(0,0,0,0.1)`;
                imgKpi3.src = "../assets/dashboard-icons/icon_Check.svg"
            }

            if (P99Ram >= 75) {
                document.querySelector('#container_kpis .kpi2').style.borderColor = '#FF5252';
                document.querySelector('#container_kpis .kpi2 h1').style.color = '#FF5252';
                document.querySelector('#container_kpis .kpi2').style.boxShadow = `1.5px 1px 2px 1px #FF5252, 0 4px 12px rgba(0,0,0,0.1)`;
                imgKpi2.src = "../assets/dashboard-icons/icon_Alerta.svg"
            } else if (P99Ram >= 60) {
                document.querySelector('#container_kpis .kpi2').style.borderColor = '#F5CC4D';
                document.querySelector('#container_kpis .kpi2 h1').style.color = '#F5CC4D';
                document.querySelector('#container_kpis .kpi2').style.boxShadow = `1.5px 1px 2px 1px #F5CC4D, 0 4px 12px rgba(0,0,0,0.1)`;   
                imgKpi2.src = "../assets/dashboard-icons/icon_Atencao.svg"        
            } else {
                document.querySelector('#container_kpis .kpi2').style.borderColor = '#23B26D';
                document.querySelector('#container_kpis .kpi2 h1').style.color = '#23B26D';
                document.querySelector('#container_kpis .kpi2').style.boxShadow = `1.5px 1px 2px 1px #23B26D, 0 4px 12px rgba(0,0,0,0.1)`;
                imgKpi2.src = "../assets/dashboard-icons/icon_Check.svg"
            }

            if (P99Disco >= 75) {
                document.querySelector('#container_kpis .kpi4').style.borderColor = '#FF5252';
                document.querySelector('#container_kpis .kpi4 h1').style.color = '#FF5252';
                document.querySelector('#container_kpis .kpi4').style.boxShadow = `1.5px 1px 2px 1px #FF5252, 0 4px 12px rgba(0,0,0,0.1)`;
                imgKpi4.src = "../assets/dashboard-icons/icon_alerta.svg"
            } else if (P99Disco >= 60) {
                document.querySelector('#container_kpis .kpi4').style.borderColor = '#F5CC4D';
                document.querySelector('#container_kpis .kpi4 h1').style.color = '#F5CC4D';
                document.querySelector('#container_kpis .kpi4').style.boxShadow = `1.5px 1px 2px 1px #F5CC4D, 0 4px 12px rgba(0,0,0,0.1)`;
                imgKpi4.src = "../assets/dashboard-icons/icon_Atencao.svg"        
            } else {
                document.querySelector('#container_kpis .kpi4').style.borderColor = '#23B26D';
                document.querySelector('#container_kpis .kpi4 h1').style.color = '#23B26D';
                document.querySelector('#container_kpis .kpi4').style.boxShadow = `1.5px 1px 2px 1px #23B26D, 0 4px 12px rgba(0,0,0,0.1)`;
                imgKpi4.src = "../assets/dashboard-icons/icon_Check.svg"
            }

            if (P99Rede >= 35) {
                document.querySelector('#container_kpis .kpi5').style.borderColor = '#FF5252';
                document.querySelector('#container_kpis .kpi5 h1').style.color = '#FF5252';
                document.querySelector('#container_kpis .kpi5').style.boxShadow = `1.5px 1px 2px 1px #FF5252, 0 4px 12px rgba(0,0,0,0.1)`;
                imgKpi5.src = "../assets/dashboard-icons/icon_alerta.svg"
            } else if (P99Rede >= 30) {
                document.querySelector('#container_kpis .kpi5').style.borderColor = '#F5CC4D';
                document.querySelector('#container_kpis .kpi5 h1').style.color = '#F5CC4D';
                document.querySelector('#container_kpis .kpi5').style.boxShadow = `1.5px 1px 2px 1px #F5CC4D, 0 4px 12px rgba(0,0,0,0.1)`;     
                imgKpi5.src = "../assets/dashboard-icons/icon_atencao.svg"     
            } else {
                document.querySelector('#container_kpis .kpi5').style.borderColor = '#23B26D';
                document.querySelector('#container_kpis .kpi5 h1').style.color = '#23B26D';
                document.querySelector('#container_kpis .kpi5').style.boxShadow = `1.5px 1px 2px 1px #23B26D, 0 4px 12px rgba(0,0,0,0.1)`;
                imgKpi5.src = "../assets/dashboard-icons/icon_Check.svg"
            }

            // for (var i = 0; i < servidores.length; i++) {
            //     carregarComponentes(servidores[i].idServidor);
            // }
        });
}

function cadastrarServidor() {

    const nomeServidor = nomeServ.value;
    const tipoServidor = tipoServ.value;
    const estadoServidor = document.getElementById("estadoServidor").value;
    const idZona = document.getElementById("zonaServidor").value;

    const componentes = [
        {
            nome: "CPU",
            tipo: "Processador",
            unidade: "%",
            capacidade: Number(capCpu.value)
        },
        {
            nome: "RAM",
            tipo: "Memoria",
            unidade: "GB",
            capacidade: Number(capRam.value)
        },
        {
            nome: "Disco",
            tipo: "Armazenamento",
            unidade: "GB",
            capacidade: Number(capDisco.value)
        },
        {
            nome: "Rede",
            tipo: "Latencia",
            unidade: "ms",
            capacidade: Number(capRede.value)
        }
    ];

    fetch("/servidor/cadastrarServ", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nomeServ: nomeServidor,
            tipoServ: tipoServidor,
            estadoServ: estadoServidor,
            fkDataCenter: idDataCenterSelecionado,
            fkZona: idZona,
            componentes: componentes
        })
    })
        .then(res => {
            if (res.ok) {
                conteiner_msg.innerHTML = "Servidor cadastrado com sucesso!"
                loadingModal()
                location.reload();
            } else {
                throw "Erro ao cadastrar";
            }
        })
        .catch(err => console.log(err));
}

function carregarZonas() {

    if (!idDataCenterSelecionado) {
        conteiner_msg.innerHTML = "Selecione um dataCenter primeiro!"
        loadingModal()
        return;
    }

    zonaSpan.style.display = "flex"
    zonaServidor.style.display = "flex"
    console.log(idDataCenterSelecionado)

    fetch(`/servidor/carregarZonas/${idDataCenterSelecionado}`)
        .then(resposta => resposta.json())
        .then(lista => {
            const selectZona = document.getElementById("zonaServidor");
            selectZona.style.display = 'flex';
            selectZona.innerHTML = `<option disabled selected>Selecione a zona</option>`;

            for (let i = 0; i < lista.length; i++) {
                selectZona.innerHTML += `
                    <option value="${lista[i].idZona}">
                        ${lista[i].nome}
                    </option>
                `;
            }

            document.getElementById("zonaSpan").style.display = 'flex';
        })
        .catch(erro => console.log(erro));
}

function carregarComponentes(idServidor) {

    cpu = []
    disco = []
    ram = []

    fetch(`/servidor/listarComponentes/${idServidor}`)
        .then(res => res.json())
        .then(componentes => {

            var grid = document.getElementById(`gridCompo${idServidor}`);

            var html = "";

            for (var i = 0; i < componentes.length; i++) {
                html += `<p>${componentes[i].nome}</p>`;
            }

            grid.innerHTML = html;
        });
}

function limparSessao() {
    sessionStorage.clear();
}


//  Usar quando for puxar os dados, e arrumar o carregar componentes, sem funcionar por agora -->
//     function mostrarServidores() {

//         var idEmpresa = sessionStorage.FK_EMPRESA;

//         fetch(`/servidor/listarServidores/${idEmpresa}`)
//             .then(res => res.json())
//             .then(servidores => {
//                 console.log("SERVIDORES:", servidores);

//                 var box = document.getElementById("boxServidores");
//                 box.innerHTML = "";

//                 var mensagem = "";

//                 for (var i = 0; i < servidores.length; i++) {

//                     mensagem += `
//                     <div class="servidor">
//                         <div class="inicioServidor">
//                             <img src="../assets/dashboard-servidor/IconServidor.png">
//                             <h3>${servidores[i].nome}</h3>
//                             <div class="estadoServidor">
//                                 ${servidores[i].estado}
//                             </div>
//                         </div>

//                         <div class="gridCompo" id="gridCompo${servidores[i].idServidor}">
//                             <div class="boxCpu">
//                                 <div class="inicioCpu">
//                                     <img src="../assets/dashboard-servidor/iconCpu.png">
//                                     <span>CPU</span>
//                                     <span class="infoSistema">%</span>
//                                 </div>
//                                 <div class="porcentagemCpu">
//                                     <h2 id="cpuValor${servidores[i].idServidor}">--</h2>
//                                     <span>%</span>
//                                 </div>
//                                 <div class="barraCpu">
//                                     <div class="barraPreenchimentoCpu" id="cpuBarra${servidores[i].idServidor}"></div>
//                                 </div>
//                             </div>
//                             <div class="boxRam">
//                                 <div class="inicioRam">
//                                     <img src="../assets/dashboard-servidor/iconRam.png">
//                                     <span>RAM</span>
//                                     <span class="infoSistema">GB</span>
//                                 </div>
//                                 <div class="porcentagemRam">
//                                     <h2 id="ramValor${servidores[i].idServidor}">--</h2>
//                                     <span>GB</span>
//                                 </div>
//                                 <div class="barraRam">
//                                     <div class="barraPreenchimentoRam" id="ramBarra${servidores[i].idServidor}"></div>
//                                 </div>
//                             </div>
//                             <div class="boxDisco">
//                                 <div class="inicioDisco">
//                                     <img src="../assets/dashboard-servidor/iconCache.png">
//                                     <span>DISCO</span>
//                                     <span class="infoSistema">GB</span>
//                                 </div>
//                                 <div class="porcentagemDisco">
//                                     <h2 id="discoValor${servidores[i].idServidor}">--</h2>
//                                     <span>GB</span>
//                                 </div>
//                                 <div class="barraDisco">
//                                     <div class="barraPreenchimentoDisco" id="discoBarra${servidores[i].idServidor}"></div>
//                                 </div>
//                             </div>
//                             <div class="boxRede">
//                                 <div class="inicioRede">
//                                     <img src="../assets/dashboard-servidor/iconWeb.png">
//                                     <span>REDE - LATÊNCIA</span>
//                                     <span class="infoSistema">ms</span>
//                                 </div>
//                                 <div class="porcentagemRede">
//                                     <h2 id="redeValor${servidores[i].idServidor}">--</h2>
//                                     <span>ms</span>
//                                 </div>
//                                 <div class="barraRede">
//                                     <div class="barraPreenchimentoRede" id="redeBarra${servidores[i].idServidor}"></div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     `;
//                 }

//                 boxServidores.innerHTML = mensagem;

            for (var i = 0; i < servidores.length; i++) {
                carregarComponentes(servidores[i].idServidor);
            }
//             });
//     }