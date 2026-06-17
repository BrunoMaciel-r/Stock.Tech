

"use strict";


const DB_KEYS = {
  CONTAS_PAGAR:  'contasPagar',
  MOVIMENTACOES: 'movimentacoes',
  PRODUTOS:      'produtos',
  CATEGORIAS:    'categorias',
  VENDAS:        'vendas'
};


const db = {
  getAll(key) {
    const bd = window.lerBanco();
    return bd[key] || [];
  },
  save(key, array) {
    const bd = window.lerBanco();
    bd[key] = array;
    window.salvarBanco(bd);
  },
  add(key, item) {
    const arr = this.getAll(key);
    item.id = `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    item.criadoEm = new Date().toISOString();
    arr.push(item);
    this.save(key, arr);
    return item;
  },
  update(key, id, newData) {
    const arr = this.getAll(key);
    const idx = arr.findIndex(i => String(i.id) === String(id));
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...newData, atualizadoEm: new Date().toISOString() };
    this.save(key, arr);
    return arr[idx];
  },
  remove(key, id) {
    this.save(key, this.getAll(key).filter(i => String(i.id) !== String(id)));
  },
  getById(key, id) {
    return this.getAll(key).find(i => String(i.id) === String(id)) || null;
  }
};


let contasPag = 1;
const CONTAS_PER_PAGE = 5;
let editingContaId = null;
let chartInstance = null;
let searchTerm = '';


document.addEventListener('DOMContentLoaded', () => {
  renderSummaryCards();
  renderContasList();
  renderMovimentacoesTable();
  renderAlertas();
  renderChart();
  bindEvents();
});


function bindEvents() {
  
  document.getElementById('btn-open-contas').addEventListener('click', () => openModalContas());
  document.getElementById('btn-nova-conta').addEventListener('click', () => openFormConta());

  
  document.getElementById('close-modal-contas').addEventListener('click', () => closeModal('modal-contas'));
  document.getElementById('close-form-conta').addEventListener('click', () => closeModal('modal-form-conta'));
  document.getElementById('cancel-form-conta').addEventListener('click', () => closeModal('modal-form-conta'));

  
  document.getElementById('save-conta').addEventListener('click', saveConta);

  
  document.getElementById('contas-prev').addEventListener('click', () => { contasPag--; renderContasTable(); });
  document.getElementById('contas-next').addEventListener('click', () => { contasPag++; renderContasTable(); });

  
  document.getElementById('search-movimentacoes').addEventListener('input', (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderMovimentacoesTable();
  });

  
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });
}


function calcTotais() {
  const movs = db.getAll(DB_KEYS.MOVIMENTACOES);
  const contas = db.getAll(DB_KEYS.CONTAS_PAGAR);

  
  const receita = movs
    .filter(m => m.tipo.toLowerCase() === 'entrada')
    .reduce((s, m) => s + (parseFloat(m.valor) || 0), 0);

  
  const saidasMov = movs
    .filter(m => m.tipo.toLowerCase() === 'saida' || m.tipo.toLowerCase() === 'venda')
    .reduce((s, m) => s + (parseFloat(m.valor) || 0), 0);

  const contasPagar = contas
    .filter(c => !c.pago)
    .reduce((s, c) => s + (parseFloat(c.valor) || 0), 0);

  const despesas = saidasMov + contasPagar;
  const lucro = receita - despesas;

  return { receita, despesas, lucro };
}

function renderSummaryCards() {
  const { receita, despesas, lucro } = calcTotais();

  document.getElementById('card-receita').textContent = formatBRL(receita);
  document.getElementById('card-despesas').textContent = formatBRL(despesas);

  const lucroEl = document.getElementById('card-lucro');
  lucroEl.textContent = formatBRL(lucro);
  lucroEl.style.color = lucro >= 0 ? 'var(--success)' : 'var(--danger)';

  const pctEl = document.getElementById('card-lucro-pct');
  if (receita > 0) {
    const pct = ((lucro / receita) * 100).toFixed(1);
    pctEl.textContent = `${pct >= 0 ? '+' : ''}${pct}% sobre receita`;
    pctEl.className = `card-change ${pct >= 0 ? 'up' : 'down'}`;
  } else {
    pctEl.textContent = 'Sem receita este mês';
    pctEl.className = 'card-change';
  }
}


function renderChart() {
  const movs = db.getAll(DB_KEYS.MOVIMENTACOES);
  const canvas = document.getElementById('cashflow-chart');
  if (!canvas) return;

  
  const meses = {};
  movs.forEach(m => {
    if (!m.data) return;
    
    const parts = m.data.split('-');
    const key = parts.length >= 2 ? `${parts[1]}/${parts[2] || '01'}` : m.data;
    
    if (!meses[key]) meses[key] = { entradas: 0, saidas: 0 };
    if (m.tipo.toLowerCase() === 'entrada') {
        meses[key].entradas += parseFloat(m.valor) || 0;
    } else {
        meses[key].saidas += parseFloat(m.valor) || 0;
    }
  });

  const sortedKeys = Object.keys(meses).sort().slice(-10); 
  const labels = sortedKeys;

  let saldo = 0;
  const dataEntradas = sortedKeys.map(k => meses[k].entradas);
  const dataSaidas   = sortedKeys.map(k => meses[k].saidas);
  const dataSaldo    = sortedKeys.map(k => {
    saldo += meses[k].entradas - meses[k].saidas;
    return saldo;
  });

  const ctx = canvas.getContext('2d');
  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Saldo Acumulado',
          data: dataSaldo,
          borderColor: '#1976d2',
          backgroundColor: 'rgba(25,118,210,0.05)',
          borderWidth: 2.5,
          pointBackgroundColor: '#1976d2',
          pointRadius: 4,
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Entradas',
          data: dataEntradas,
          borderColor: '#43a047',
          borderWidth: 1.5,
          pointRadius: 3,
          fill: false,
          tension: 0.3,
          borderDash: [5,3],
        },
        {
          label: 'Saídas',
          data: dataSaidas,
          borderColor: '#e53935',
          borderWidth: 1.5,
          pointRadius: 3,
          fill: false,
          tension: 0.3,
          borderDash: [5,3],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { family: 'Poppins', size: 11 }, usePointStyle: true },
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { family: 'Poppins', size: 10 },
            callback: v => formatBRL(v),
          },
        },
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Poppins', size: 10 } },
        },
      },
    },
  });
}


function renderContasList() {
  const contas = db.getAll(DB_KEYS.CONTAS_PAGAR).filter(c => !c.pago);
  const container = document.getElementById('contas-list');
  if (!container) return;

  if (contas.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>Nenhuma conta pendente</p></div>`;
    return;
  }

  const visibles = contas.slice(0, 4);
  container.innerHTML = visibles.map(c => {
    const dias = diasParaVencer(c.vencimento);
    const vencendo = dias <= 7;
    return `
      <div class="conta-card ${vencendo ? 'vencendo' : ''}">
        <div class="conta-nome">${c.nome}</div>
        <div class="conta-valor">${formatBRL(c.valor)}</div>
        <div class="conta-venc">Venc: ${formatDate(c.vencimento)}${vencendo ? ' (Urgente!)' : ''}</div>
      </div>
    `;
  }).join('') + (contas.length > 4 ? `<div style="text-align:center;font-size:11px;color:var(--text-muted);padding-top:5px;">+ ${contas.length - 4} pendentes</div>` : '');
}


