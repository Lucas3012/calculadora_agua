const API_URL = 'https://flux-kept-critics-troy.trycloudflare.com';
const TARIFA_POR_M3 = 6.50; 
let meuGrafico = null;

function mostrarTela(idTela) {
    document.querySelectorAll('.tela-sistema').forEach(t => t.style.display = 'none');
    const alvo = document.getElementById(idTela);
    if (alvo) alvo.style.display = 'flex';

    const menu = document.getElementById('menu-principal');
    if (idTela === 'tela-login') {
        menu.classList.add('menu-invisivel');
    } else {
        menu.classList.remove('menu-invisivel');
        menu.style.display = 'flex';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('usuarioLogado');
    user ? mostrarTela('tela-dashboard') : mostrarTela('tela-login');

    document.getElementById('nav-dashboard').onclick = () => mostrarTela('tela-dashboard');
    document.getElementById('nav-historico').onclick = () => { mostrarTela('tela-historico'); carregarHistorico(); };
    document.getElementById('nav-perfil').onclick = () => mostrarTela('tela-perfil');
    document.getElementById('nav-sair').onclick = fazerLogout;
});

async function fazerLogin() {
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({usuario, senha})
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem('usuarioLogado', JSON.stringify(data.user));
            Swal.fire({icon:'success', title:'Bem-vindo!', showConfirmButton:false, timer:1500});
            mostrarTela('tela-dashboard');
        } else {
            Swal.fire('Erro', 'Dados inválidos', 'error');
        }
    } catch (e) { Swal.fire('Erro', 'Servidor Offline', 'error'); }
}

async function enviarLeitura() {
    const valor = document.getElementById('valorLeitura').value;
    const user = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!valor) return Swal.fire('Aviso', 'Digite o valor', 'info');

    try {
        await fetch(`${API_URL}/leitura`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({usuarioId: user.id, valorLeitura: parseFloat(valor), data: new Date().toLocaleDateString('pt-BR')})
        });
        Swal.fire('Sucesso', 'Leitura salva!', 'success');
        document.getElementById('valorLeitura').value = '';
    } catch (e) { Swal.fire('Erro', 'Falha ao salvar', 'error'); }
}

async function carregarHistorico() {
    const user = JSON.parse(localStorage.getItem('usuarioLogado'));
    const lista = document.getElementById('listaHistorico');
    try {
        const res = await fetch(`${API_URL}/historico/${user.id}`);
        const dados = await res.json();
        if (dados.length > 0) {
            lista.innerHTML = dados.slice().reverse().map(i => `
                <div style="background:#f8f9fa; padding:10px; border-radius:8px; margin-bottom:5px; text-align:left; border-left:4px solid #007bff;">
                    <small>${i.data}</small><br><strong>${i.valorLeitura} m³</strong>
                </div>`).join('');

            const totalM3 = dados.reduce((a, b) => a + parseFloat(b.valorLeitura), 0);
            document.getElementById('valorEstimado').innerText = `R$ ${(totalM3 * TARIFA_POR_M3).toFixed(2)}`;
            document.getElementById('detalheConsumo').innerText = `Total: ${totalM3} m³ (R$ ${TARIFA_POR_M3}/m³)`;

            renderizarGrafico(dados.slice(-7).map(d => d.data), dados.slice(-7).map(d => d.valorLeitura));
        } else { lista.innerHTML = '<p>Nenhum registro.</p>'; }
    } catch (e) { console.log("Erro"); }
}

function renderizarGrafico(labels, valores) {
    const ctx = document.getElementById('graficoConsumo').getContext('2d');
    if (meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets: [{ label: 'm³', data: valores, borderColor: '#007bff', tension: 0.4, fill: true, backgroundColor: 'rgba(0,123,255,0.1)' }] },
        options: { plugins: { legend: { display: false } } }
    });
}

function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    mostrarTela('tela-login');
}
