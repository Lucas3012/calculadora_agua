const API_URL = 'https://albuquerque-islamic-maintains-spice.trycloudflare.com';

// Função de Login
async function fazerLogin() {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        const data = await response.json();

        if (data.success) {
            alert('Bem-vindo, ' + data.user.usuario);
            localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor no Termux.');
    }
}

// Função para Enviar Leitura
async function enviarLeitura() {
    const valor = document.getElementById('valorLeitura').value;
    const user = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (!valor || !user) return alert('Preencha os dados!');

    try {
        const response = await fetch(`${API_URL}/leitura`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: user.id,
                valorLeitura: valor,
                data: new Date().toLocaleDateString()
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Leitura salva com sucesso!');
            carregarHistorico();
        }
    } catch (error) {
        alert('Erro ao salvar no servidor.');
    }
}

// Função para Carregar Histórico
async function carregarHistorico() {
    const user = JSON.parse(localStorage.getItem('usuarioLogado'));
    const lista = document.getElementById('listaHistorico');
    
    try {
        const response = await fetch(`${API_URL}/historico/${user.id}`);
        const dados = await response.json();
        
        lista.innerHTML = dados.map(item => `
            <div class="card-leitura">
                <p>Data: ${item.data}</p>
                <p>Consumo: <strong>${item.valorLeitura} m³</strong></p>
            </div>
        `).join('');
    } catch (error) {
        console.log('Erro ao carregar histórico');
    }
}
