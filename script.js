const API_URL = 'https://entrepreneurs-achievements-handled-achieving.trycloudflare.com';
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
    } catch (e) { Swal.fire('Erro', 'Servidor Offline no Termux', 'error'); }
}

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
                dataISO: new Date().toISOString() // Salva para facilitar filtros
            })
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

            // Filtro de 30 dias para a conta
            const trintaDiasAtras = new Date();
            trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
            
            const dadosMes = dados.filter(d => {
                const dataLeitura = d.dataISO ? new Date(d.dataISO) : new Date();
                return dataLeitura >= trintaDiasAtras;
            });

            const totalM3 = dadosMes.reduce((a, b) => a + parseFloat(b.valorLeitura), 0);
            document.getElementById('valorEstimado').innerText = `R$ ${(totalM3 * TARIFA_POR_M3).toFixed(2)}`;
            document.getElementById('detalheConsumo').innerText = `Consumo 30 dias: ${totalM3} m³ (R$ ${TARIFA_POR_M3}/m³)`;

            renderizarGrafico(dados.slice(-7).map(d => d.data), dados.slice(-7).map(d => d.valorLeitura));
        } else { lista.innerHTML = '<p>Nenhum registro.</p>'; }
    } catch (e) { console.log("Erro ao carregar"); }
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
    
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
    const dadosMes = dados.filter(d => (d.dataISO ? new Date(d.dataISO) : new Date()) >= trintaDiasAtras);
    
    const totalM3 = dadosMes.reduce((a, b) => a + parseFloat(b.valorLeitura), 0);
    const valorTotal = (totalM3 * TARIFA_POR_M3).toFixed(2);

    const invoice = document.createElement('div');
    invoice.innerHTML = `
        <div class="invoice-box">
            <h1 style="color:#007bff; text-align:center;">LUCAS OMNI - FATURA MENSAL</h1>
            <hr><p><strong>Cliente:</strong> ${user.usuario}</p>
            <p><strong>Período:</strong> Últimos 30 dias</p>
            <p><strong>Vencimento:</strong> ${new Date(Date.now() + 604800000).toLocaleDateString('pt-BR')}</p>
            <br>
            <table style="width:100%; border:1px solid #eee;">
                <tr style="background:#f4f4f4;"><th>Descrição</th><th style="text-align:right;">Valor</th></tr>
                <tr><td>Consumo Mensal (${totalM3} m³)</td><td style="text-align:right;">R$ ${valorTotal}</td></tr>
                <tr style="font-weight:bold; font-size:18px;"><td style="padding-top:20px;">TOTAL A PAGAR</td><td style="text-align:right; padding-top:20px; color:#007bff;">R$ ${valorTotal}</td></tr>
            </table>
            <br><br><div style="text-align:center; border:1px dashed #666; padding:10px; font-family:monospace;">83640000001-2 45870024101-4 00000000000-0</div>
        </div>`;

    Swal.fire({ title:'Gerando PDF...', didOpen:() => Swal.showLoading() });
    html2pdf().set({ margin:1, filename:`Fatura_${user.usuario}.pdf`, jsPDF:{unit:'in', format:'letter'} })
    .from(invoice).save().then(() => Swal.close());
}

function fazerLogout() { localStorage.removeItem('usuarioLogado'); mostrarTela('tela-login'); }
