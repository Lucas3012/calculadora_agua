const API_URL = 'https://bunny-info-raised-notices.trycloudflare.com';
const TARIFA_POR_M3 = 6.50; 
let meuGrafico = null;

function mostrarTela(idTela) {
    document.querySelectorAll('.tela-sistema').forEach(t => t.style.display = 'none');
    const alvo = document.getElementById(idTela);
    if (alvo) alvo.style.display = 'flex';

    const menu = document.getElementById('menu-principal');
    if (idTela === 'tela-login' || idTela === 'tela-cadastro') {
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

// FUNÇÃO DE CADASTRO
async function fazerCadastro() {
    const usuario = document.getElementById('cad-usuario').value;
    const senha = document.getElementById('cad-senha').value;
    const confirma = document.getElementById('cad-senha-confirma').value;

    if (!usuario || !senha) return Swal.fire('Erro', 'Preencha os campos', 'warning');
    if (senha !== confirma) return Swal.fire('Erro', 'As senhas não batem', 'error');

    try {
        const res = await fetch(`${API_URL}/cadastrar`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({usuario, senha})
        });
        const data = await res.json();
        if (data.success) {
            Swal.fire('Sucesso!', 'Conta criada com sucesso!', 'success');
            mostrarTela('tela-login');
        } else { Swal.fire('Erro', data.message, 'error'); }
    } catch (e) { Swal.fire('Erro', 'Servidor Offline', 'error'); }
}

// FUNÇÃO DE LOGIN
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
            Swal.fire({icon:'success', title:'Entrando...', showConfirmButton:false, timer:1000});
            mostrarTela('tela-dashboard');
        } else { Swal.fire('Erro', 'Usuário ou senha incorretos', 'error'); }
    } catch (e) { Swal.fire('Erro', 'Servidor Offline', 'error'); }
}

// LANÇAR LEITURA
async function enviarLeitura() {
    const valor = document.getElementById('valorLeitura').value;
    const user = JSON.parse(localStorage.getItem('usuarioLogado'));
    if (!valor) return Swal.fire('Aviso', 'Digite o valor', 'info');

    try {
        await fetch(`${API_URL}/leitura`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                usuarioId: user.id, 
                valorLeitura: parseFloat(valor), 
                data: new Date().toLocaleDateString('pt-BR'),
                dataISO: new Date().toISOString()
            })
        });
        Swal.fire('Sucesso', 'Leitura salva!', 'success');
        document.getElementById('valorLeitura').value = '';
    } catch (e) { Swal.fire('Erro', 'Falha ao salvar', 'error'); }
}

// HISTÓRICO, GRÁFICO E PDF
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

            const trintaDiasAtras = new Date(); trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
            const dadosMes = dados.filter(d => (d.dataISO ? new Date(d.dataISO) : new Date()) >= trintaDiasAtras);
            const totalM3 = dadosMes.reduce((a, b) => a + parseFloat(b.valorLeitura), 0);
            
            document.getElementById('valorEstimado').innerText = `R$ ${(totalM3 * TARIFA_POR_M3).toFixed(2)}`;
            document.getElementById('detalheConsumo').innerText = `Consumo 30 dias: ${totalM3} m³`;

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

async function gerarPDF() {
    const user = JSON.parse(localStorage.getItem('usuarioLogado'));
    const res = await fetch(`${API_URL}/historico/${user.id}`);
    const dados = await res.json();
    const trintaDiasAtras = new Date(); trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    const dadosMes = dados.filter(d => (d.dataISO ? new Date(d.dataISO) : new Date()) >= trintaDiasAtras);
    const totalM3 = dadosMes.reduce((a, b) => a + parseFloat(b.valorLeitura), 0);
    const valorTotal = (totalM3 * TARIFA_POR_M3).toFixed(2);

    const invoice = document.createElement('div');
    invoice.innerHTML = `
        <div style="padding:30px; font-family:sans-serif;">
            <h1 style="color:#007bff; text-align:center;">LUCAS OMNI - FATURA MENSAL</h1>
            <p><strong>Cliente:</strong> ${user.usuario}</p>
            <p><strong>Vencimento:</strong> ${new Date(Date.now() + 604800000).toLocaleDateString('pt-BR')}</p>
            <table style="width:100%; border:1px solid #eee; margin-top:20px;">
                <tr style="background:#f4f4f4;"><th>Descrição</th><th style="text-align:right;">Valor</th></tr>
                <tr><td>Consumo Mensal (${totalM3} m³)</td><td style="text-align:right;">R$ ${valorTotal}</td></tr>
                <tr style="font-weight:bold; font-size:18px;"><td>TOTAL</td><td style="text-align:right; color:#007bff;">R$ ${valorTotal}</td></tr>
            </table>
        </div>`;
    html2pdf().from(invoice).save(`Fatura_${user.usuario}.pdf`);
}

function fazerLogout() { localStorage.removeItem('usuarioLogado'); mostrarTela('tela-login'); }
