// Dashboard state
let currentPage = 'dashboard';
let userData = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  initializeNavigation();
  initializeLogout();
  loadPage('dashboard');
});

// Check authentication
async function checkAuth() {
  try {
    const response = await fetch('api/auth_check.php', {
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!data.authenticated) {
      window.location.href = 'index.html';
      return;
    }
    
    userData = data.user;
    updateUserInfo();
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = 'index.html';
  }
}

// Update user info in sidebar
function updateUserInfo() {
  const userInfo = document.getElementById('userInfo');
  if (userData) {
    const initials = userData.name ? userData.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD';
    userInfo.querySelector('.user-avatar').textContent = initials;
    userInfo.querySelector('.user-name').textContent = userData.name || 'Admin';
    userInfo.querySelector('.user-role').textContent = userData.role || 'Administrador';
  }
}

// Navigation
function initializeNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      
      // Update active state
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      
      // Load page
      loadPage(page);
    });
  });
}

// Logout
function initializeLogout() {
  const btnLogout = document.getElementById('btnLogout');
  
  btnLogout.addEventListener('click', async () => {
    try {
      await fetch('api/auth_logout.php', {
        method: 'POST',
        credentials: 'include'
      });
      
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = 'index.html';
    }
  });
}

// Load page content
async function loadPage(page) {
  currentPage = page;
  updateBreadcrumb(page);
  
  const kpiGrid = document.getElementById('kpiGrid');
  const panelContainer = document.getElementById('panelContainer');
  
  // Clear current content
  kpiGrid.innerHTML = '';
  panelContainer.innerHTML = '';
  
  switch (page) {
    case 'dashboard':
      await loadDashboard();
      break;
    case 'users':
      await loadUsers();
      break;
    case 'investigations':
      await loadInvestigations();
      break;
    case 'security':
      await loadSecurity();
      break;
    case 'audit':
      await loadAudit();
      break;
    case 'analytics':
      await loadAnalytics();
      break;
  }
}

// Update breadcrumb
function updateBreadcrumb(page) {
  const breadcrumb = document.getElementById('breadcrumb');
  const titles = {
    dashboard: 'Dashboard',
    users: 'Gerenciamento de Usuários',
    investigations: 'Investigações Ativas',
    security: 'Segurança e Logs',
    audit: 'Auditoria do Sistema',
    analytics: 'Analytics e Métricas'
  };
  
  breadcrumb.textContent = titles[page] || 'Dashboard';
}

// Refresh button
document.getElementById('btnRefresh')?.addEventListener('click', () => {
  loadPage(currentPage);
});

// ========== PAGE LOADERS ==========

