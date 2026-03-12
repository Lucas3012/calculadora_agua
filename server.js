const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

app.post('/api/registro', async (req, res) => {
    const { email, senha } = req.body;
    const hash = await bcrypt.hash(senha, 10);
    const user = db.save('usuarios', { email, senha: hash, id_publico: Math.floor(1000 + Math.random() * 9000).toString() });
    res.json({ idPublico: user.id_publico });
});

app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;
    const user = db.findOne('usuarios', { email });
    if (user && await bcrypt.compare(senha, user.senha)) {
        const token = jwt.sign({ id: user.id }, "lucas_omni_2026");
        return res.json({ token, idPublico: user.id_publico });
    }
    res.status(401).json({ error: "Credenciais inválidas" });
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Lucas Omni rodando na porta ${server.address().port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log('⚠️ Porta 3000 ocupada, tentando 3001...');
        app.listen(3001);
    }
});

