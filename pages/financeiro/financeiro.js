"use strict";

/* ── Helpers ──────────────────────────────────────────────── */
function formatBRL(v){return(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function formatDate(d){if(!d)return'—';const p=d.split('-');return p.length===3?`${p[2]}/${p[1]}/${p[0]}`:d}
function diasParaVencer(d){if(!d)return 999;const h=new Date();h.setHours(0,0,0,0);const v=new Date(d+'T00:00:00');return Math.ceil((v-h)/(1000*60*60*24))}

/* ── Categorias ───────────────────────────────────────────── */
const CATEGORIAS=[
  {nome:'Eletricidade',icone:'fa-bolt',cor:'#fb8c00'},
  {nome:'Aluguel',icone:'fa-house',cor:'#1976d2'},
  {nome:'Água',icone:'fa-droplet',cor:'#039be5'},
  {nome:'Internet',icone:'fa-wifi',cor:'#7b1fa2'},
  {nome:'Pagamento',icone:'fa-dollar-sign',cor:'#2e7d32'},
  {nome:'Salário',icone:'fa-briefcase',cor:'#00695c'},
  {nome:'Alimentação',icone:'fa-utensils',cor:'#e65100'},
  {nome:'Saúde',icone:'fa-heart-pulse',cor:'#c62828'},
  {nome:'Transporte',icone:'fa-truck',cor:'#455a64'},
  {nome:'Outros',icone:'fa-ellipsis',cor:'#78909c'}
];
function getCat(nome){return CATEGORIAS.find(c=>c.nome===nome)||CATEGORIAS[CATEGORIAS.length-1]}

/* ── Estado ───────────────────────────────────────────────── */
let editingContaId=null,chartInstance=null,searchTerm='',_selCat='',_editMetaId=null,_selMetaCor='#1b5e20';

const TIPOS_META={
  lucro:{label:'Lucro Líquido',emoji:'💰',fmt:'brl'},
  receita:{label:'Receita',emoji:'📈',fmt:'brl'},
  despesas:{label:'Red. Despesas',emoji:'📉',fmt:'brl'},
  movimentacoes:{label:'Movimentações',emoji:'🔄',fmt:'num'},
  estoque:{label:'Estoque Vendido',emoji:'📦',fmt:'num'},
  manual:{label:'Personalizado',emoji:'✏️',fmt:'brl'}
};

/* ── Banco ────────────────────────────────────────────────── */
function getBD(){
  const bd=window.lerBanco();
  if(!bd.contasPagar)bd.contasPagar=[];
  if(!bd.movimentacoes)bd.movimentacoes=[];
  if(!bd.metas)bd.metas=[];
  return bd;
}

/* ── Init ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  renderAll();
  bindEvents();
});

function renderAll(){
  renderSummary();
  renderContasInline();
  renderMovTable();
  renderAlertas();
  renderChart();
  renderMetas();
}

/* ── Bind ─────────────────────────────────────────────────── */
function bindEvents(){
  const $=id=>document.getElementById(id);
  $('btn-open-contas')?.addEventListener('click',()=>openFormConta());
  $('btn-nova-conta')?.addEventListener('click',()=>openFormConta());
  $('close-form-conta')?.addEventListener('click',()=>closeModal('modal-form-conta'));
  $('cancel-form-conta')?.addEventListener('click',()=>closeModal('modal-form-conta'));
  $('save-conta')?.addEventListener('click',saveConta);
  $('btn-nova-meta')?.addEventListener('click',()=>openFormMeta());
  $('close-form-meta')?.addEventListener('click',()=>closeModal('modal-form-meta'));
  $('cancel-form-meta')?.addEventListener('click',()=>closeModal('modal-form-meta'));
  $('save-meta')?.addEventListener('click',saveMeta);
  $('search-movimentacoes')?.addEventListener('input',e=>{searchTerm=e.target.value.toLowerCase();renderMovTable()});
  document.querySelectorAll('.modal-overlay').forEach(o=>{o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('open')})});
}