function openModalContas() {
  contasPag = 1;
  renderContasTable();
  document.getElementById('modal-contas').classList.add('active');
}

function renderContasTable() {
  const all = db.getAll(DB_KEYS.CONTAS_PAGAR);
  const total = all.length;
  const totalPags = Math.max(1, Math.ceil(total / CONTAS_PER_PAGE));
  contasPag = Math.min(Math.max(1, contasPag), totalPags);

  const slice = all.slice((contasPag - 1) * CONTAS_PER_PAGE, contasPag * CONTAS_PER_PAGE);
  const tbody = document.getElementById('contas-tbody');

  tbody.innerHTML = slice.length === 0
    ? `<tr><td colspan="5"><div class="empty-state"><p>Nenhuma conta cadastrada</p></div></td></tr>`
    : slice.map(c => {
        const dias = diasParaVencer(c.vencimento);
        const vencendo = !c.pago && dias <= 7;
        return `
          <tr>
            <td><strong>${c.nome}</strong></td>
            <td>${formatBRL(c.valor)}</td>
            <td>${formatDate(c.vencimento)}${vencendo ? ' <i class="fa-solid fa-triangle-exclamation" style="color:var(--danger);" title="Vence em breve"></i>' : ''}</td>
            <td>
              <span class="badge ${c.pago ? 'badge-pago' : 'badge-pendente'}">
                ${c.pago ? 'Pago' : 'Pendente'}
              </span>
            </td>
            <td style="white-space:nowrap;">
              <button class="btn-edit" onclick="openFormConta('${c.id}')">Editar</button>
              &nbsp;
              <button class="btn-danger btn-sm" onclick="excluirConta('${c.id}')">Excluir</button>
            </td>
          </tr>
        `;
      }).join('');

  document.getElementById('contas-pag-info').textContent = `${total} Conta(s)`;
  document.getElementById('contas-pag-num').textContent = contasPag;
  document.getElementById('contas-prev').disabled = contasPag <= 1;
  document.getElementById('contas-next').disabled = contasPag >= totalPags;
}


window.openFormConta = function(id = null) {
  editingContaId = id;
  const form = document.getElementById('form-conta');
  form.reset();
  document.getElementById('conta-id').value = '';
  document.getElementById('form-conta-title').textContent = id ? 'Editar Conta' : 'Nova Conta';

  const select = document.getElementById('conta-categoria');
  const cats = db.getAll(DB_KEYS.CATEGORIAS);
  select.innerHTML = '<option value="">Selecione...</option>' +
    cats.map(c => `<option value="${c.nome}">${c.nome}</option>`).join('');

  if (id) {
    const conta = db.getById(DB_KEYS.CONTAS_PAGAR, id);
    if (conta) {
      document.getElementById('conta-id').value = conta.id;
      document.getElementById('conta-nome').value = conta.nome;
      document.getElementById('conta-valor').value = conta.valor;
      document.getElementById('conta-vencimento').value = conta.vencimento;
      document.getElementById('conta-categoria').value = conta.categoria || '';
      document.getElementById('conta-pago').checked = conta.pago || false;
    }
  }

  document.getElementById('modal-form-conta').classList.add('active');
};

