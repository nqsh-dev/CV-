// ── Panel Admin v3 ───────────────────────────────

const MOCK_USERS = [
  { nom:'Brice Nkemba',   email:'brice@gmail.com',   plan:'pro',     cvs:8,  date:'2025-06-10' },
  { nom:'Alice Fouda',    email:'alice@yahoo.fr',    plan:'premium', cvs:14, date:'2025-06-08' },
  { nom:'Paul Mbarga',    email:'paul@outlook.com',  plan:'starter', cvs:2,  date:'2025-06-15' },
  { nom:'Marie Essomba',  email:'marie@gmail.com',   plan:'pro',     cvs:5,  date:'2025-06-12' },
  { nom:'Jules Atangana', email:'jules@gmail.com',   plan:'starter', cvs:1,  date:'2025-06-17' },
  { nom:'Diane Ottou',    email:'diane@yahoo.fr',    plan:'pro',     cvs:11, date:'2025-06-05' },
  { nom:'Eric Nguele',    email:'eric@gmail.com',    plan:'premium', cvs:20, date:'2025-06-01' },
  { nom:'Carine Bello',   email:'carine@gmail.com',  plan:'starter', cvs:2,  date:'2025-06-18' },
  { nom:'Patrick Meka',   email:'patrick@gmail.com', plan:'pro',     cvs:7,  date:'2025-06-09' },
  { nom:'Sandra Yombi',   email:'sandra@email.cm',   plan:'pro',     cvs:3,  date:'2025-06-20' },
];

function initAdminPage() {
  if (!App.isAdmin) {
    App.navigate('dashboard');
    App.toast('Accès refusé', 'error');
    return;
  }
  renderAdminStats();
  renderAdminUsers();
}

function renderAdminStats() {
  const el = document.getElementById('admin-stats-grid');
  if (!el) return;

  const byPlan = { starter: 0, pro: 0, premium: 0 };
  MOCK_USERS.forEach(u => byPlan[u.plan] = (byPlan[u.plan] || 0) + 1);
  const revenue   = byPlan.starter * 500 + byPlan.pro * 1500 + byPlan.premium * 3750;
  const totalCVs  = MOCK_USERS.reduce((s, u) => s + u.cvs, 0);

  el.innerHTML = `
    <div class="card-sm">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:8px;">Utilisateurs</div>
      <div style="font-size:30px;font-weight:800;color:var(--blue);">${MOCK_USERS.length}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">inscrits au total</div>
    </div>
    <div class="card-sm">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:8px;">Revenus</div>
      <div style="font-size:30px;font-weight:800;color:#F59E0B;">${revenue.toLocaleString()}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">FCFA ce mois</div>
    </div>
    <div class="card-sm">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:8px;">CV générés</div>
      <div style="font-size:30px;font-weight:800;color:var(--blue);">${totalCVs}</div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">au total</div>
    </div>
    <div class="card-sm">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:10px;">Plans actifs</div>
      <div style="display:flex;flex-direction:column;gap:5px;">
        <div style="display:flex;justify-content:space-between;font-size:12.5px;"><span style="color:var(--text-muted);">Starter</span><span class="badge badge-blue">${byPlan.starter}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:12.5px;"><span style="color:var(--text-muted);">Pro</span><span class="badge badge-blue">${byPlan.pro}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:12.5px;"><span style="color:var(--text-muted);">Premium</span><span class="badge badge-orange">${byPlan.premium}</span></div>
      </div>
    </div>`;
}

const PLAN_BADGE = {
  starter: '<span class="badge badge-blue">Starter</span>',
  pro:     '<span class="badge badge-blue">Pro</span>',
  premium: '<span class="badge badge-orange">Premium</span>'
};

function renderAdminUsers(list) {
  const tbody = document.getElementById('admin-users-body');
  if (!tbody) return;
  const users = list || MOCK_USERS;

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:24px;font-size:13px;">Aucun utilisateur</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map((u, i) => `
    <tr style="border-bottom:1px solid var(--border);transition:background 0.1s;"
        onmouseover="this.style.background='var(--bg-surface)'"
        onmouseout="this.style.background='transparent'">
      <td style="padding:11px 16px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:30px;height:30px;background:var(--blue-light);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--blue);flex-shrink:0;">${u.nom.charAt(0)}</div>
          <div>
            <div style="font-size:13px;font-weight:600;">${u.nom}</div>
            <div style="font-size:11px;color:var(--text-muted);">${u.email}</div>
          </div>
        </div>
      </td>
      <td style="padding:11px 16px;">${PLAN_BADGE[u.plan] || u.plan}</td>
      <td style="padding:11px 16px;font-size:13px;font-weight:600;">${u.cvs}</td>
      <td style="padding:11px 16px;font-size:12px;color:var(--text-muted);">${u.date}</td>
      <td style="padding:11px 16px;">
        <div style="display:flex;gap:5px;">
          <button class="btn btn-ghost btn-sm" onclick="adminGrant(${i})" title="Donner Premium">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="adminReset(${i})" title="Reset CV">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-7.29"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');
}

function adminGrant(i) {
  MOCK_USERS[i].plan = 'premium';
  renderAdminUsers();
  renderAdminStats();
  App.toast('Plan Premium accordé', 'success');
}

function adminReset(i) {
  MOCK_USERS[i].cvs = 0;
  renderAdminUsers();
  renderAdminStats();
  App.toast('Compteur CV réinitialisé', 'info');
}

function adminFilterUsers(filter) {
  document.querySelectorAll('.admin-filter-btn').forEach(b => {
    b.classList.toggle('btn-primary', b.dataset.filter === filter);
    b.classList.toggle('btn-ghost',   b.dataset.filter !== filter);
  });
  renderAdminUsers(filter === 'all' ? null : MOCK_USERS.filter(u => u.plan === filter));
}

function adminSearchUsers(q) {
  if (!q.trim()) { renderAdminUsers(); return; }
  const ql = q.toLowerCase();
  renderAdminUsers(MOCK_USERS.filter(u =>
    u.nom.toLowerCase().includes(ql) || u.email.toLowerCase().includes(ql)
  ));
}