async function loadDashboard() {
  try {
    const response = await fetch('api/dashboard_stats.php', {
      credentials: 'include'
    });
    const stats = await response.json();
    
    // KPIs
    const kpiGrid = document.getElementById('kpiGrid');
    kpiGrid.innerHTML = `
      ${createKPI('Usuários Ativos', stats.totalUsers || 0, 'users', '#10b981')}
      ${createKPI('Investigações', stats.totalInvestigations || 0, 'investigations', '#3b82f6')}
      ${createKPI('Flows Executados', stats.totalFlows || 0, 'flows', '#f59e0b')}
      ${createKPI('Taxa de Sucesso', (stats.successRate || 0) + '%', 'success', '#dc2638')}
    `;
    
    // Recent activity
    const panelContainer = document.getElementById('panelContainer');
    panelContainer.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">Atividade Recente</h2>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Detalhes</th>
              <th>Data/Hora</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="activityTable">
            <tr><td colspan="5" style="text-align:center;padding:40px;">Carregando...</td></tr>
          </tbody>
        </table>
      </div>
    `;
    
    loadRecentActivity();
  } catch (error) {
    console.error('Dashboard load error:', error);
  }
}

async function loadUsers() {
  const kpiGrid = document.getElementById('kpiGrid');
  kpiGrid.innerHTML = `
    ${createKPI('Total de Usuários', '30', 'users', '#10b981')}
    ${createKPI('Ativos Hoje', '12', 'active', '#3b82f6')}
    ${createKPI('Novos (7 dias)', '3', 'new', '#f59e0b')}
    ${createKPI('Bloqueados', '0', 'blocked', '#ef4444')}
  `;
  
  const panelContainer = document.getElementById('panelContainer');
  panelContainer.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Usuários do Sistema</h2>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Cadastro</th>
            <th>Último Acesso</th>
            <th>Investigações</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="usersTable">
          <tr><td colspan="5" style="text-align:center;padding:40px;">Carregando usuários...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  loadUsersTable();
}

async function loadInvestigations() {
  const kpiGrid = document.getElementById('kpiGrid');
  kpiGrid.innerHTML = `
    ${createKPI('Total', '45', 'total', '#10b981')}
    ${createKPI('Em Andamento', '12', 'active', '#3b82f6')}
    ${createKPI('Concluídas', '28', 'completed', '#f59e0b')}
    ${createKPI('Arquivadas', '5', 'archived', '#6b7280')}
  `;
  
  const panelContainer = document.getElementById('panelContainer');
  panelContainer.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Investigações do Sistema</h2>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Criador</th>
            <th>Data Criação</th>
            <th>Última Atividade</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody id="investigationsTable">
          <tr><td colspan="5" style="text-align:center;padding:40px;">Carregando investigações...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  loadInvestigationsTable();
}

async function loadSecurity() {
  const kpiGrid = document.getElementById('kpiGrid');
  kpiGrid.innerHTML = `
    ${createKPI('Tentativas Login', '127', 'attempts', '#10b981')}
    ${createKPI('Falhas (24h)', '3', 'failures', '#ef4444')}
    ${createKPI('IPs Bloqueados', '0', 'blocked', '#6b7280')}
    ${createKPI('Sessões Ativas', '8', 'sessions', '#3b82f6')}
  `;
  
  const panelContainer = document.getElementById('panelContainer');
  panelContainer.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Logs de Segurança</h2>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Evento</th>
            <th>Usuário/IP</th>
            <th>Detalhes</th>
            <th>Data/Hora</th>
            <th>Severidade</th>
          </tr>
        </thead>
        <tbody id="securityTable">
          <tr><td colspan="5" style="text-align:center;padding:40px;">Carregando logs de segurança...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  loadSecurityLogs();
}

async function loadAudit() {
  const panelContainer = document.getElementById('panelContainer');
  panelContainer.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Trilha de Auditoria</h2>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Ação</th>
            <th>Usuário</th>
            <th>Recurso</th>
            <th>Detalhes</th>
            <th>Data/Hora</th>
          </tr>
        </thead>
        <tbody id="auditTable">
          <tr><td colspan="5" style="text-align:center;padding:40px;">Carregando trilha de auditoria...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  loadAuditLogs();
}

async function loadAnalytics() {
  const kpiGrid = document.getElementById('kpiGrid');
  kpiGrid.innerHTML = `
    ${createKPI('Flows/Dia', '24', 'flows', '#10b981')}
    ${createKPI('Transforms', '156', 'transforms', '#3b82f6')}
    ${createKPI('Tempo Médio', '3.2s', 'time', '#f59e0b')}
    ${createKPI('Taxa Erro', '1.2%', 'error', '#ef4444')}
  `;
  
  const panelContainer = document.getElementById('panelContainer');
  panelContainer.innerHTML = `
    <div class="panel-header">
      <h2 class="panel-title">Métricas de Performance</h2>
    </div>
    <div style="padding: 40px; text-align: center; color: var(--text-secondary);">
      <p>Gráficos e análises detalhadas serão implementados aqui</p>
    </div>
  `;
}

// Helper functions
function createKPI(title, value, type, color) {
  return `
    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-title">${title}</span>
        <div class="kpi-icon" style="background: ${color}20; color: ${color};">
          ${getKPIIcon(type)}
        </div>
      </div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-footer">
        <span>Últimas 24 horas</span>
      </div>
    </div>
  `;
}

function getKPIIcon(type) {
  const icons = {
    users: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6C9 7.65685 7.65685 9 6 9C4.34315 9 3 7.65685 3 6C3 4.34315 4.34315 3 6 3C7.65685 3 9 4.34315 9 6Z"/><path d="M17 6C17 7.65685 15.6569 9 14 9C12.3431 9 11 7.65685 11 6C11 4.34315 12.3431 3 14 3C15.6569 3 17 4.34315 17 6Z"/><path d="M12.9291 17C12.9758 16.6734 13 16.3395 13 16C13 14.3648 12.4393 12.8606 11.4998 11.6691C12.2352 11.2435 13.0892 11 14 11C16.7614 11 19 13.2386 19 16V17H12.9291Z"/><path d="M6 11C8.76142 11 11 13.2386 11 16V17H1V16C1 13.2386 3.23858 11 6 11Z"/></svg>',
    investigations: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M8 4C5.79086 4 4 5.79086 4 8C4 10.2091 5.79086 12 8 12C10.2091 12 12 10.2091 12 8C12 5.79086 10.2091 4 8 4ZM2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 9.29583 13.5892 10.4957 12.8907 11.4765L17.7071 16.2929C18.0976 16.6834 18.0976 17.3166 17.7071 17.7071C17.3166 18.0976 16.6834 18.0976 16.2929 17.7071L11.4765 12.8907C10.4957 13.5892 9.29583 14 8 14C4.68629 14 2 11.3137 2 8Z"/></svg>',
    flows: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3C3.89543 3 3 3.89543 3 5C3 6.10457 3.89543 7 5 7C6.10457 7 7 6.10457 7 5C7 3.89543 6.10457 3 5 3ZM10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8ZM13 15C13 13.8954 13.8954 13 15 13C16.1046 13 17 13.8954 17 15C17 16.1046 16.1046 17 15 17C13.8954 17 13 16.1046 13 15Z"/></svg>',
    success: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z"/></svg>'
  };
  return icons[type] || icons.users;
}

async function loadRecentActivity() {
  // Mock data - replace with actual API call
  const tbody = document.getElementById('activityTable');
  tbody.innerHTML = `
    <tr>
      <td>admin@example.com</td>
      <td>Login</td>
      <td>Acesso ao dashboard</td>
      <td>${new Date().toLocaleString('pt-BR')}</td>
      <td><span class="badge success">Sucesso</span></td>
    </tr>
  `;
}

async function loadUsersTable() {
  const tbody = document.getElementById('usersTable');
  tbody.innerHTML = `
    <tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">Nenhum usuário cadastrado ainda</td></tr>
  `;
}

async function loadInvestigationsTable() {
  const tbody = document.getElementById('investigationsTable');
  tbody.innerHTML = `
    <tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">Nenhuma investigação encontrada</td></tr>
  `;
}

async function loadSecurityLogs() {
  const tbody = document.getElementById('securityTable');
  tbody.innerHTML = `
    <tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">Nenhum log de segurança</td></tr>
  `;
}

async function loadAuditLogs() {
  const tbody = document.getElementById('auditTable');
  tbody.innerHTML = `
    <tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">Nenhum registro de auditoria</td></tr>
  `;
}