function saveConta() {
  const nome       = document.getElementById('conta-nome').value.trim();
  const valor      = parseFloat(document.getElementById('conta-valor').value);
  const vencimento = document.getElementById('conta-vencimento').value;
  const categoria  = document.getElementById('conta-categoria').value;
  const pago       = document.getElementById('conta-pago').checked;

  if (!nome || isNaN(valor) || !vencimento) {
    window.mostrarToast('Preencha os campos obrigatórios!', 'warning');
    return;
  }

  const data = { nome, valor, vencimento, categoria, pago };

  if (editingContaId) {
    db.update(DB_KEYS.CONTAS_PAGAR, editingContaId, data);
    window.mostrarToast('Conta atualizada com sucesso!', 'success');
  } else {
    db.add(DB_KEYS.CONTAS_PAGAR, data);
    window.mostrarToast('Conta criada com sucesso!', 'success');
  }

  closeModal('modal-form-conta');
  renderContasTable();
  renderContasList();
  renderSummaryCards();
  renderAlertas();
}

window.excluirConta = function(id) {
  if (confirm("Tem certeza que deseja excluir esta conta?")) {
    db.remove(DB_KEYS.CONTAS_PAGAR, id);
    window.mostrarToast("Conta excluída!");
    renderContasTable();
    renderContasList();
    renderSummaryCards();
    renderAlertas();
  }
};


function renderMovimentacoesTable() {
  let movs = db.getAll(DB_KEYS.MOVIMENTACOES)
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''));

  if (searchTerm) {
    movs = movs.filter(m =>
      (m.descricao || '').toLowerCase().includes(searchTerm) ||
      (m.tipo || '').toLowerCase().includes(searchTerm) ||
      (m.categoria || '').toLowerCase().includes(searchTerm) ||
      (m.nome || '').toLowerCase().includes(searchTerm)
    );
  }

  const tbody = document.getElementById('mov-tbody');
  if (!tbody) return;

  tbody.innerHTML = movs.length === 0
    ? `<tr><td colspan="4"><div class="empty-state"><p>Nenhuma movimentação registrada</p></div></td></tr>`
    : movs.slice(0, 10).map(m => {
        const desc = m.descricao || m.nome || 'Movimentação';
        const isEntrada = m.tipo.toLowerCase() === 'entrada';
        return `
          <tr>
            <td>${formatDate(m.data)}</td>
            <td><span class="badge ${isEntrada ? 'badge-entrada' : 'badge-saida'}">${isEntrada ? 'Entrada' : 'Saída'}</span></td>
            <td>${desc}</td>
            <td class="text-right ${isEntrada ? 'text-success' : 'text-danger'}">
              ${isEntrada ? '+' : '-'} ${formatBRL(parseFloat(m.valor) || 0)}
            </td>
          </tr>
        `;
      }).join('');
}


function renderAlertas() {
  const contas = db.getAll(DB_KEYS.CONTAS_PAGAR).filter(c => !c.pago);
  const vencendo = contas.filter(c => diasParaVencer(c.vencimento) <= 7);
  const container = document.getElementById('alertas-body');
  if (!container) return;

  let html = '';

  if (vencendo.length > 0) {
    html += `
      <div class="alert-item">
        <span class="alert-icon"><i class="fa-solid fa-triangle-exclamation"></i></span>
        <span>
          <strong>${vencendo.length} conta(s)</strong> vencendo em até 7 dias.<br/>
          <small style="color:var(--text-muted);">${vencendo.map(c => c.nome).join(', ')}</small>
        </span>
      </div>
    `;
  }

  if (contas.length > 0) {
    html += `
      <div class="alert-item">
        <span class="alert-icon" style="color:var(--green-main);"><i class="fa-solid fa-file-invoice-dollar"></i></span>
        <span>${contas.length} contas em aberto no financeiro.</span>
      </div>
    `;
  }

  
  const meta = 15000;
  const { receita } = calcTotais();
  const pct = Math.min(100, Math.round((receita / meta) * 100));
  html += `
    <div class="alert-item" style="flex-direction:column;align-items:flex-start;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span class="alert-icon" style="color:var(--green-main);"><i class="fa-solid fa-bullseye"></i></span>
        <span>Meta Mensal de Receita</span>
      </div>
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;">
        ${formatBRL(receita)} / ${formatBRL(meta)} (${pct}%)
      </div>
      <div class="progress-bar-wrap" style="width:100%;">
        <div class="progress-bar-fill" style="width:${pct}%;"></div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}


function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function diasParaVencer(dateStr) {
  if (!dateStr) return Infinity;
  const d = new Date(dateStr + 'T00:00:00');
  const t = new Date(); 
  t.setHours(0,0,0,0);
  return Math.round((d - t) / 86400000);
}