function closeModal(id){document.getElementById(id)?.classList.remove('open')}

/* ── Cálculos ─────────────────────────────────────────────── */
const isReceita = t => ['Entrada','venda'].includes(t);

function calcTotais(){
  const bd=getBD();
  const receita=bd.movimentacoes.filter(m=>isReceita(m.tipo)).reduce((s,m)=>s+(parseFloat(m.valor)||0),0);
  const saidasMov=bd.movimentacoes.filter(m=>!isReceita(m.tipo)).reduce((s,m)=>s+(parseFloat(m.valor)||0),0);
  const contasPend=bd.contasPagar.filter(c=>!c.pago).reduce((s,c)=>s+(parseFloat(c.valor)||0),0);
  const despesas=saidasMov+contasPend;
  return{receita,despesas,lucro:receita-despesas};
}

/* ── Summary Cards ────────────────────────────────────────── */
function renderSummary(){
  const{receita,despesas,lucro}=calcTotais();
  const r=document.getElementById('card-receita');
  const d=document.getElementById('card-despesas');
  const l=document.getElementById('card-lucro');
  const lp=document.getElementById('card-lucro-pct');
  if(r)r.textContent=formatBRL(receita);
  if(d)d.textContent=formatBRL(despesas);
  if(l){l.textContent=formatBRL(lucro);l.style.color=lucro>=0?'var(--success)':'var(--danger)'}
  if(lp&&receita>0){const p=((lucro/receita)*100).toFixed(1);lp.textContent=`${p>=0?'+':''}${p}% sobre receita`;lp.className=`fin-card-change ${p>=0?'up':'down'}`}
}

