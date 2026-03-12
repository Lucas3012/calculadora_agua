const express = require('express');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;

// Configurações
app.use(cors()); 
app.use(express.json());
// Agora servindo os arquivos da pasta principal
app.use(express.static(__dirname));

// Rotas
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    const user = db.findOne('usuarios', { usuario, senha });
    if (user) {
        res.json({ success: true, message: "Login realizado!", user });
    } else {
        res.status(401).json({ success: false, message: "Dados incorretos." });
    }
});

app.post('/leitura', (req, res) => {
    const { usuarioId, valorLeitura, data } = req.body;
    const novaLeitura = db.save('leituras', { usuarioId, valorLeitura, data });
    res.json({ success: true, data: novaLeitura });
});

app.get('/historico/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;
    const todas = db.findAll('leituras');
    const filtradas = todas.filter(l => l.usuarioId == usuarioId);
    res.json(filtradas);
});

app.listen(PORT, () => {
    console.log(`🚀 Lucas Omni rodando na porta ${PORT}`);
});
