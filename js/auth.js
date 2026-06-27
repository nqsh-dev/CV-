// ── Auth — CV+ v3 ────────────────────────────────
// ┌──────────────────────────────────┐
// │  Email    : admin@cvplus.cm      │
// │  Password : CVplus@Admin2025!    │
// └──────────────────────────────────┘

const ADMIN = {
  email:    'admin@cvplus.cm',
  password: 'CVplus@Admin2025!',
  nom:      'Administrateur',
  role:     'admin'
};

const USERS_DB = {};

function openAuthModal(view = 'login') {
  document.getElementById('auth-modal').classList.add('open');
  switchAuthView(view);
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
  ['login-email','login-pass','reg-nom','reg-email','reg-pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  clearAuthErrors();
}

function switchAuthView(view) {
  const isLogin = view === 'login';
  document.getElementById('auth-view-login').classList.toggle('hidden', !isLogin);
  document.getElementById('auth-view-register').classList.toggle('hidden', isLogin);
  document.getElementById('auth-modal-title').textContent = isLogin ? 'Connexion à CV+' : 'Créer un compte';
  clearAuthErrors();
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearAuthErrors() {
  document.querySelectorAll('.auth-error').forEach(e => {
    e.textContent = ''; e.style.display = 'none';
  });
}

function handleLogin(e) {
  if (e) e.preventDefault();
  clearAuthErrors();
  const email = document.getElementById('login-email')?.value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass')?.value;
  if (!email) { showAuthError('login-email-err', 'Entrez votre email'); return; }
  if (!pass)  { showAuthError('login-pass-err',  'Entrez votre mot de passe'); return; }

  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Connexion...';

  setTimeout(() => {
    if (email === ADMIN.email && pass === ADMIN.password) {
      loginSuccess({ email, nom: ADMIN.nom, role: 'admin' });
      return;
    }
    const u = USERS_DB[email];
    if (u && u.password === pass) {
      loginSuccess({ email, nom: u.nom, role: 'user' });
      return;
    }
    showAuthError('login-pass-err', 'Email ou mot de passe incorrect');
    btn.disabled = false;
    btn.textContent = 'Se connecter';
  }, 900);
}

function handleRegister(e) {
  if (e) e.preventDefault();
  clearAuthErrors();
  const nom   = document.getElementById('reg-nom')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass')?.value;

  if (!nom)                          { showAuthError('reg-nom-err',   'Entrez votre nom'); return; }
  if (!email || !email.includes('@')) { showAuthError('reg-email-err', 'Email invalide'); return; }
  if (!pass || pass.length < 6)      { showAuthError('reg-pass-err',  'Minimum 6 caractères'); return; }
  if (USERS_DB[email])               { showAuthError('reg-email-err', 'Cet email est déjà utilisé'); return; }

  const btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Création...';

  setTimeout(() => {
    USERS_DB[email] = { nom, email, password: pass, role: 'user' };
    App.user    = { email, nom, role: 'user' };
    App.plan    = null;
    App.isAdmin = false;
    closeAuthModal();
    updatePlanBadge();
    updateAdminNav();
    App.toast('Compte créé ! Choisissez un abonnement.', 'success');
    btn.disabled = false;
    btn.textContent = "S'inscrire";
    setTimeout(() => App.navigate('pricing'), 600);
  }, 1100);
}

function loginSuccess(user) {
  App.user    = user;
  App.isAdmin = user.role === 'admin';
  if (App.isAdmin) {
    App.plan    = 'premium';
    App.cvCount = 0;
  } else {
    try {
      App.plan    = localStorage.getItem('cvplus_plan_' + user.email) || null;
      App.cvCount = parseInt(localStorage.getItem('cvplus_cvcount_' + user.email) || '0');
    } catch(e) {
      App.plan    = null;
      App.cvCount = 0;
    }
  }
  closeAuthModal();
  updatePlanBadge();
  updateAdminNav();
  App.toast(`Bienvenue ${user.nom} !`, 'success');

  const btn = document.getElementById('login-btn');
  if (btn) { btn.disabled = false; btn.textContent = 'Se connecter'; }

  if (App.isAdmin) setTimeout(() => App.navigate('admin'), 300);
}

function handleLogout() {
  App.user    = null;
  App.plan    = null;
  App.cvCount = 0;
  App.isAdmin = false;
  try { localStorage.removeItem('cvplus_session'); } catch(e) {}
  updatePlanBadge();
  updateAdminNav();
  App.toast('Déconnexion réussie', 'info');
  App.navigate('dashboard');
}