/* ── Gráfico ──────────────────────────────────────────────── */
function renderChart(){
  const bd=getBD();const movs=bd.movimentacoes;const meses={};
  movs.forEach(m=>{if(!m.data)return;const k=m.data.substring(0,7);if(!meses[k])meses[k]={e:0,s:0};if(isReceita(m.tipo))meses[k].e+=parseFloat(m.valor)||0;else meses[k].s+=parseFloat(m.valor)||0});
  const sorted=Object.keys(meses).sort();
  const labels=sorted.map(k=>{const[y,mo]=k.split('-');return new Date(+y,+mo-1).toLocaleDateString('pt-BR',{month:'short',year:'2-digit'})});
  let saldo=0;
  const dE=sorted.map(k=>meses[k].e),dS=sorted.map(k=>meses[k].s);
  const dSaldoReal=sorted.map(k=>{saldo+=meses[k].e-meses[k].s;return saldo});
  const dSaldo=dSaldoReal.map(v=>Math.max(0,v));
  const canvas=document.getElementById('cashflow-chart');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  if(chartInstance)chartInstance.destroy();

  // Gradientes
  const gradSaldo=ctx.createLinearGradient(0,0,0,canvas.parentElement?.offsetHeight||300);
  gradSaldo.addColorStop(0,'rgba(25,118,210,0.25)');
  gradSaldo.addColorStop(0.6,'rgba(25,118,210,0.06)');
  gradSaldo.addColorStop(1,'rgba(25,118,210,0)');

  chartInstance=new Chart(ctx,{
    type:'bar',
    data:{labels,datasets:[
      {
        type:'line',
        label:'Saldo Acumulado',
        data:dSaldo,
        borderColor:'#1565c0',
        backgroundColor:gradSaldo,
        borderWidth:3,
        pointRadius:6,
        pointHoverRadius:9,
        pointBackgroundColor:dSaldoReal.map(v=>v<0?'#d32f2f':'#fff'),
        pointBorderColor:dSaldoReal.map(v=>v<0?'#d32f2f':'#1565c0'),
        pointBorderWidth:2.5,
        pointHoverBackgroundColor:'#1565c0',
        pointHoverBorderColor:'#fff',
        pointHoverBorderWidth:3,
        fill:true,
        tension:0.4,
        order:0
      },
      {
        type:'bar',
        label:'Entradas',
        data:dE,
        backgroundColor:'rgba(46,125,50,0.75)',
        hoverBackgroundColor:'rgba(46,125,50,0.95)',
        borderRadius:{topLeft:6,topRight:6},
        borderSkipped:false,
        barPercentage:0.45,
        categoryPercentage:0.7,
        order:1
      },
      {
        type:'bar',
        label:'Saídas',
        data:dS,
        backgroundColor:'rgba(211,47,47,0.65)',
        hoverBackgroundColor:'rgba(211,47,47,0.9)',
        borderRadius:{topLeft:6,topRight:6},
        borderSkipped:false,
        barPercentage:0.45,
        categoryPercentage:0.7,
        order:2
      }
    ]},
    options:{
      responsive:true,
      maintainAspectRatio:false,
      interaction:{mode:'nearest',intersect:true},
      animation:{
        duration:900,
        easing:'easeOutQuart',
        delay:function(ctx){return ctx.dataIndex*80}
      },
      plugins:{
        legend:{
          position:'top',
          align:'end',
          labels:{
            font:{family:'Poppins, sans-serif',size:11,weight:'600'},
            usePointStyle:true,
            pointStyleWidth:10,
            padding:16,
            color:'#64748b'
          }
        },
        tooltip:{
          backgroundColor:'rgba(15,23,42,0.92)',
          titleFont:{family:'Poppins, sans-serif',size:13,weight:'700'},
          bodyFont:{family:'Poppins, sans-serif',size:12},
          titleColor:'#fff',
          bodyColor:'rgba(255,255,255,0.85)',
          padding:{top:12,bottom:12,left:16,right:16},
          cornerRadius:10,
          borderColor:'rgba(255,255,255,0.1)',
          borderWidth:1,
          displayColors:true,
          boxPadding:6,
          caretSize:8,
          callbacks:{
            title:function(items){return items[0].label},
            label:function(c){
              if(c.datasetIndex===0){
                const real=dSaldoReal[c.dataIndex];
                return ` Saldo Real: ${formatBRL(real)}${real<0?' (DÉFICIT)':''}`;
              }
              return ` ${c.dataset.label}: ${formatBRL(c.parsed.y)}`;
            }
          }
        }
      },
      scales:{
        y:{
          min:0,
          beginAtZero:true,
          grid:{color:'rgba(0,0,0,0.04)',drawBorder:false},
          border:{display:false},
          ticks:{
            callback:v=>formatBRL(v),
            font:{family:'Poppins, sans-serif',size:11,weight:'500'},
            color:'#94a3b8',
            padding:8
          }
        },
        x:{
          grid:{display:false},
          border:{display:false},
          ticks:{
            font:{family:'Poppins, sans-serif',size:11,weight:'600'},
            color:'#64748b',
            padding:6
          }
        }
      }
    }
  });
}

