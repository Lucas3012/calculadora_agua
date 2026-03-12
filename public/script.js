let meuGrafico = null;

// Controle Sidebar
function openNav() { document.getElementById("mySidebar").style.width = "250px"; }
function closeNav() { document.getElementById("mySidebar").style.width = "0"; }

// Navegação
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    closeNav();
    if(sectionId === 'historico') carregarHistorico();
    if(sectionId === 'dashboard') carregarGrafico();
}

// Salvar Leitura
async function salvarLeitura() {
    const leitura = document.getElementById('leituraInput').value;
    const token = localStorage.getItem('token');
    
    const res = await fetch('/api/calcular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ leituraAtual: leitura })
    });

    if(res.ok) {
        Swal.fire('Sucesso', 'Leitura registrada!', 'success');
        showSection('historico');
    }
}

// Histórico e PDF
async function carregarHistorico() {
    const res = await fetch('/api/historico', { headers: { 'Authorization': localStorage.getItem('token') } });
    const dados = await res.json();
    const lista = document.getElementById('listaHistorico');
    
    lista.innerHTML = dados.map(h => \`
        <tr>
            <td>\${h.data}</td>
            <td>\${h.consumo} m³</td>
            <td>R$ \${h.total}</td>
            <td><button onclick="gerarPDF('\${h.data}', '\${h.consumo}', '\${h.total}')"><i class="fa fa-file-pdf"></i></button></td>
        </tr>
    \`).join('');
}

// Gerar PDF
function gerarPDF(data, consumo, total) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("LUCAS OMNI 2026 - RECIBO", 20, 20);
    doc.text(\`Data: \${data}\`, 20, 40);
    doc.text(\`Consumo: \${consumo} m3\`, 20, 50);
    doc.text(\`Valor: R$ \${total}\`, 20, 60);
    doc.save('recibo.pdf');
}

// Gráfico
async function carregarGrafico() {
    const res = await fetch('/api/historico', { headers: { 'Authorization': localStorage.getItem('token') } });
    const dados = await res.json();
    const ctx = document.getElementById('graficoConsumo').getContext('2d');
    
    if(meuGrafico) meuGrafico.destroy();
    meuGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dados.slice(-5).map(d => d.data),
            datasets: [{ label: 'm³', data: dados.slice(-5).map(d => d.consumo), backgroundColor: '#3b82f6' }]
        }
    });
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Inicialização
document.getElementById('userDisplay').innerText = "ID: " + localStorage.getItem('idPublico');

