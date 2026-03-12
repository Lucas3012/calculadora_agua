const express = require('express');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ROTA DE LOGIN
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    const user = db.findOne('usuarios', { usuario, senha });
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: "Usuário ou senha incorretos." });
    }
});

// ROTA DE CADASTRO
app.post('/cadastrar', (req, res) => {
    const { usuario, senha } = req.body;
    const existe = db.findOne('usuarios', { usuario });
    
    if (existe) {
        return res.status(400).json({ success: false, message: "Este usuário já existe." });
    }

    const novoUsuario = db.save('usuarios', { usuario, senha });
    res.json({ success: true, message: "Cadastro realizado!", user: novoUsuario });
});

// ROTA PARA SALVAR LEITURA
app.post('/leitura', (req, res) => {
    const { usuarioId, valorLeitura, data, dataISO } = req.body;
    const novaLeitura = db.save('leituras', { usuarioId, valorLeitura, data, dataISO });
    res.json({ success: true, data: novaLeitura });
});

// ROTA PARA BUSCAR HISTÓRICO
app.get('/historico/:usuarioId', (req, res) => {
    const { usuarioId } = req.params;
    const todas = db.findAll('leituras');
    const filtradas = todas.filter(l => l.usuarioId == usuarioId);
    res.json(filtradas);
});

app.listen(PORT, () => {
    console.log(`🚀 Lucas Omni rodando na porta ${PORT}`);
});