/* ── Contas Inline ────────────────────────────────────────── */
function renderContasInline(){
  const bd=getBD();const all=bd.contasPagar;
  const tbody=document.getElementById('contas-inline-tbody');
  const total=document.getElementById('contas-inline-total');
  if(!tbody)return;
  const sorted=[...all].sort((a,b)=>{if(a.pago!==b.pago)return a.pago?1:-1;return(a.vencimento||'').localeCompare(b.vencimento||'')});
  if(total){const pend=all.filter(c=>!c.pago).length;total.textContent=`${all.length} conta(s) • ${pend} pendente(s)`}
  if(sorted.length===0){tbody.innerHTML=`<tr><td colspan="7"><div class="fin-empty"><i class="fa-solid fa-file-invoice"></i><p>Nenhuma conta cadastrada. Clique em "+ Nova Conta".</p></div></td></tr>`;return}
  tbody.innerHTML=sorted.map(c=>{
    const dias=diasParaVencer(c.vencimento);const cat=getCat(c.categoria);
    let sitHtml,rowCls;
    if(c.pago){sitHtml=`<span class="fin-situacao-badge fin-sit-paga"><i class="fa-solid fa-check"></i> Paga</span>`;rowCls='fin-linha-paga'}
    else if(dias<0){sitHtml=`<span class="fin-situacao-badge fin-sit-vencida"><i class="fa-solid fa-circle-exclamation"></i> Vencida</span>`;rowCls='fin-linha-vencida'}
    else if(dias<=7){sitHtml=`<span class="fin-situacao-badge fin-sit-alerta"><i class="fa-solid fa-triangle-exclamation"></i> Alerta</span>`;rowCls='fin-linha-alerta'}
    else{sitHtml=`<span class="fin-situacao-badge fin-sit-pendente"><i class="fa-regular fa-clock"></i> Pendente</span>`;rowCls=''}
    let diasHtml;
    if(c.pago)diasHtml=`<span style="color:var(--success);font-weight:700;">Quitada</span>`;
    else if(dias<0)diasHtml=`<span style="color:var(--danger);font-weight:700;">${Math.abs(dias)}d atrasada</span>`;
    else if(dias===0)diasHtml=`<span style="color:var(--warning);font-weight:700;">Hoje!</span>`;
    else diasHtml=`<span style="color:${dias<=7?'var(--warning)':'var(--text-muted)'};font-weight:600;">em ${dias}d</span>`;
    return`<tr class="${rowCls}">
      <td><strong>${c.nome}</strong>${c.pago?` <i class="fa-solid fa-check" style="color:var(--success)"></i>`:''}</td>
      <td><span class="fin-cat-badge" style="background:${cat.cor}18;color:${cat.cor};border:1px solid ${cat.cor}40;"><i class="fa-solid ${cat.icone}"></i> ${c.categoria||'Outros'}</span></td>
      <td><strong>${formatBRL(c.valor)}</strong></td>
      <td style="text-align:center;">${formatDate(c.vencimento)}</td>
      <td style="text-align:center;">${diasHtml}</td>
      <td style="text-align:center;">${sitHtml}</td>
      <td style="white-space:nowrap;text-align:right;">
        <button class="fin-toggle-btn ${c.pago?'fin-toggle-pago':'fin-toggle-pendente'}" onclick="togglePago('${c.id}')" title="${c.pago?'Marcar pendente':'Marcar pago'}"><i class="fa-solid ${c.pago?'fa-check':'fa-clock'}"></i></button>
        <button class="fin-action-btn edit" onclick="openFormConta('${c.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="fin-action-btn del" onclick="deleteConta('${c.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
      </td></tr>`}).join('');
}

/* ── Toggle/Delete Conta ──────────────────────────────────── */
window.togglePago=function(id){
  const bd=getBD();const c=bd.contasPagar.find(x=>x.id===id);if(!c)return;
  c.pago=!c.pago;
  bd.movimentacoes=bd.movimentacoes||[];
  if(c.pago){
    bd.movimentacoes.push({id:`MOV-PG-${c.id}`,refConta:c.id,nome:`Pagamento: ${c.nome}`,tipo:"Saida",categoria:c.categoria||"Geral",valor:c.valor,data:new Date().toISOString().split('T')[0],descricao:"Pagamento de conta a pagar"});
  }else{
    bd.movimentacoes=bd.movimentacoes.filter(m=>m.refConta!==c.id);
  }
  window.salvarBanco(bd);renderAll();
  window.mostrarToast(c.pago?'Conta marcada como paga! ✅':'Conta marcada como pendente.');
};
window.deleteConta=function(id){
  const bd=getBD();const c=bd.contasPagar.find(x=>x.id===id);if(!c)return;
  if(!confirm(`Excluir "${c.nome}"?`))return;
  bd.contasPagar=bd.contasPagar.filter(x=>x.id!==id);
  bd.movimentacoes=(bd.movimentacoes||[]).filter(m=>m.refConta!==id);
  window.salvarBanco(bd);renderAll();
  window.mostrarToast('Conta excluída.','warning');
};

