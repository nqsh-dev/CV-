// ── CV+ App — State & Navigation ─────────────────

const App = {
  user:            null,
  plan:            null,
  cvCount:         0,
  isAdmin:         false,
  currentPage:     'dashboard',
  currentTemplate: 'modern',

  cvData: {
    photo: null,
    prenom:'', nom:'', titre:'', entreprise:'',
    email:'', telephone:'', adresse:'', linkedin:'',
    resume:'',
    experiences:  [],
    formations:   [],
    competences:  [],
    langues:      [],
    centres:      ''
  },

  plans: {
    starter: {
      price: 500, period: 'unique', cvMax: 2,
      templates: ['modern','executive','minimal'],
      name: 'Starter'
    },
    pro: {
      price: 1500, period: '1 mois', cvMax: Infinity,
      templates: ['modern','executive','minimal','creative','techDark',
                  'corporate','sunset','nature','gold','ocean'],
      name: 'Pro'
    },
    premium: {
      price: 3750, period: '3 mois', cvMax: Infinity,
      templates: ['modern','executive','minimal','creative','techDark',
                  'corporate','sunset','nature','gold','ocean',
                  'rose','slate','split','infographic','bold'],
      name: 'Premium'
    }
  },

  templateTiers: {
    modern:      'starter',
    executive:   'starter',
    minimal:     'starter',
    creative:    'pro',
    techDark:    'pro',
    corporate:   'pro',
    sunset:      'pro',
    nature:      'pro',
    gold:        'pro',
    ocean:       'pro',
    rose:        'premium',
    slate:       'premium',
    split:       'premium',
    infographic: 'premium',
    bold:        'premium'
  },

  getTemplateTier(tplId) {
    return this.templateTiers[tplId] || 'starter';
  },

  getTemplateLabel(tplId) {
    const tier = this.getTemplateTier(tplId);
    return tier === 'starter' ? 'Starter' : tier === 'pro' ? 'Pro' : 'Premium';
  },

  navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('[data-page]').forEach(n => n.classList.remove('active'));

    const target = document.getElementById('page-' + page);
    if (target) { target.classList.add('active'); this.currentPage = page; }

    document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));
    window.scrollTo(0, 0);
  },

  canUseTemplate(tplId) {
    if (this.isAdmin) return true;
    if (!this.plan)   return tplId === 'modern';
    return (this.plans[this.plan]?.templates || []).includes(tplId);
  },

  canDownload() {
    if (this.isAdmin) return true;
    if (!this.user || !this.plan) return false;
    const max = this.plans[this.plan]?.cvMax ?? 0;
    return this.cvCount < max;
  },

  toast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = {
      success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
      error:   `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info:    `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E5EFF" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };
    t.innerHTML = `${icons[type] || icons.info}<span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => {
      t.style.transition = 'all 0.3s';
      t.style.opacity = '0';
      t.style.transform = 'translateX(30px)';
      setTimeout(() => t.remove(), 300);
    }, 3200);
  },

  saveSession() {
    try {
      localStorage.setItem('cvplus_session', JSON.stringify({
        user:    this.user,
        plan:    this.plan,
        cvCount: this.cvCount,
        isAdmin: this.isAdmin
      }));
    } catch(e) {}
  },

  loadSession() {
    try {
      const s = JSON.parse(localStorage.getItem('cvplus_session') || 'null');
      if (s && s.user) {
        this.user    = s.user;
        this.plan    = s.plan;
        this.cvCount = s.cvCount || 0;
        this.isAdmin = s.isAdmin || false;
      }
    } catch(e) {}
  }
};

function updatePlanBadge() {
  const badge = document.getElementById('plan-badge');
  if (!badge) return;

  if (App.isAdmin) {
    badge.innerHTML = `
      <div class="plan-name">Administrateur</div>
      <div class="plan-info" style="font-size:12px;opacity:0.85;">Accès complet illimité</div>`;
  } else if (!App.user || !App.plan) {
    badge.innerHTML = `
      <div class="plan-name">Compte gratuit</div>
      <div class="plan-info" style="font-size:12px;opacity:0.85;">Connectez-vous pour télécharger</div>
      <button class="plan-upgrade-btn" onclick="openAuthModal()">S'inscrire gratuitement</button>`;
  } else {
    const p = App.plans[App.plan];
    const used = App.cvCount;
    const max  = p.cvMax === Infinity ? '∞' : p.cvMax;
    badge.innerHTML = `
      <div class="plan-name">${p.name}</div>
      <div class="plan-info" style="font-size:12px;opacity:0.85;">${used} / ${max} CV générés</div>
      <button class="plan-upgrade-btn" onclick="App.navigate('pricing')">Changer de plan</button>`;
  }

  App.saveSession();
}

function updateAdminNav() {
  const el = document.getElementById('nav-admin');
  if (el) el.style.display = App.isAdmin ? 'flex' : 'none';
}
