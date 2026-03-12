const API_URL = 'https://dylan-even-variable-lying.trycloudflare.com';

// --- CONTROLE DE NAVEGAÇÃO ---
function mostrarTela(idTela) {
    // 1. Esconde todas as seções
    const telas = document.querySelectorAll('.tela-sistema');
    telas.forEach(tela => tela.style.display = 'none');
    
    // 2. Mostra a tela desejada
    const telaAlvo = document.getElementById(idTela);
    if (telaAlvo) {
        telaAlvo.style.display = 'block';
    }

    // 3. Controle do Menu (Só aparece se não for a tela de login)
    const menu = document.getElementById('menu-principal');
    if (menu) {
        if (idTela === 'tela-login') {
            menu.style.display = 'none';
        } else {
            menu.style.display = 'flex';
        }
    }
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('usuarioLogado');
    
    if (user) {
        mostrarTela('tela-dashboard');
    } else {
        mostrarTela('tela-login');
    }

    // Configura cliques dos botões do Menu
    document.getElementById('nav-dashboard')?.addEventListener('click', () => mostrarTela('tela-dashboard'));
    document.getElementById('nav-historico')?.addEventListener('click', () => {
        mostrarTela('tela-historico');
        carregarHistorico();
    });
    document.getElementById('nav-perfil')?.addEventListener('click', () => mostrarTela('tela-perfil'));
    document.getElementById('nav-sair')?.addEventListener('click', fazerLogout);
});

// --- FUNÇÕES DE LÓGICA ---

async function fazerLogin() {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    if (!usuario || !senha) return alert("Preencha todos os campos!");

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, senha })
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
            alert('Bem-vindo, ' + data.user.usuario);
            mostrarTela('tela-dashboard');
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor no Termux.');
    }
}

async function enviarLeitura() {
    const valor = document.getElementById('valorLeitura').value;
    const userJson = localStorage.getItem('usuarioLogado');

    if (!valor || !userJson) return alert('Insira um valor válido!');
    const user = JSON.parse(userJson);

    try {
        const response = await fetch(`${API_URL}/leitura`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuarioId: user.id,
                valorLeitura: valor,
                data: new Date().toLocaleDateString('pt-BR')
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Leitura salva com sucesso!');
            document.getElementById('valorLeitura').value = '';
        }
    } catch (error) {
        alert('Erro ao salvar no servidor.');
    }
}

async function carregarHistorico() {
    const userJson = localStorage.getItem('usuarioLogado');
    const lista = document.getElementById('listaHistorico');
    
    if (!userJson || !lista) return;
    const user = JSON.parse(userJson);
    
    lista.innerHTML = "<p>Carregando...</p>";

    try {
        const response = await fetch(`${API_URL}/historico/${user.id}`);
        const dados = await response.json();
        
        if (dados.length === 0) {
            lista.innerHTML = "<p>Nenhuma leitura encontrada.</p>";
            return;
        }

        lista.innerHTML = dados.map(item => `
            <div>
                <p><strong>📅 Data:</strong> ${item.data}</p>
                <p><strong>💧 Consumo:</strong> ${item.valorLeitura} m³</p>
            </div>
        `).join('');
    } catch (error) {
        lista.innerHTML = "<p>Erro ao carregar dados do servidor.</p>";
    }
}

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    mostrarTela('tela-login');
}