/* ── Form Conta ───────────────────────────────────────────── */
window.openFormConta=function(id=null){
  editingContaId=id;_selCat='';
  document.getElementById('form-conta')?.reset();
  document.getElementById('conta-id').value='';
  document.getElementById('form-conta-title').textContent=id?'Editar Conta':'Nova Conta';
  const grid=document.getElementById('cat-grid');
  if(grid){grid.innerHTML=CATEGORIAS.map(c=>`<button type="button" class="fin-cat-option" data-cat="${c.nome}" style="--cat-cor:${c.cor};" onclick="selCat(this,'${c.nome}')" title="${c.nome}"><span class="fin-cat-icon" style="color:${c.cor};background:${c.cor}18;"><i class="fa-solid ${c.icone}"></i></span><span class="fin-cat-label">${c.nome}</span></button>`).join('')}
  if(id){const bd=getBD();const c=bd.contasPagar.find(x=>x.id===id);if(c){
    document.getElementById('conta-nome').value=c.nome;
    document.getElementById('conta-valor').value=c.valor;
    document.getElementById('conta-vencimento').value=c.vencimento;
    document.getElementById('conta-pago').checked=c.pago||false;
    if(c.categoria)setTimeout(()=>selCatByName(c.categoria),0);
  }}
  document.getElementById('modal-form-conta')?.classList.add('open');
};

window.selCat=function(btn,nome){_selCat=nome;document.querySelectorAll('.fin-cat-option').forEach(b=>b.classList.remove('active'));btn.classList.add('active')};
function selCatByName(nome){_selCat=nome;document.querySelectorAll('.fin-cat-option').forEach(b=>b.classList.toggle('active',b.dataset.cat===nome))}

function saveConta(){
  const nome=document.getElementById('conta-nome').value.trim();
  const valor=parseFloat(document.getElementById('conta-valor').value);
  const venc=document.getElementById('conta-vencimento').value;
  const cat=_selCat||'Outros';
  const pago=document.getElementById('conta-pago').checked;
  if(!nome||isNaN(valor)||!venc){window.mostrarToast('Preencha os campos obrigatórios!','warning');return}
  const bd=getBD();
  if(editingContaId){const c=bd.contasPagar.find(x=>x.id===editingContaId);if(c){Object.assign(c,{nome,valor,vencimento:venc,categoria:cat,pago})}window.mostrarToast('Conta atualizada!')}
  else{bd.contasPagar.push({id:Date.now().toString(),nome,valor,vencimento:venc,categoria:cat,pago});window.mostrarToast('Conta criada!')}
  window.salvarBanco(bd);_selCat='';closeModal('modal-form-conta');renderAll();
}

/* ── Movimentações ────────────────────────────────────────── */
function renderMovTable(){
  const bd=getBD();
  let movs = (bd.movimentacoes || []).map((m, idx) => ({ ...m, idx }));
  movs.sort((a, b) => {
    const cmp = (b.data || '').localeCompare(a.data || '');
    if (cmp !== 0) return cmp;
    return b.idx - a.idx;
  });
  if(searchTerm)movs=movs.filter(m=>(m.descricao||'').toLowerCase().includes(searchTerm)||(m.tipo||'').toLowerCase().includes(searchTerm));
  const tbody=document.getElementById('mov-tbody');if(!tbody)return;
  if(movs.length===0){tbody.innerHTML=`<tr><td colspan="4"><div class="fin-empty"><i class="fa-solid fa-exchange-alt"></i><p>Nenhuma movimentação registrada</p></div></td></tr>`;return}
  tbody.innerHTML=movs.slice(0,10).map(m=>{const ent=isReceita(m.tipo);const label=ent?'Entrada':'Saída';return`<tr>
    <td>${formatDate(m.data)}</td>
    <td><span class="fin-badge ${ent?'fin-badge-entrada':'fin-badge-saida'}">${label}</span></td>
    <td>${m.descricao||m.nome||'—'}</td>
    <td class="text-right ${ent?'text-success':'text-danger'}">${ent?'+':'-'} ${formatBRL(parseFloat(m.valor)||0)}</td>
  </tr>`}).join('');
}

