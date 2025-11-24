// Basic SPA skeleton for admin dashboard

// Detect if current path already inside /ADM/; dynamic base with fallback list
let ADM_API = (window.location.pathname.toLowerCase().includes('/adm/')) ? 'api' : 'ADM/api';
function candidateBases(){
  const arr = [];
  const p = window.location.pathname.toLowerCase();
  if(p.includes('/adm/')){
    arr.push('api','../api','../../api','../../../api');
  } else {
    arr.push('ADM/api','api','./api');
  }
  return Array.from(new Set(arr));
}
async function smartFetch(endpoint, opts={}){
  const bases = [ADM_API, ...candidateBases().filter(b=>b!==ADM_API)];
  let lastErr;
  for(const base of bases){
    const url = base.replace(/\/$/,'') + '/' + endpoint.replace(/^\//,'');
    try {
      const res = await fetch(url, opts);
      const text = await res.text();
      if(res.status===404){ lastErr=new Error('404 '+url); continue; }
      // tentativa parse json
      try {
        const data = JSON.parse(text);
        // se sucesso, fixa base
        ADM_API = base;
        return {res,data};
      } catch(parseErr){
        // HTML ou outra coisa
        lastErr = new Error('Resposta não JSON em '+url+': '+text.substring(0,80));
        continue;
      }
    } catch(e){ lastErr=e; }
  }
  throw lastErr || new Error('Falha requisição '+endpoint);
}
let ADM_USER = null;
let CSRF = null;
let ADM_TOKEN = null;

function getStored(){
  try {
    ADM_USER = JSON.parse(sessionStorage.getItem('ADM_USER'));
    CSRF = sessionStorage.getItem('ADM_CSRF');
    ADM_TOKEN = sessionStorage.getItem('ADM_TOKEN');
  } catch(e){}
}
getStored();
if(!ADM_USER){ location.href='index.html'; }
// Se usuário existe mas token não (login feito antes da atualização) força novo login
if(ADM_USER && !sessionStorage.getItem('ADM_TOKEN')){
  console.warn('ADM_TOKEN ausente – refaça login para gerar novo token.');
  sessionStorage.clear();
  location.href='index.html';
}

function authHeaders(){
  const h={'Content-Type':'application/json'};
  if(CSRF) h['X-CSRF-Token']=CSRF;
  if(ADM_TOKEN) h['X-ADM-TOKEN']=ADM_TOKEN;
  return h;
}

const NAV = [
  {id:'dash', label:'Dashboard'},
  {id:'status', label:'Status'},
  {id:'cloudflare', label:'Cloudflare'},
  {id:'sitecontrol', label:'Controle do Site'},
  {id:'security', label:'Segurança'},
  {id:'reports', label:'Denúncias'},
  {id:'comments', label:'Comentários'},
  {id:'users', label:'Usuários'},
  {id:'logins', label:'Logins'},
  {id:'logs', label:'Logs'},
  {id:'analytics', label:'Analytics'}
];

function buildNav(){
  const nav = document.getElementById('mainNav');
  NAV.forEach(item=>{
    const btn = document.createElement('button');
    btn.textContent = item.label;
    btn.onclick = ()=> loadView(item.id, btn);
    nav.appendChild(btn);
  });
}

function userBox(){
  const box = document.getElementById('userBox');
  const initials = (ADM_USER?.name||'ADM').split(/\s+/).map(p=>p[0]).join('').slice(0,2).toUpperCase();
  box.innerHTML = `<div class="avatar">${initials}</div><div>${escapeHtml(ADM_USER?.name||'Admin')}<br><small>${ADM_USER?.role||'admin'}</small></div><button class="btn outline" style="padding:.4rem .6rem;font-size:.6rem" onclick="logoutAdm()">Sair</button>`;
}

function logoutAdm(){ sessionStorage.clear(); location.href='index.html'; }

function kpiCard(id,label,value,sub){
  return `<div class="kpi-card" id="kpi-${id}"><h4>${escapeHtml(label)}</h4><div class="value">${value}</div>${sub?`<small>${escapeHtml(sub)}</small>`:''}</div>`;
}

async function loadKpis(){
  setKpiLoading();
  try {
  const hdrs = authHeaders();
  // DEBUG TEMP: remover depois
  if(!hdrs['X-ADM-TOKEN']) console.warn('Header X-ADM-TOKEN não definido (token ausente).');
  const {data:d} = await smartFetch('adm_stats.php',{headers:hdrs});
    if(d.success){
      const grid = document.getElementById('kpiGrid');
      const prov = d.providers||{};
      const socialSummary = ['google','microsoft','facebook']
        .map(p=> (prov[p]? (p[0].toUpperCase()+p.slice(1)[0]) + ':'+prov[p] : null))
        .filter(Boolean).join(' ');
      grid.innerHTML = [
        kpiCard('reports','Denúncias', d.reports_total, d.reports_today+' hoje'),
        kpiCard('pending','Pendentes', d.reports_pending),
        kpiCard('users','Usuários', d.users_total, d.users_today+' novos'),
        kpiCard('providers','Providers', Object.values(prov).reduce((a,b)=>a+b,0), socialSummary||'local:'+ (prov.local||0)),
        kpiCard('comments','Comentários', d.comments_total),
        kpiCard('logins','Logins 24h', d.logins_24h),
        kpiCard('likes','Curtidas', d.likes_total)
      ].join('');
    }
  } catch(e){ console.error(e); }
}

function setKpiLoading(){ document.getElementById('kpiGrid').innerHTML='<div class="loader"></div>'; }

async function loadView(id, btn){
  document.querySelectorAll('.main-nav button').forEach(b=> b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const panel = document.getElementById('panelContent');
  panel.innerHTML = '<div class="loader"></div>';
  if(id==='dash') return loadDashboard(panel);
  if(id==='status') return loadStatus(panel);
  if(id==='cloudflare') return loadCloudflare(panel);
  if(id==='sitecontrol') return loadSiteControl(panel);
  if(id==='security') return loadSecurity(panel);
  if(id==='reports') return loadReports(panel);
  if(id==='comments') return loadCommentsModeration(panel);
  if(id==='users') return loadUsers(panel);
  if(id==='logins') return loadLogins(panel);
  if(id==='logs') return loadAudit(panel);
  if(id==='analytics') return loadAnalytics(panel);
  // default dash
  panel.innerHTML = '<div class="empty">Selecione uma aba</div>';
}

async function loadReports(panel){
  try {
  const {data:d} = await smartFetch('adm_reports.php',{headers:authHeaders()});
    if(!d.success) throw new Error(d.message);
    panel.innerHTML = renderReportsTable(d.reports||[]);
  } catch(e){ panel.innerHTML = `<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`; }
}
function renderReportsTable(rows){
  if(!rows.length) return '<div class="empty">Sem denúncias</div>';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Título</th><th>Categoria</th><th>Status</th><th>Criado</th><th>Usuário</th><th>Ações</th></tr></thead><tbody>${rows.map(r=>`<tr data-id="${r.id}"><td>${r.id}</td><td>${escapeHtml(r.title)}</td><td>${escapeHtml(r.category||'')}</td><td><span class='status-badge status-${r.status}'>${r.status}</span></td><td>${r.created_at}</td><td>${escapeHtml(r.reporter_name||'')}</td><td>${reportActions(r)}</td></tr>`).join('')}</tbody></table></div>`;
}
function viewReport(id){
  openModal('<div class="loader"></div>','Detalhe Denúncia');
  fetch('api/adm_report_detail.php?id='+id,{headers:authHeaders()})
    .then(r=>r.json()).then(d=>{
      if(!d.success) return modalBody(`<div class='empty'>${escapeHtml(d.message||'Erro')}</div>`);
      const r=d.report;
    const html=`<div class='detail-block'>
        <div class='detail-grid'>
          <div><label>ID</label><div>#${r.id}</div></div>
          <div><label>Status</label><div><span class='status-badge status-${r.status}'>${r.status}</span></div></div>
          <div><label>Categoria</label><div>${escapeHtml(r.category||'')}</div></div>
          <div><label>Criado</label><div>${r.created_at}</div></div>
          <div class='col-100'><label>Título</label><div>${escapeHtml(r.title||'')}</div></div>
          <div class='col-100'><label>Descrição</label><div class='prewrap'>${escapeHtml(r.description||'')}</div></div>
          <div class='col-100'><label>Autor</label><div>${escapeHtml(r.reporter_name||'')} ${r.reporter_email?('('+escapeHtml(r.reporter_email)+')'):''}</div></div>
      ${r.scammer_name?`<div class='col-100'><label>Golpista</label><div>${escapeHtml(r.scammer_name)} ${r.scammer_email?(' - '+escapeHtml(r.scammer_email)) : ''}</div></div>`:''}
      ${r.scammer_phone?`<div><label>Telefone Golpista</label><div>${escapeHtml(r.scammer_phone)}</div></div>`:''}
      ${r.loss_amount?`<div><label>Prejuízo</label><div>R$ ${r.loss_amount}</div></div>`:''}
        </div>
        <hr>
        <h4>Comentários (${d.comments.length}) &bull; Curtidas: ${d.likes}</h4>
        <div class='scroll-area'>${d.comments.map(c=>`<div class='mini-comment'><div class='mc-head'><strong>${escapeHtml(c.user_name||'')}</strong><span>${c.created_at}</span></div><div>${escapeHtml(c.comment)}</div></div>`).join('')||'<div class="empty">Sem comentários</div>'}</div>
        <div class='modal-actions'>
          <button class='btn outline' onclick='closeModal()'>Fechar</button>
          <button class='btn danger' onclick='confirmReportStatus(${r.id},"rejeitar")'>Rejeitar</button>
          <button class='btn' style='background:var(--primary)' onclick='confirmReportStatus(${r.id},"aprovar")'>Aprovar</button>
        </div>
      </div>`;
      modalBody(html);
    }).catch(e=>modalBody(`<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`));
}
function reportActions(r){
  const baseBtn = (label, act, cls='comment-action-btn')=>`<button class='${cls}' data-act='${act}' data-id='${r.id}' onclick='reportAction(${r.id},"${act}")'>${label}</button>`;
  let acts = [];
  if(r.status!=='approved') acts.push(baseBtn('Aprovar','approve'));
  if(r.status!=='rejected') acts.push(baseBtn('Rejeitar','reject','comment-action-btn danger'));
  if(r.status!=='pending') acts.push(baseBtn('Pendente','pend'));
  acts.push(baseBtn('Ver','view'));
  return acts.join(' ');
}
async function reportAction(id, action){
  if(action==='view') return viewReport(id);
  const row = document.querySelector(`tr[data-id="${id}"]`);
  if(!row) return;
  const badge = row.querySelector('.status-badge');
  const old = badge ? badge.textContent : '';
  if(!confirm(`Confirmar ação "${action}" no relatório #${id}?`)) return;
  try {
    const r = await fetch('api/adm_report_update.php',{method:'POST',headers:authHeaders(),body:JSON.stringify({id,action})});
    const d = await r.json();
    if(!d.success) throw new Error(d.message||'Falha');
    if(badge){
      badge.textContent = d.status;
      badge.className = `status-badge status-${d.status}`;
    }
    // Re-render actions
    const cellActs = row.querySelector('td:last-child');
    if(cellActs){
      const data = {id, status:d.status, title: row.children[1].textContent, category: row.children[2].textContent, reporter_name: row.children[5].textContent, created_at: row.children[4].textContent};
      cellActs.innerHTML = reportActions(data);
    }
  } catch(e){
    if(badge) badge.textContent = old;
    alert('Erro: '+e.message);
  }
}

async function loadCommentsModeration(panel){
  try {
    const r = await fetch('api/adm_comments.php',{headers:authHeaders()});
    const d = await r.json();
    if(!d.success) throw new Error(d.message);
    panel.innerHTML = renderCommentsTable(d.comments||[]);
  } catch(e){ panel.innerHTML = `<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`; }
}
function renderCommentsTable(rows){
  if(!rows.length) return '<div class="empty">Sem comentários</div>';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Denúncia</th><th>Usuário</th><th>Comentário</th><th>Data</th><th>Ações</th></tr></thead><tbody>${rows.map(c=>`<tr><td>${c.id}</td><td>#${c.report_id} ${escapeHtml(c.report_title||'')}</td><td>${escapeHtml(c.user_name||'')}</td><td>${escapeHtml(c.comment.slice(0,120))}${c.comment.length>120?'...':''}</td><td>${c.created_at}</td><td><button class='comment-action-btn danger' onclick='deleteCommentAdm(${c.id})'>Remover</button></td></tr>`).join('')}</tbody></table></div>`;
}
async function deleteCommentAdm(id){ if(!confirm('Remover comentário #'+id+'?')) return; try{ const r=await fetch('api/adm_comment_delete.php',{method:'POST',headers:authHeaders(),body:JSON.stringify({id})}); const d=await r.json(); if(!d.success) throw new Error(d.message); loadView('comments'); }catch(e){ alert('Erro: '+e.message);} }

async function loadUsers(panel){
  try {
    const r = await fetch('api/adm_users.php',{headers:authHeaders()});
    const d = await r.json();
    if(!d.success) throw new Error(d.message);
    panel.innerHTML = renderUsersTable(d.users||[]);
  } catch(e){ panel.innerHTML = `<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`; }
}
function renderUsersTable(rows){
  if(!rows.length) return '<div class="empty">Sem usuários</div>';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Nome</th><th>Email</th><th>Provider</th><th>Criado</th><th>Ações</th></tr></thead><tbody>${rows.map(u=>`<tr><td>${u.id}</td><td>${escapeHtml(u.name||'')}</td><td>${escapeHtml(u.email||'')}</td><td>${u.provider||''}</td><td>${u.created_at}</td><td><button class='comment-action-btn' onclick='viewUser(${u.id})'>Ver</button></td></tr>`).join('')}</tbody></table></div>`;
}
function viewUser(id){
  openModal('<div class="loader"></div>','Detalhe Usuário');
  fetch(ADM_API+'/adm_user_detail.php?id='+id,{headers:authHeaders()})
   .then(async r=>{ const text= await r.text(); try { return JSON.parse(text); } catch(e){ throw new Error('Falha parse JSON. Resposta bruta:\n'+text.slice(0,800)); } })
   .then(d=>{
     if(!d.success) return modalBody(`<div class='empty'>${escapeHtml(d.message||'Erro')}</div>`);
     const u=d.user;
  const counts = d.counts||{};
  const profile = d.profile_report||{};
     const reports = d.reports||[];
     const likes = d.likes_recent||[];
  const statusCounts = counts.report_status||{};
  const statusHtml = Object.keys(statusCounts).length ? Object.entries(statusCounts).map(([k,v])=>`<span class='mini-stat'>${escapeHtml(k)}: <strong>${v}</strong></span>`).join('') : '';
   const displayName = u.full_name || u.name;
   const html=`<div class='detail-block'>
       <div class='detail-grid'>
         <div><label>ID</label><div>#${u.id}</div></div>
         <div><label>Nome Completo</label><div>${escapeHtml(displayName||'')}</div></div>
         <div><label>Email</label><div>${escapeHtml(u.email||'')}</div></div>
         <div><label>Provider</label><div>${escapeHtml(u.provider||'')}</div></div>
         <div><label>Criado</label><div>${u.created_at}</div></div>
         ${u.phone?`<div><label>Telefone</label><div>${escapeHtml(u.phone)}</div></div>`:''}
         ${profile.reporter_city?`<div><label>Cidade (última denúncia)</label><div>${escapeHtml(profile.reporter_city)}</div></div>`:''}
         ${profile.reporter_phone?`<div><label>Telefone (última denúncia)</label><div>${escapeHtml(profile.reporter_phone)}</div></div>`:''}
         ${d.cpf_full?`<div><label>CPF</label><div>${escapeHtml(d.cpf_full.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'))}</div></div>`:(d.cpf_last2?`<div><label>CPF</label><div>***${escapeHtml(d.cpf_last2)}</div></div>`:'')}
       </div>
       <div class='stat-row'>
         <div class='mini-stat'>Denúncias <strong>${counts.reports||0}</strong></div>
         <div class='mini-stat'>Comentários <strong>${counts.comments||0}</strong></div>
         <div class='mini-stat'>Curtidas <strong>${counts.likes||0}</strong></div>
         <div class='mini-stat'>Logins(10) <strong>${(d.logins||[]).length}</strong></div>
         <div class='mini-stat'>OK <strong style='color:#2e8b57'>${counts.logins_success||0}</strong></div>
         <div class='mini-stat'>Falhas <strong style='color:#e54848'>${counts.logins_failed||0}</strong></div>
         ${counts.first_report_at?`<div class='mini-stat'>1ª Denúncia <strong>${counts.first_report_at}</strong></div>`:''}
         ${counts.last_report_at?`<div class='mini-stat'>Últ. Denúncia <strong>${counts.last_report_at}</strong></div>`:''}
         ${d.has_cpf_hash?`<div class='mini-stat'>CPF Hash ✔</div>`:''}
       </div>
       ${statusHtml?`<div class='stat-row' style='margin-top:-.3rem'>${statusHtml}</div>`:''}
       <div class='detail-sections'>
         <div class='detail-section'>
           <h4>Últimos Logins</h4>
           <div class='scroll-area small'>${(d.logins||[]).map(l=>`<div class='mini-row'><span>${l.created_at}</span><code>${escapeHtml(l.ip||'')}</code> ${l.success?'✔':'✖'}</div>`).join('')||'<div class="empty mini">Sem logins</div>'}</div>
         </div>
         <div class='detail-section'>
           <h4>Denúncias Recentes</h4>
           <div class='scroll-area small'>${reports.map(r=>`<div class='mini-row'><strong>#${r.id}</strong> ${escapeHtml(r.title||'')} <span style='opacity:.6'>${r.status}</span><span style='margin-left:auto'>${r.created_at}</span></div>`).join('')||'<div class="empty mini">Sem denúncias</div>'}</div>
         </div>
         <div class='detail-section'>
           <h4>Curtidas Recentes</h4>
           <div class='scroll-area small'>${likes.map(l=>`<div class='mini-row'><strong>#${l.report_id}</strong> ${escapeHtml(l.title||'')} <span style='margin-left:auto'>${l.created_at}</span></div>`).join('')||'<div class="empty mini">Sem curtidas</div>'}</div>
         </div>
         <div class='detail-section'>
           <h4>Comentários Recentes</h4>
           <div class='scroll-area small'>${(d.comments||[]).map(c=>`<div class='mini-comment'><div class='mc-head'><strong>#${c.report_id}</strong><span>${c.created_at}</span></div><div>${escapeHtml(c.comment)}</div></div>`).join('')||'<div class="empty mini">Sem comentários</div>'}</div>
         </div>
       </div>
       <div class='modal-actions'>
         <button class='btn outline' onclick='closeModal()'>Fechar</button>
       </div>
     </div>`;
     modalBody(html);
     // widen modal dynamically
     const wrap=document.getElementById('admModal');
     if(wrap){ const box=wrap.querySelector('.modal-box'); if(box) box.classList.add('wide'); }
  }).catch(e=>modalBody(`<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`));
}

function viewComment(id){
  openModal('<div class="loader"></div>','Comentário');
  fetch(ADM_API+'/adm_comment_detail.php?id='+id,{headers:authHeaders()})
   .then(r=>r.json()).then(d=>{
     if(!d.success) return modalBody(`<div class='empty'>${escapeHtml(d.message||'Erro')}</div>`);
     const c=d.comment;
     modalBody(`<div class='detail-block'>
       <div class='detail-grid'>
         <div><label>ID</label><div>#${c.id}</div></div>
         <div><label>Denúncia</label><div>#${c.report_id} ${escapeHtml(c.report_title||'')}</div></div>
         <div><label>Usuário</label><div>${escapeHtml(c.user_name||'')} (${escapeHtml(c.user_email||'')})</div></div>
         <div><label>Data</label><div>${c.created_at}</div></div>
       </div>
       <hr>
       <div class='prewrap'>${escapeHtml(c.comment)}</div>
       <div class='modal-actions'>
         <button class='btn outline' onclick='closeModal()'>Fechar</button>
         <button class='btn danger' onclick='deleteCommentAdm(${c.id});closeModal()'>Remover</button>
       </div>
     </div>`);
   }).catch(e=>modalBody(`<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`));
}

function confirmReportStatus(id,acao){
  if(!confirm('Confirmar '+acao+' denúncia #'+id+'?')) return;
  let action = acao==='aprovar'?'approve':(acao==='rejeitar'?'reject':'pend');
  reportAction(id,action);
  closeModal();
}

// Modal Helpers
function openModal(content,title){
  let wrap=document.getElementById('admModal');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='admModal';
    wrap.className='modal-backdrop';
    wrap.innerHTML=`<div class='modal-box'><div class='modal-head'><h3></h3><button class='close-x' onclick='closeModal()'>×</button></div><div class='modal-content'></div></div>`;
    document.body.appendChild(wrap);
  }
  wrap.querySelector('.modal-content').innerHTML=content;
  wrap.querySelector('h3').textContent=title||'';
  wrap.style.display='flex';
}
function modalBody(html){ const wrap=document.getElementById('admModal'); if(wrap) wrap.querySelector('.modal-content').innerHTML=html; }
function closeModal(){ const wrap=document.getElementById('admModal'); if(wrap) wrap.style.display='none'; }

async function loadLogins(panel){
  try {
  const r= await fetch(ADM_API+'/adm_login_events.php',{headers:authHeaders()});
    const d= await r.json();
    if(!d.success) throw new Error(d.message);
    panel.innerHTML = renderLoginsTable(d.events||[]);
  } catch(e){ panel.innerHTML = `<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`; }
}
function renderLoginsTable(rows){
  if(!rows.length) return '<div class="empty">Sem eventos de login</div>';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Tipo</th><th>Principal</th><th>IP</th><th>OK</th><th>Data</th></tr></thead><tbody>${rows.map(ev=>`<tr><td>${ev.id}</td><td>${ev.user_type}</td><td>${ev.principal_id}</td><td class='ip-cell'>${ev.ip||''}</td><td>${ev.success? '✔':'✖'}</td><td>${ev.created_at}</td></tr>`).join('')}</tbody></table></div>`;
}

async function loadAudit(panel){
  try {
  const r= await fetch(ADM_API+'/adm_audit_log.php',{headers:authHeaders()});
    const d= await r.json();
    if(!d.success) throw new Error(d.message);
    panel.innerHTML = renderAuditTable(d.logs||[]);
  } catch(e){ panel.innerHTML = `<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`; }
}
function renderAuditTable(rows){
  if(!rows.length) return '<div class="empty">Sem logs ainda</div>';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>ID</th><th>Ação</th><th>Tipo</th><th>Target</th><th>Admin</th><th>Data</th></tr></thead><tbody>${rows.map(l=>`<tr><td>${l.id}</td><td>${escapeHtml(l.action)}</td><td>${l.target_type||''}</td><td>${l.target_id||''}</td><td>${escapeHtml(l.admin_name||'')}</td><td>${l.created_at}</td></tr>`).join('')}</tbody></table></div>`;
}
async function loadAnalytics(panel){
  panel.innerHTML=`<div class='analytics-controls'>
    <form id='anaForm' class='ana-form'>
      <label>Início <input type=date name=start></label>
      <label>Fim <input type=date name=end></label>
      <label>Ou últimos
        <select name=days>
          <option value=7>7</option>
          <option value=14 selected>14</option>
          <option value=30>30</option>
          <option value=60>60</option>
          <option value=90>90</option>
        </select> dias
      </label>
      <button class='btn primary' type=submit>Atualizar</button>
      <button class='btn outline' type=button id='btnClearRange'>Limpar Range</button>
    </form>
    <div class='ana-charts'>
      <div class='card-block big'><h3>Séries Principais</h3><canvas id='anaMain' height='260'></canvas></div>
      <div class='card-block'><h3>Status Diário (Stack)</h3><canvas id='anaStatus' height='170'></canvas></div>
      <div class='card-block'><h3>Top Categorias</h3><canvas id='anaCats' height='240'></canvas></div>
    </div>`;
  document.getElementById('anaForm').onsubmit=(e)=>{e.preventDefault(); fetchAnalytics();};
  document.getElementById('btnClearRange').onclick=()=>{ const f=document.getElementById('anaForm'); f.start.value=''; f.end.value=''; fetchAnalytics(); };
  fetchAnalytics();
  async function fetchAnalytics(){
    const f=document.getElementById('anaForm');
    let qs=[]; if(f.start.value && f.end.value){ qs.push('start='+f.start.value,'end='+f.end.value); } else { qs.push('days='+f.days.value); }
  const url=ADM_API+'/adm_analytics.php?'+qs.join('&');
    panel.querySelector('#anaMain').classList.add('loading-canvas');
    try {
      const r= await fetch(url,{headers:authHeaders()}); const d= await r.json(); if(!d.success) throw new Error(d.message||'Falha');
      renderAnalyticsCharts(d);
    } catch(e){ panel.querySelector('.ana-charts').innerHTML=`<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`; }
  }
}

function renderAnalyticsCharts(d){
  miniChartMulti('anaMain',[{k:'reports',c:'#2e8b57',label:'Denúncias'},{k:'users',c:'#3c9ad6',label:'Usuários'},{k:'comments',c:'#f5a623',label:'Comentários'},{k:'likes',c:'#c678dd',label:'Curtidas'}],d);
  stackedStatusChart('anaStatus', d.status_daily);
  horizBarCats('anaCats', d.top_categories);
  const main=document.getElementById('anaMain'); if(main) main.classList.remove('loading-canvas');
}

// ===== STATUS VIEW =====
async function loadStatus(panel){
  panel.innerHTML = `<div class="card-block"><h3>Status do Sistema</h3><div id="statusWrap" class="status-grid"><div class='loader'></div></div><div class="status-actions"><button class="btn outline" id="btnRefreshStatus">Atualizar</button><small id="statusTimestamp" style="margin-left:.75rem;color:#88939d"></small></div></div>`;
  const btn=document.getElementById('btnRefreshStatus');
  btn.onclick=fetchStatus;
  fetchStatus();
  let interval = setInterval(fetchStatus, 60000); // refresh a cada 60s
  panel.dataset.statusInterval='1';
  function unload(){ if(interval){ clearInterval(interval); interval=null; } }
  // limpar quando mudar de aba
  const observer = new MutationObserver(()=>{ if(!panel.contains(btn)){ unload(); observer.disconnect(); } });
  observer.observe(document.body,{childList:true,subtree:true});
  async function fetchStatus(){
    btn.disabled=true; btn.textContent='Atualizando...';
    try {
      const r= await fetch('api/adm_status.php',{headers:authHeaders()});
      const d= await r.json();
      if(!d.success) throw new Error(d.message||'Falha');
      renderStatus(d);
    } catch(e){
      document.getElementById('statusWrap').innerHTML = `<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`;
    } finally { btn.disabled=false; btn.textContent='Atualizar'; document.getElementById('statusTimestamp').textContent='Atualizado: '+ new Date().toLocaleTimeString('pt-BR'); }
  }
}

function renderStatus(d){
  const wrap=document.getElementById('statusWrap'); if(!wrap) return;
  const pill=(val,label,cls='')=>`<div class='status-pill ${cls}'><label>${label}</label><strong>${escapeHtml(val==null?'-':String(val))}</strong></div>`;
  const stateColor = d.state==='operacional'?'ok':(d.state==='lento'?'slow':'warn');
  wrap.innerHTML = `
    <div class='status-col'>
      <h4>Serviço</h4>
      ${pill(d.state,'Estado', stateColor)}
      ${pill(d.db_latency_ms+' ms','Latência DB', d.db_latency_ms>800?'warn':(d.db_latency_ms>400?'slow':'ok'))}
      ${pill(d.active_sessions_15m,'Sessões 15m','')}
      ${pill(d.errors_24h,'Erros 24h', d.errors_24h>50?'warn':(d.errors_24h>10?'slow':'ok'))}
    </div>
    <div class='status-col'>
      <h4>Última Atividade</h4>
      ${pill(formatDateTime(d.last_report_at),'Última denúncia')}
      ${pill(formatDateTime(d.last_user_signup),'Último cadastro')}
      ${pill(d.reports_1h,'Denúncias 1h')}
    </div>
    <div class='status-col'>
      <h4>Versões</h4>
      ${pill(d.php_version,'PHP')} 
      ${pill(d.db_server_version,'Banco')} 
    </div>`;
}

function formatDateTime(str){ if(!str) return '-'; try { const d=new Date(str.replace(' ','T')); return d.toLocaleString('pt-BR'); } catch(e){ return str; } }

// ===== SECURITY VIEW =====
async function loadSecurity(panel){
  panel.innerHTML = `
    <div class='sec-warning'>⚠ Área sensível. Se você não tem certeza do que está fazendo, NÃO execute testes ou alterações. Configurações incorretas podem comprometer segurança e estabilidade.</div>
    <div class='security-actions'><button class='btn outline' id='btnRefreshSec'>Atualizar</button><small id='secTimestamp' style='margin-left:.75rem;color:#88939d'></small></div>
    <div id='securityContent' class='security-grid'><div class='loader'></div></div>`;
  document.getElementById('btnRefreshSec').onclick=fetchSecurity;
  fetchSecurity();
  let itv=setInterval(fetchSecurity,120000); // 2min
  const observer=new MutationObserver(()=>{ if(!panel.contains(document.getElementById('securityContent'))){ clearInterval(itv); observer.disconnect(); }});
  observer.observe(document.body,{childList:true,subtree:true});
  async function fetchSecurity(){
    const btn=document.getElementById('btnRefreshSec'); btn.disabled=true; btn.textContent='Atualizando...';
    try {
      const r= await fetch('api/adm_security.php',{headers:authHeaders()});
      const d= await r.json();
      if(!d.success) throw new Error(d.message||'Falha');
      renderSecurity(d);
    } catch(e){
      document.getElementById('securityContent').innerHTML = `<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`;
    } finally { const btn=document.getElementById('btnRefreshSec'); if(btn){ btn.disabled=false; btn.textContent='Atualizar'; } document.getElementById('secTimestamp').textContent='Atualizado: '+ new Date().toLocaleTimeString('pt-BR'); }
  }
}

function renderSecurity(d){
  const wrap=document.getElementById('securityContent'); if(!wrap) return;
  const pill=(label,val,cls='')=>`<div class='sec-pill ${cls}'><label>${escapeHtml(label)}</label><strong>${escapeHtml(val==null?'-':String(val))}</strong></div>`;
  // Services table
  const svc = (d.services||[]).map(s=>`<tr><td>${escapeHtml(s.service)}</td><td>${s.port}</td><td>${s.ok?'✔':'✖'}</td><td>${s.latency_ms} ms</td></tr>`).join('') || '<tr><td colspan=4>Sem</td></tr>';
  // Active IPs separated (site users vs admins) with geolocation
  const formatLoc = ipObj => { if(!ipObj) return ''; const parts=[ipObj.city,ipObj.region,ipObj.country].filter(x=>x&&x!=='?'&&x!=='-'); return parts.join('/'); };
  const actSite = (d.active_site_ips||[]).map(ip=>{ const loc=formatLoc(ip); const titleParts=[`Último: ${ip.last_seen||''}`]; if(loc) titleParts.push(`Local: ${loc}`); return `<div><code>${escapeHtml(ip.ip||'-')}</code>${loc?` <small style='opacity:.55;margin-left:4px'>${escapeHtml(loc)}</small>`:''}<span title='${escapeHtml(titleParts.join(" \\n"))}' style='opacity:.75'>${ip.c}</span></div>`; }).join('') || '<div class="empty mini">Nenhum</div>';
  const actAdm = (d.active_admin_ips||[]).map(ip=>{ const loc=formatLoc(ip); const titleParts=[`Último: ${ip.last_seen||''}`]; if(loc) titleParts.push(`Local: ${loc}`); return `<div><code>${escapeHtml(ip.ip||'-')}</code>${loc?` <small style='opacity:.55;margin-left:4px'>${escapeHtml(loc)}</small>`:''}<span title='${escapeHtml(titleParts.join(" \\n"))}' style='opacity:.75'>${ip.c}</span></div>`; }).join('') || '<div class="empty mini">Nenhum</div>';
  wrap.innerHTML = `
    <div class='sec-col'>
      <h4>Resumo</h4>
      ${pill('Falhas login 24h', d.failed_logins_24h, d.failed_logins_24h>100?'warn':(d.failed_logins_24h>30?'slow':'ok'))}
      ${pill('IPs brute force (6h)', d.suspicious_bruteforce.length, d.suspicious_bruteforce.length>0?'warn':'ok')}
      ${pill('User-Agents suspeitos', d.suspicious_user_agents.length, d.suspicious_user_agents.length>0?'slow':'ok')}
      ${pill('Erros admin 24h', d.admin_errors_24h)}
      ${pill('Latência DB', d.db_latency_ms!=null? (d.db_latency_ms+' ms'):'-', d.db_latency_ms>800?'warn':(d.db_latency_ms>400?'slow':'ok'))}
      ${pill('DNS (ms)', d.dns_time_ms)}
      ${pill('Host', d.network_host)}
      ${pill('IP Servidor', d.network_ip)}
  <small style='font-size:.5rem;color:#76828b;margin-top:.25rem'>Escudo ativo (heurísticas UA, payload, taxa)</small>
    </div>
    <div class='sec-col'>
      <h4>Top IPs Falhas (24h)</h4>
      <div class='mini-list'>${d.top_failed_ips.map(i=>`<div><code>${escapeHtml(i.ip||'-')}</code><span>${i.c}</span></div>`).join('')||'<div class="empty mini">Nenhum</div>'}</div>
    </div>
    <div class='sec-col'>
      <h4>Brute Force (6h)</h4>
      <div class='mini-list'>${d.suspicious_bruteforce.map(i=>`<div><code>${escapeHtml(i.ip||'-')}</code><span>${i.c}</span></div>`).join('')||'<div class="empty mini">Nenhum</div>'}</div>
    </div>
    <div class='sec-col'>
      <h4>User-Agents Suspeitos</h4>
      <div class='mini-list long'>${d.suspicious_user_agents.map(u=>`<div title='${escapeHtml(u.user_agent)}'><code>${escapeHtml(truncateUa(u.user_agent))}</code><span>${u.c}</span></div>`).join('')||'<div class="empty mini">Nenhum</div>'}</div>
    </div>
    <div class='sec-col'>
      <h4>Serviços</h4>
      <div class='table-wrap mini'><table class='table mini'><thead><tr><th>Serviço</th><th>Porta</th><th>OK</th><th>Lat.</th></tr></thead><tbody>${svc}</tbody></table></div>
    </div>
    <div class='sec-col'>
      <h4>IPs Site (5m)</h4>
      <div class='mini-list long'>${actSite}</div>
    </div>
    <div class='sec-col'>
      <h4>IPs Painel (15m)</h4>
      <div class='mini-list long'>${actAdm}</div>
    </div>`;
  // Append blacklist candidates panel if exists
  if(d.blacklist_candidates){
    const blk = document.createElement('div'); blk.className='sec-col blk-col';
    blk.innerHTML = `<h4>Blacklist (IPs)</h4><div class='mini-list long'>${d.blacklist_candidates.length? d.blacklist_candidates.map(i=>`<div title='Falhas 24h: ${i.failed_24h}\nFalhas 6h: ${i.failed_6h}\nTotal: ${i.failed_total}\nÚltimo: ${escapeHtml(i.last_attempt||'')}\nClassificação: ${i.classification}\nAgentes: ${escapeHtml(i.sample_agents.join('; '))}'><code>${escapeHtml(i.ip)}</code><span>${i.failed_24h}</span></div>`).join('') : '<div class="empty mini">Nenhum</div>'}</div>`;
    wrap.appendChild(blk);
  }
}

function truncateUa(ua){ if(!ua) return '-'; return ua.length>42? ua.slice(0,40)+'…': ua; }

function miniChartMulti(id,seriesList,data){
  const cv=document.getElementById(id); if(!cv) return; const ctx=cv.getContext('2d');
  const dpr=window.devicePixelRatio||1;
  if(!cv.dataset.baseh){ cv.dataset.baseh = cv.getAttribute('height')||cv.clientHeight||200; }
  const baseH=parseInt(cv.dataset.baseh,10);
  cv.width=cv.clientWidth*dpr; cv.height=baseH*dpr; ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr);
  ctx.clearRect(0,0,cv.clientWidth,baseH);
  const allDates = (data.reports||[]).map(r=>r.d);
  const max = Math.max(1,...seriesList.map(s=> (data[s.k]||[]).reduce((m,p)=> p.c>m?p.c:m,0)));
  seriesList.forEach(s=>{
    const pts=(data[s.k]||[]);
    ctx.beginPath(); ctx.lineWidth=2; ctx.strokeStyle=s.c; ctx.globalAlpha=1;
    pts.forEach((p,i)=>{ const x=(i/(pts.length-1||1))*(cv.clientWidth-6)+3; const y=(1-(p.c/max))*(baseH-20)+10; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
    ctx.stroke();
  });
  // legend
  let lx=6, ly=8; ctx.font='10px system-ui'; ctx.textBaseline='middle';
  seriesList.forEach(s=>{ ctx.fillStyle=s.c; ctx.fillRect(lx,ly-5,12,10); ctx.fillStyle='#c9d2d8'; ctx.fillText(s.label,lx+16,ly); ly+=14; });
  enableTooltip(cv,(mx,my)=>{
    // encontrar índice mais próximo pela posição x
    const ptsLen = (data.reports||[]).length;
    if(!ptsLen) return null;
    const idx = Math.round((mx-3)/(cv.clientWidth-6)*(ptsLen-1));
    const date = (data.reports||[])[idx]?.d;
    if(!date) return null;
    let lines=[]; lines.push({label:date,value:''});
    seriesList.forEach(s=>{ const val = (data[s.k]||[])[idx]?.c || 0; lines.push({color:s.c,label:s.label,value:val}); });
    return {title:date, lines};
  });
}

function stackedStatusChart(id,rows){
  const cv=document.getElementById(id); if(!cv) return; const ctx=cv.getContext('2d'); const dpr=window.devicePixelRatio||1;
  if(!cv.dataset.baseh){ cv.dataset.baseh = cv.getAttribute('height')||cv.clientHeight||180; }
  const H=parseInt(cv.dataset.baseh,10); const W=cv.clientWidth; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr); ctx.clearRect(0,0,W,H);
  const totals=rows.map(r=>r.approved+r.rejected+r.pending);
  const max=Math.max(1,...totals);
  rows.forEach((r,i)=>{
    const x=(i/(rows.length-1||1))*(W-10)+5; const barW=Math.max(3,(W/(rows.length*1.5)));
    let y=H-5;
    const seg=[[r.pending,'#7a4e00'],[r.rejected,'#5b1e23'],[r.approved,'#1d6f47']];
    seg.forEach(([v,color])=>{ const h=(v/max)*(H-20); ctx.fillStyle=color; ctx.fillRect(x-barW/2,y-h,barW,h); y-=h; });
  });
  enableTooltip(cv,(mx,my)=>{
    if(!rows.length) return null;
    const idx=Math.round((mx-5)/(W-10)*(rows.length-1));
    const r=rows[idx]; if(!r) return null;
    return {title:r.d, lines:[
      {color:'#1d6f47', label:'Aprovadas', value:r.approved},
      {color:'#5b1e23', label:'Rejeitadas', value:r.rejected},
      {color:'#7a4e00', label:'Pendentes', value:r.pending}
    ]};
  });
}

function horizBarCats(id,cats){
  const cv=document.getElementById(id); if(!cv) return; const ctx=cv.getContext('2d'); const dpr=window.devicePixelRatio||1;
  if(!cv.dataset.baseh){ cv.dataset.baseh = cv.getAttribute('height')||cv.clientHeight||240; }
  const H=parseInt(cv.dataset.baseh,10); const W=cv.clientWidth; cv.width=W*dpr; cv.height=H*dpr; ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr); ctx.clearRect(0,0,W,H);
  const list=[...(cats||[])]; list.reverse(); // desenhar do menor para maior
  const max=Math.max(1,...list.map(c=>parseInt(c.c)));
  const rowH=(H-20)/list.length;
  ctx.font='11px system-ui'; ctx.textBaseline='middle';
  list.forEach((c,i)=>{ const y=10+i*rowH+rowH/2; const w=(parseInt(c.c)/max)*(W-140); ctx.fillStyle='#2e8b57'; ctx.fillRect(120,y-rowH/3,w,rowH/1.5); ctx.fillStyle='#c9d2d8'; ctx.fillText(c.category,6,y); ctx.fillText(c.c,130+w,y); });
  enableTooltip(cv,(mx,my)=>{
    if(!list.length) return null;
    const idx=Math.floor((my-10)/rowH); const item=list[idx]; if(!item) return null;
    return {title:item.category, lines:[{color:'#2e8b57',label:'Ocorrências',value:item.c}]};
  });
}

// Tooltip system (vanilla)
let chartTooltipEl=null; function ensureTooltip(){ if(!chartTooltipEl){ chartTooltipEl=document.createElement('div'); chartTooltipEl.className='chart-tooltip'; document.body.appendChild(chartTooltipEl);} return chartTooltipEl; }
function enableTooltip(canvas, builder){
  canvas.onmousemove = e=>{
    const rect=canvas.getBoundingClientRect(); const x=e.clientX-rect.left; const y=e.clientY-rect.top;
    const data=builder(x,y); const tt=ensureTooltip(); if(!data){ tt.style.display='none'; return; }
    let html=`<div class='tt-title'>${escapeHtml(data.title)}</div>`;
    data.lines.forEach(l=>{ if(!l.label) return; const box=l.color?`<span style='display:inline-block;width:10px;height:10px;background:${l.color};border-radius:2px;margin-right:6px'></span>`:''; html+=`<div class='tt-line'>${box}${escapeHtml(l.label)}: <strong>${l.value}</strong></div>`; });
    tt.innerHTML=html; tt.style.display='block'; tt.style.left=(e.clientX+12)+'px'; tt.style.top=(e.clientY+12)+'px';
  };
  canvas.onmouseleave=()=>{ if(chartTooltipEl) chartTooltipEl.style.display='none'; };
}

// Dashboard analytics composite
async function loadDashboard(panel){
  panel.innerHTML = '<div class="loader"></div>';
  try {
    const r = await fetch('api/adm_analytics.php',{headers:authHeaders()});
    const d = await r.json();
    if(!d.success) throw new Error(d.message||'Falha analytics');
    panel.innerHTML = renderDashboard(d);
    renderMiniLine('chartReports', d.reports, '#2e8b57');
    renderMiniLine('chartUsers', d.users, '#3c9ad6');
    renderMiniLine('chartComments', d.comments, '#f5a623');
    renderMiniLine('chartLikes', d.likes, '#c678dd');
  } catch(e){ panel.innerHTML = `<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`; }
}

function renderDashboard(d){
  return `
  <div class='dash-flex'>
    <div class='dash-col'>
      ${chartCard('Denúncias últimos dias','chartReports')}
      ${chartCard('Usuários novos','chartUsers')}
    </div>
    <div class='dash-col'>
      ${chartCard('Comentários','chartComments')}
      ${chartCard('Curtidas','chartLikes')}
    </div>
    <div class='dash-col'>
      ${matrixStatusCard(d.status_30d)}
      ${topCategoriesCard(d.top_categories)}
    </div>
  </div>`;
}
function chartCard(label, id){
  return `<div class='card-block'><h3>${escapeHtml(label)}</h3><div class='mini-chart'><canvas id='${id}'></canvas></div></div>`;
}
function matrixStatusCard(st){
  if(!st) return '<div class="card-block"><h3>Status 30 dias</h3><div class="empty">Sem dados</div></div>';
  const total = (st.approved||0)+(st.rejected||0)+(st.pending||0);
  const pct = v=> total? ((v/total*100).toFixed(1)+'%'):'0%';
  return `<div class='card-block'><h3>Status 30 dias</h3>
    <table class='matrix-table'>
      <thead><tr><th>Status</th><th>Qtd</th><th>%</th></tr></thead>
      <tbody>
        <tr><td>Aprovado</td><td>${st.approved||0}</td><td>${pct(st.approved)}</td></tr>
        <tr><td>Rejeitado</td><td>${st.rejected||0}</td><td>${pct(st.rejected)}</td></tr>
        <tr><td>Pendente</td><td>${st.pending||0}</td><td>${pct(st.pending)}</td></tr>
      </tbody>
    </table>
  </div>`;
}
function topCategoriesCard(list){
  if(!list || !list.length) return '<div class="card-block"><h3>Top Categorias</h3><div class="empty">Sem dados</div></div>';
  return `<div class='card-block'><h3>Top Categorias</h3><table class='matrix-table'><thead><tr><th>Categoria</th><th>Qtd</th></tr></thead><tbody>${list.map(c=>`<tr><td style='text-align:left'>${escapeHtml(c.category)}</td><td>${c.c}</td></tr>`).join('')}</tbody></table></div>`;
}
function renderMiniLine(id, data, color){
  const el=document.getElementById(id); if(!el) return; const ctx=el.getContext('2d');
  const pts=(data||[]).map(r=>({d:r.d,c:parseInt(r.c)}));
  const max=pts.reduce((m,p)=>p.c>m?p.c:m,0)||1;
  const w=el.width=el.clientWidth*2; const h=el.height=el.clientHeight*2; ctx.scale(2,2);
  ctx.lineWidth=2; ctx.strokeStyle=color; ctx.beginPath();
  pts.forEach((p,i)=>{ const x=(i/(pts.length-1||1))*(el.clientWidth-4)+2; const y=(1-(p.c/max))*(el.clientHeight-4)+2; if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); });
  ctx.stroke();
  const grd=ctx.createLinearGradient(0,0,0,el.clientHeight); grd.addColorStop(0,hexToRgba(color,0.35)); grd.addColorStop(1,hexToRgba(color,0));
  ctx.lineTo(el.clientWidth-2,el.clientHeight-2); ctx.lineTo(2,el.clientHeight-2); ctx.closePath(); ctx.fillStyle=grd; ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,el.clientHeight-0.5); ctx.lineTo(el.clientWidth,el.clientHeight-0.5); ctx.stroke();
}
function hexToRgba(hex,a){ if(hex.startsWith('#')) hex=hex.slice(1); if(hex.length===3) hex=hex.split('').map(c=>c+c).join(''); const num=parseInt(hex,16); const r=(num>>16)&255,g=(num>>8)&255,b=num&255; return `rgba(${r},${g},${b},${a})`; }

function escapeHtml(str){ return (str||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

buildNav(); userBox(); loadKpis(); loadView('dash');
// --- Notificações de novas denúncias ---
let lastReportId = 0; let reportBadgeEl=null; let reportsBtn=null;
function initReportBadge(){
  const nav=document.getElementById('mainNav');
  reportsBtn=[...nav.querySelectorAll('button')].find(b=>b.textContent.trim()==='Denúncias');
  if(reportsBtn){
    reportBadgeEl=document.createElement('span'); reportBadgeEl.className='nav-badge'; reportBadgeEl.style.display='none'; reportsBtn.appendChild(reportBadgeEl);
  }
}
initReportBadge();
async function pollReportsHead(){
  try {
    const r= await fetch('api/adm_reports_head.php?last='+lastReportId,{headers:authHeaders()});
    const d= await r.json(); if(!d.success) throw 0; if(d.max_id>lastReportId){
      if(lastReportId>0 && d.new>0 && reportBadgeEl){ reportBadgeEl.textContent=d.new>99?'99+':d.new; reportBadgeEl.style.display='inline-block'; }
      lastReportId=d.max_id;
    }
  } catch(e){}
  setTimeout(pollReportsHead,12000);
}
pollReportsHead();
// Ao abrir a aba de denúncias limpa badge
const oldLoadView=loadView; loadView=function(id,btn){ oldLoadView(id,btn); if(id==='reports' && reportBadgeEl){ reportBadgeEl.style.display='none'; reportBadgeEl.textContent=''; } };

// ===== CLOUDFLARE VIEW =====
async function loadCloudflare(panel){
  // Password gate
  if(!window.__CF_UNLOCKED){
    // Restaura se já destravou nesta sessão admin
    if(sessionStorage.getItem('CF_UNLOCK')==='1'){
      window.__CF_UNLOCKED=true;
    } else {
      const pw = prompt('Senha de acesso Cloudflare:');
      if(pw!=='LIBERARWAF'){ panel.innerHTML='<div class="empty">Acesso negado.</div>'; return; }
      window.__CF_UNLOCKED=true; sessionStorage.setItem('CF_UNLOCK','1');
    }
  }
  panel.innerHTML = `<div class='sec-warning'>⚠ Área sensível. Se você não tem certeza do que está fazendo, NÃO execute testes ou alterações. Configurações incorretas podem comprometer segurança e estabilidade.</div><div class='card-block'><h3>Cloudflare</h3>
    <div id='cfStatus' class='cf-grid'><div class="loader"></div></div>
    <div class='cf-actions'>
      <button class='btn primary' id='btnCfToggle'>Alternar Dev Mode</button>
      <button class='btn outline' id='btnCfPause'>Pausar/Retomar</button>
      <button class='btn' id='btnCfPurge'>Limpar Cache</button>
      <button class='btn' id='btnCfDns'>Listar DNS</button>
      <small id='cfMsg' style='margin-left:1rem;color:#8aa2b4'></small>
    </div>
  </div>`;
  fetchCfStatus();
  document.getElementById('btnCfToggle').onclick=()=>cfAction('toggle_dev_mode');
  document.getElementById('btnCfPause').onclick=()=>cfAction('toggle_pause');
  document.getElementById('btnCfPurge').onclick=()=>cfAction('purge_cache');
  document.getElementById('btnCfDns').onclick=()=>cfAction('dns_records');
  async function fetchCfStatus(){
    try{ const r=await fetch('api/adm_cloudflare.php',{headers:authHeaders()}); const d=await r.json(); if(!d.success) throw new Error(d.message||'Falha'); renderCf(d); }
    catch(e){ document.getElementById('cfStatus').innerHTML = `<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`; }
  }
  async function cfAction(action){
    const msg=document.getElementById('cfMsg'); msg.textContent='Processando '+action+'...';
    try {
      const r= await fetch('api/adm_cloudflare.php',{method:'POST',headers:authHeaders(),body:JSON.stringify({action})});
      const d= await r.json();
      if(!d.success) throw new Error(d.message||'Falha');
      if(action==='dns_records'){
        openModal(renderDns(d.dns||[]),'DNS Records');
      }
      fetchCfStatus();
      msg.textContent='OK'; setTimeout(()=>msg.textContent='',2500);
    } catch(e){ msg.textContent='Erro: '+e.message; }
  }
  function renderCf(d){
    const wrap=document.getElementById('cfStatus'); if(!wrap) return;
    const services = (d.services||[]).map(s=>`<tr><td>${s.service}</td><td>${s.port}</td><td>${s.ok?'✔':'✖'}</td><td>${s.latency_ms} ms</td></tr>`).join('')||'<tr><td colspan=4>Sem dados</td></tr>';
    const ips = (d.top_failed_ips||[]).map(i=>`<tr><td><code>${escapeHtml(i.ip||'')}</code></td><td>${i.c}</td></tr>`).join('')||'<tr><td colspan=2>Nenhum</td></tr>';
  const warnCfg = !d.configured ? `<div class='cf-warn'>Cloudflare não configurado corretamente (defina CF_API_TOKEN e CF_ZONE_ID válidos no .env). Zone válida? ${d.zone_valid?'Sim':'Não'}</div>`:'';
  wrap.innerHTML = `
      <div class='cf-col'>
        <div class='cf-pill'><label>Dev Mode</label><strong class='${d.dev_mode==='on'?'warn':'ok'}'>${d.dev_mode==='on'?'On':'Off'}</strong></div>
    <div class='cf-pill'><label>Pausado</label><strong class='${d.paused==='on'?'warn':'ok'}'>${d.paused==='on'?'Sim':'Não'}</strong></div>
        <div class='cf-pill'><label>Último Purge</label><strong>${d.state.last_purge?formatDateTime(d.state.last_purge):'-'}</strong></div>
        <div class='cf-pill'><label>Zone</label><strong>${escapeHtml(d.zone||'-')}</strong></div>
    <div class='cf-pill'><label>Account</label><strong>${escapeHtml(d.account||'-')}</strong></div>
        <div class='cf-pill'><label>Configured</label><strong class='${d.configured?'ok':'warn'}'>${d.configured?'Sim':'Não'}</strong></div>
        <div class='cf-pill'><label>Server Host</label><strong>${escapeHtml(d.server_host||'-')}</strong></div>
        <div class='cf-pill'><label>Server IP</label><strong>${escapeHtml(d.server_ip||'-')}</strong></div>
      </div>
      <div class='cf-col'>
        <h4>Serviços</h4>
        <div class='table-wrap mini'>
          <table class='table mini'><thead><tr><th>Serviço</th><th>Porta</th><th>OK</th><th>Lat.</th></tr></thead><tbody>${services}</tbody></table>
        </div>
      </div>
      <div class='cf-col'>
        <h4>IPs Falhas 24h</h4>
        <div class='table-wrap mini'>
          <table class='table mini'><thead><tr><th>IP</th><th>Falhas</th></tr></thead><tbody>${ips}</tbody></table>
        </div>
  </div>${warnCfg}`;
  }
  function renderDns(list){
    if(!list.length) return '<div class="empty">Sem DNS</div>';
    return `<div class='table-wrap'><table class='table'><thead><tr><th>Tipo</th><th>Nome</th><th>Conteúdo</th><th>TTL</th><th>Proxied</th></tr></thead><tbody>${list.map(r=>`<tr><td>${r.type}</td><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.content)}</td><td>${r.ttl}</td><td>${r.proxied?'✔':''}</td></tr>`).join('')}</tbody></table></div>`;
  }
}

// ===== SITE CONTROL VIEW =====
async function loadSiteControl(panel){
  panel.innerHTML = `<div class='card-block'>
    <h3>Controle do Site</h3>
    <p class='help'>Gerencie modo de manutenção e execute testes rápidos de infraestrutura.</p>
    <div id='maintBox' class='maint-box'><div class='loader mini'></div></div>
    <div class='tests-block'>
      <h4>Testes Rápidos</h4>
      <div class='test-buttons'>
        <button class='btn outline' data-test='ping'>Ping</button>
        <button class='btn outline' data-test='db'>Banco</button>
        <button class='btn outline' data-test='cache'>Cache</button>
        <button class='btn outline' data-test='email'>Email</button>
      </div>
      <div id='testResults' class='mini-list long' style='margin-top:.75rem'></div>
    </div>
  </div>`;
  try {
    const r=await fetch('api/adm_site_control.php',{headers:authHeaders()});
    const d=await r.json();
    if(!d.success) throw new Error(d.message||'Falha');
    renderMaint(d.maintenance);
  } catch(e){ document.getElementById('maintBox').innerHTML = `<div class='empty'>Erro: ${escapeHtml(e.message)}</div>`; }

  function renderMaint(m){
    const box=document.getElementById('maintBox');
    const enabled = !!m.enabled;
    box.innerHTML = `
      <h4>Manutenção</h4>
      <label class='switch'>
        <input type='checkbox' id='maintToggle' ${enabled?'checked':''}>
        <span class='slider'></span>
      </label>
      <textarea id='maintMessage' rows='3' style='width:100%;margin-top:.5rem' placeholder='Mensagem de manutenção'>${escapeHtml(m.message||'')}</textarea>
      <div style='margin-top:.5rem;display:flex;gap:.5rem'>
        <button class='btn' id='btnSaveMaint'>Salvar</button>
        <button class='btn outline' id='btnDisableMaint'>Desligar</button>
      </div>
      <small style='display:block;margin-top:.35rem;opacity:.65'>Quando ativo, um banner aparece no topo do site público com esta mensagem.</small>
    `;
    document.getElementById('btnSaveMaint').onclick=()=>saveMaint(true);
    document.getElementById('btnDisableMaint').onclick=()=>saveMaint(false);
    document.getElementById('maintToggle').onchange=(e)=>saveMaint(e.target.checked,false);
  }

  async function saveMaint(forceEnabled, showMsg=true){
    const enabled = forceEnabled;
    const msg = document.getElementById('maintMessage').value.trim()||'Site em manutenção.';
    try {
      const r=await fetch('api/adm_site_control.php',{method:'POST',headers:authHeaders(),body:JSON.stringify({action:'set_maintenance',enabled,message:msg})});
      const d=await r.json(); if(!d.success) throw new Error(d.message||'Erro');
      if(showMsg && typeof toast==='function') toast('Manutenção '+(enabled?'ativada':'atualizada/desativada'));
      renderMaint(d.maintenance);
    } catch(e){ if(typeof toast==='function') toast('Erro: '+e.message,true); else alert('Erro: '+e.message); }
  }

  panel.querySelectorAll('[data-test]').forEach(btn=>{
    btn.onclick=()=>runTest(btn.getAttribute('data-test'), btn);
  });
  async function runTest(testName, btn){
    const resBox=document.getElementById('testResults'); btn.disabled=true; const txt=btn.textContent; btn.textContent='Executando...';
    try {
      const r=await fetch('api/adm_site_control.php',{method:'POST',headers:authHeaders(),body:JSON.stringify({action:'run_test',test:testName})});
      const d=await r.json(); if(!d.success) throw new Error(d.message||'Erro');
      const t=d.test; const cls=t.success?'ok':'fail';
      const line=`<div class='test-line ${cls}'><code>${escapeHtml(t.name)}</code><span>${t.success?'✔':'✖'}</span><small>${t.latency_ms} ms</small>${t.error?`<small style='opacity:.6;margin-left:6px'>${escapeHtml(t.error)}</small>`:''}</div>`;
      resBox.insertAdjacentHTML('afterbegin', line);
    } catch(e){ resBox.insertAdjacentHTML('afterbegin', `<div class='test-line fail'><code>${escapeHtml(testName)}</code><span>✖</span><small>${escapeHtml(e.message)}</small></div>`); }
    finally { btn.disabled=false; btn.textContent=txt; }
  }
}
