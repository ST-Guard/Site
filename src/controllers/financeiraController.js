var financeiroModel = require("../models/pegarDadosFinanceiroModal");

function dadosFinanceira(req, res) {
    
    const bucket = req.body.bucket;
    financeiroModel.pegarDadosFinanceiro(bucket)
        .then(resultado => res.json(resultado))
        .catch(erro => {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
        
}


module.exports = {
    dadosFinanceira
}