/* ── Alertas ──────────────────────────────────────────────── */
function renderAlertas(){
  const bd=getBD();const contas=bd.contasPagar.filter(c=>!c.pago);
  const el=document.getElementById('alertas-body');if(!el)return;
  let html='';
  const vencidas=contas.filter(c=>diasParaVencer(c.vencimento)<0);
  if(vencidas.length)html+=`<div class="fin-alert-item" style="border-left:3px solid var(--danger);padding-left:10px;"><span class="fin-alert-icon" style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i></span><span><strong style="color:var(--danger);">${vencidas.length} conta(s) vencida(s)!</strong><br><small style="color:var(--text-muted);">${vencidas.map(c=>`${c.nome} (${Math.abs(diasParaVencer(c.vencimento))}d atraso)`).join(', ')}</small></span></div>`;
  const alerta=contas.filter(c=>{const d=diasParaVencer(c.vencimento);return d>=0&&d<=7});
  if(alerta.length)html+=`<div class="fin-alert-item" style="border-left:3px solid var(--warning);padding-left:10px;"><span class="fin-alert-icon" style="color:var(--warning);"><i class="fa-solid fa-triangle-exclamation"></i></span><span><strong>${alerta.length} conta(s)</strong> vencem em até 7 dias.<br><small style="color:var(--text-muted);">${alerta.map(c=>`${c.nome} (em ${diasParaVencer(c.vencimento)}d)`).join(', ')}</small></span></div>`;
  if(contas.length)html+=`<div class="fin-alert-item"><span class="fin-alert-icon"><i class="fa-solid fa-file-lines"></i></span><span>${contas.length} conta(s) a pagar em aberto</span></div>`;
  const{receita}=calcTotais();
  el.innerHTML=html||`<div class="fin-empty"><i class="fa-solid fa-circle-check"></i><p>Tudo em dia!</p></div>`;
}

/* ── Metas ────────────────────────────────────────────────── */
function getMetaAtual(m){const{receita,despesas,lucro}=calcTotais();const bd=getBD();switch(m.tipo){case'lucro':return Math.max(0,lucro);case'receita':return receita;case'despesas':return despesas;case'movimentacoes':return bd.movimentacoes.length;default:return parseFloat(m.valorAtual)||0}}
function fmtMeta(v,t){const tp=TIPOS_META[t];return tp&&tp.fmt==='num'?v.toLocaleString('pt-BR'):formatBRL(v)}

function renderMetas(){
  const bd=getBD();const metas=bd.metas||[];
  const el=document.getElementById('metas-body');if(!el)return;
  if(!metas.length){el.innerHTML=`<div class="fin-empty"><i class="fa-solid fa-bullseye"></i><p>Nenhuma meta definida.<br>Clique em "+ Meta" para começar.</p></div>`;return}
  el.innerHTML=metas.map(m=>{
    const va=getMetaAtual(m),vm=parseFloat(m.valorMeta)||1,pct=Math.min(100,Math.round((va/vm)*100));
    const cor=m.cor||'#1b5e20',tipo=TIPOS_META[m.tipo]||TIPOS_META.manual,ok=pct>=100;
    const cb=ok?'var(--success)':(pct>=70?'var(--warning)':cor);
    return`<div class="fin-meta-card" style="--meta-cor:${cor};">
      <div class="fin-meta-header"><div class="fin-meta-info"><span class="fin-meta-emoji">${tipo.emoji}</span><div><div class="fin-meta-nome">${m.nome}</div><div class="fin-meta-tipo">${tipo.label}</div></div></div>
      <div class="fin-meta-actions"><button class="fin-meta-act-btn edit" onclick="openFormMeta('${m.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button><button class="fin-meta-act-btn del" onclick="deleteMeta('${m.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button></div></div>
      <div class="fin-meta-valores"><span class="fin-meta-atual" style="color:${cb};">${fmtMeta(va,m.tipo)}</span><span class="fin-meta-sep">de</span><span class="fin-meta-alvo">${fmtMeta(vm,m.tipo)}</span>${ok?'<span class="fin-meta-badge-ok">✓ Atingida!</span>':''}</div>
      <div class="fin-meta-progress"><div class="fin-meta-bar" style="width:${pct}%;background:${cb};"></div></div>
      <div class="fin-meta-pct" style="color:${cb};">${pct}%</div></div>`}).join('');
}

window.openFormMeta=function(id=null){
  _editMetaId=id;document.getElementById('form-meta')?.reset();
  document.getElementById('meta-id').value='';
  document.getElementById('form-meta-title').textContent=id?'Editar Meta':'Nova Meta';
  document.getElementById('meta-atual-group').style.display='none';
  _selMetaCor='#1b5e20';
  document.querySelectorAll('.fin-meta-cor-btn').forEach(b=>b.classList.remove('fin-meta-cor-active'));
  document.querySelector('.fin-meta-cor-btn[data-cor="#1b5e20"]')?.classList.add('fin-meta-cor-active');
  if(id){const bd=getBD();const m=(bd.metas||[]).find(x=>x.id===id);if(m){
    document.getElementById('meta-nome').value=m.nome;
    document.getElementById('meta-tipo').value=m.tipo;
    document.getElementById('meta-valor').value=m.valorMeta;
    document.getElementById('meta-atual').value=m.valorAtual||'';
    onMetaTipoChange();_selMetaCor=m.cor||'#1b5e20';
    document.querySelectorAll('.fin-meta-cor-btn').forEach(b=>b.classList.toggle('fin-meta-cor-active',b.dataset.cor===_selMetaCor));
  }}
  document.getElementById('modal-form-meta')?.classList.add('open');
};

window.onMetaTipoChange=function(){const t=document.getElementById('meta-tipo').value;document.getElementById('meta-atual-group').style.display=['estoque','manual'].includes(t)?'':'none'};
window.selectMetaCor=function(btn,cor){_selMetaCor=cor;document.querySelectorAll('.fin-meta-cor-btn').forEach(b=>b.classList.remove('fin-meta-cor-active'));btn.classList.add('fin-meta-cor-active')};

function saveMeta(){
  const nome=document.getElementById('meta-nome').value.trim();
  const tipo=document.getElementById('meta-tipo').value;
  const valorMeta=parseFloat(document.getElementById('meta-valor').value);
  const valorAtual=parseFloat(document.getElementById('meta-atual').value)||0;
  if(!nome||isNaN(valorMeta)||valorMeta<=0){window.mostrarToast('Preencha nome e valor!','warning');return}
  const bd=getBD();if(!bd.metas)bd.metas=[];
  const data={nome,tipo,valorMeta,valorAtual,cor:_selMetaCor};
  if(_editMetaId){const m=bd.metas.find(x=>x.id===_editMetaId);if(m)Object.assign(m,data);window.mostrarToast('Meta atualizada!')}
  else{data.id=Date.now().toString();bd.metas.push(data);window.mostrarToast('Meta criada! 🎯')}
  window.salvarBanco(bd);_editMetaId=null;closeModal('modal-form-meta');renderMetas();
}

window.deleteMeta=function(id){
  const bd=getBD();const m=(bd.metas||[]).find(x=>x.id===id);if(!m)return;
  if(!confirm(`Excluir "${m.nome}"?`))return;
  bd.metas=bd.metas.filter(x=>x.id!==id);window.salvarBanco(bd);renderMetas();
  window.mostrarToast('Meta removida.','warning');
};
