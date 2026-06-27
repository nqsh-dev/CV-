// ── Éditeur CV v3 ────────────────────────────────

const TABS = ['identite', 'experiences', 'formations', 'competences'];
const TAB_LABELS = ['Identité', 'Expériences', 'Formation', 'Compétences'];
let currentTabIndex = 0;

function initEditor() {
  // Tabs clic
  document.querySelectorAll('.editor-tab').forEach((tab, i) => {
    tab.addEventListener('click', () => switchTab(i));
  });

  // Photo
  const photoArea  = document.getElementById('photo-area');
  const photoInput = document.getElementById('photo-input');
  if (photoArea) {
    photoArea.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        App.cvData.photo = ev.target.result;
        const preview = document.getElementById('photo-preview');
        const placeholder = document.getElementById('photo-placeholder');
        preview.src = ev.target.result;
        preview.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
        renderPreview();
      };
      reader.readAsDataURL(file);
    });
  }

  // Champs texte live
  ['prenom','nom','titre','entreprise','email','telephone','adresse','linkedin','resume','centres'].forEach(f => {
    const el = document.getElementById('field-' + f);
    if (el) el.addEventListener('input', () => { App.cvData[f] = el.value; renderPreview(); });
  });

  // Compétences
  document.getElementById('skill-add-btn')?.addEventListener('click', () => {
    addSkill(document.getElementById('skill-input')?.value);
  });
  document.getElementById('skill-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addSkill(document.getElementById('skill-input').value);
  });

  // Expériences / Formations
  document.getElementById('add-exp-btn')?.addEventListener('click', addExperience);
  document.getElementById('add-form-btn')?.addEventListener('click', addFormation);

  // Navigation Précédent / Suivant
  document.getElementById('tab-prev-btn')?.addEventListener('click', () => switchTab(currentTabIndex - 1));
  document.getElementById('tab-next-btn')?.addEventListener('click', () => switchTab(currentTabIndex + 1));

  // Dots de navigation
  document.querySelectorAll('.tab-nav-dot').forEach((dot, i) => {
    dot.addEventListener('click', () => switchTab(i));
  });

  // Téléchargement
  document.getElementById('btn-download-cv')?.addEventListener('click', handleDownload);

  // Sélecteur de templates
  initTemplateSelector();

  updateTabNav();
  renderPreview();
}

// ── Navigation onglets ────────────────────────────
function switchTab(index) {
  if (index < 0 || index >= TABS.length) return;
  currentTabIndex = index;

  document.querySelectorAll('.editor-tab').forEach((t, i) => t.classList.toggle('active', i === index));
  document.querySelectorAll('.tab-content').forEach((c, i) => c.classList.toggle('active', i === index));
  document.querySelectorAll('.tab-nav-dot').forEach((d, i) => d.classList.toggle('active', i === index));

  updateTabNav();
  document.querySelector('.editor-form')?.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateTabNav() {
  const prevBtn = document.getElementById('tab-prev-btn');
  const nextBtn = document.getElementById('tab-next-btn');
  const info    = document.getElementById('tab-nav-info');

  if (prevBtn) prevBtn.disabled = currentTabIndex === 0;
  if (nextBtn) nextBtn.disabled = currentTabIndex === TABS.length - 1;

  if (nextBtn) {
    if (currentTabIndex < TABS.length - 1) {
      nextBtn.classList.add('next');
    } else {
      nextBtn.classList.remove('next');
    }
  }

  if (info) info.textContent = `${currentTabIndex + 1} / ${TABS.length} — ${TAB_LABELS[currentTabIndex]}`;
}

// ── Sélecteur de templates (dropdown visuel) ──────
const ALL_TEMPLATES_LIST = [
  { id:'modern',      name:'Moderne Bleu',  bg:'linear-gradient(135deg,#1565C0,#00BCD4)', free:true  },
  { id:'executive',   name:'Executive',     bg:'linear-gradient(135deg,#0D47A1,#00BCD4)', free:false },
  { id:'minimal',     name:'Minimal',       bg:'linear-gradient(135deg,#555,#888)',        free:false },
  { id:'creative',    name:'Creative',      bg:'linear-gradient(135deg,#1A1A2E,#A855F7)', free:false },
  { id:'techDark',    name:'Tech Dark',     bg:'#0D0D0D',                                 free:false },
  { id:'corporate',   name:'Corporate',     bg:'linear-gradient(135deg,#EEE,#DDD)',        free:false },
  { id:'sunset',      name:'Sunset',        bg:'linear-gradient(135deg,#FF6B35,#FFC04D)', free:false },
  { id:'nature',      name:'Nature',        bg:'linear-gradient(135deg,#14532D,#22C55E)', free:false },
  { id:'gold',        name:'Gold',          bg:'linear-gradient(135deg,#1A1200,#5C4200)', free:false },
  { id:'ocean',       name:'Ocean',         bg:'linear-gradient(135deg,#0C4A6E,#0EA5E9)', free:false },
  { id:'rose',        name:'Rose',          bg:'linear-gradient(135deg,#881337,#FB7185)', free:false },
  { id:'slate',       name:'Slate',         bg:'#0F172A',                                 free:false },
  { id:'split',       name:'Split',         bg:'linear-gradient(90deg,#1E1B4B 50%,#E8EEFF 50%)', free:false },
  { id:'infographic', name:'Infographie',   bg:'linear-gradient(135deg,#3B82F6,#8B5CF6)', free:false },
  { id:'bold',        name:'Bold Impact',   bg:'#111',                                    free:false },
];

function initTemplateSelector() {
  const btn      = document.getElementById('tpl-selector-btn');
  const dropdown = document.getElementById('tpl-grid-dropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    renderTplDropdown();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', e => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove('open');
    }
  });
}

function renderTplDropdown() {
  const dropdown = document.getElementById('tpl-grid-dropdown');
  if (!dropdown) return;

  dropdown.innerHTML = ALL_TEMPLATES_LIST.map(tpl => {
    const canUse   = App.canUseTemplate(tpl.id);
    const isActive = App.currentTemplate === tpl.id;
    const tier     = App.getTemplateTier(tpl.id);
    const tierLabel = App.getTemplateLabel(tpl.id);
    const badgeClass = tier === 'premium' ? 'badge-orange' : tier === 'starter' ? 'badge-green' : 'badge-blue';

    return `
      <div class="tpl-thumb ${isActive?'active':''} ${!canUse?'locked':''}"
           onclick="${canUse ? `applyTemplate('${tpl.id}')` : `App.navigate('pricing')` }"
           title="${tpl.name}">
        <div class="tpl-thumb-preview" style="background:${tpl.bg};"></div>
        <div class="tpl-thumb-name">${tpl.name}</div>
        <span class="badge ${badgeClass}" style="margin-top:6px;">${tierLabel}</span>
        ${!canUse ? `<div class="tpl-lock-badge">${tierLabel.toUpperCase()}</div>` : ''}
      </div>`;
  }).join('');
}

function applyTemplate(tplId) {
  if (!App.canUseTemplate(tplId)) {
    App.navigate('pricing');
    return;
  }
  App.currentTemplate = tplId;

  // Mettre à jour le label du bouton
  const tpl = ALL_TEMPLATES_LIST.find(t => t.id === tplId);
  const btn = document.getElementById('tpl-selector-btn');
  if (btn && tpl) {
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      ${tpl.name}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>`;
  }

  document.getElementById('tpl-grid-dropdown')?.classList.remove('open');
  renderPreview();
  App.toast(`Template "${tpl?.name}" appliqué`, 'success');
}

// Utilisé depuis la page Templates
function selectTemplate(tplId) {
  applyTemplate(tplId);
  App.navigate('editor');
}

// ── Compétences ──────────────────────────────────
function addSkill(val) {
  if (!val?.trim()) return;
  App.cvData.competences.push({ label: val.trim(), niveau: 80 });
  renderSkillTags();
  document.getElementById('skill-input').value = '';
  renderPreview();
}

function removeSkill(i) {
  App.cvData.competences.splice(i, 1);
  renderSkillTags();
  renderPreview();
}

function renderSkillTags() {
  const c = document.getElementById('skills-container');
  if (!c) return;
  c.innerHTML = App.cvData.competences.map((s, i) => `
    <span class="skill-tag">
      ${s.label}
      <button onclick="removeSkill(${i})" title="Supprimer">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </span>`).join('');
}

// ── Expériences ──────────────────────────────────
function addExperience() {
  App.cvData.experiences.push({ poste:'', entreprise:'', debut:'', fin:'', description:'' });
  renderExperiences();
}

function removeExp(i) {
  App.cvData.experiences.splice(i, 1);
  renderExperiences();
  renderPreview();
}

function renderExperiences() {
  const c = document.getElementById('exp-container');
  if (!c) return;
  if (!App.cvData.experiences.length) {
    c.innerHTML = `<p style="font-size:13px;color:var(--text-dim);text-align:center;padding:16px 0;">Aucune expérience ajoutée</p>`;
    return;
  }
  c.innerHTML = App.cvData.experiences.map((e, i) => `
    <div class="entry-item">
      <div class="entry-header">
        <span class="entry-title">${e.poste || 'Nouvelle expérience'}</span>
        <button class="entry-remove" onclick="removeExp(${i})" title="Supprimer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="form-group">
        <input class="form-input" placeholder="Poste / Fonction" value="${e.poste}"
          oninput="App.cvData.experiences[${i}].poste=this.value;renderPreview();
            this.closest('.entry-item').querySelector('.entry-title').textContent=this.value||'Nouvelle expérience'">
      </div>
      <div class="form-group">
        <input class="form-input" placeholder="Entreprise" value="${e.entreprise}"
          oninput="App.cvData.experiences[${i}].entreprise=this.value;renderPreview()">
      </div>
      <div class="grid-2">
        <div class="form-group">
          <input class="form-input" placeholder="Début (Jan 2022)" value="${e.debut}"
            oninput="App.cvData.experiences[${i}].debut=this.value;renderPreview()">
        </div>
        <div class="form-group">
          <input class="form-input" placeholder="Fin / Présent" value="${e.fin}"
            oninput="App.cvData.experiences[${i}].fin=this.value;renderPreview()">
        </div>
      </div>
      <div class="form-group">
        <textarea class="form-input" placeholder="Description des missions..." rows="3"
          oninput="App.cvData.experiences[${i}].description=this.value;renderPreview()">${e.description}</textarea>
      </div>
    </div>`).join('');
}

// ── Formations ───────────────────────────────────
function addFormation() {
  App.cvData.formations.push({ diplome:'', etablissement:'', annee:'', description:'' });
  renderFormations();
}

function removeForm(i) {
  App.cvData.formations.splice(i, 1);
  renderFormations();
  renderPreview();
}

function renderFormations() {
  const c = document.getElementById('form-container');
  if (!c) return;
  if (!App.cvData.formations.length) {
    c.innerHTML = `<p style="font-size:13px;color:var(--text-dim);text-align:center;padding:16px 0;">Aucune formation ajoutée</p>`;
    return;
  }
  c.innerHTML = App.cvData.formations.map((f, i) => `
    <div class="entry-item">
      <div class="entry-header">
        <span class="entry-title">${f.diplome || 'Nouvelle formation'}</span>
        <button class="entry-remove" onclick="removeForm(${i})" title="Supprimer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="form-group">
        <input class="form-input" placeholder="Diplôme / Titre" value="${f.diplome}"
          oninput="App.cvData.formations[${i}].diplome=this.value;renderPreview();
            this.closest('.entry-item').querySelector('.entry-title').textContent=this.value||'Nouvelle formation'">
      </div>
      <div class="form-group">
        <input class="form-input" placeholder="Établissement" value="${f.etablissement}"
          oninput="App.cvData.formations[${i}].etablissement=this.value;renderPreview()">
      </div>
      <div class="form-group">
        <input class="form-input" placeholder="Année (ex: 2023)" value="${f.annee}"
          oninput="App.cvData.formations[${i}].annee=this.value;renderPreview()">
      </div>
      <div class="form-group">
        <textarea class="form-input" placeholder="Description optionnelle..." rows="2"
          oninput="App.cvData.formations[${i}].description=this.value;renderPreview()">${f.description}</textarea>
      </div>
    </div>`).join('');
}

// ── Langues ──────────────────────────────────────
function addLangue() {
  const input = document.getElementById('langue-input');
  const niv   = document.getElementById('langue-niveau');
  if (!input?.value.trim()) return;
  App.cvData.langues.push({ label: input.value.trim(), niveau: parseInt(niv?.value || 3) });
  renderLangues();
  input.value = '';
  renderPreview();
}

function removeLangue(i) {
  App.cvData.langues.splice(i, 1);
  renderLangues();
  renderPreview();
}

function renderLangues() {
  const c = document.getElementById('langues-container');
  if (!c) return;
  const niveaux = ['','Notions','Scolaire','Intermédiaire','Courant','Bilingue'];
  c.innerHTML = App.cvData.langues.map((l, i) => `
    <span class="skill-tag">
      ${l.label} · ${niveaux[l.niveau]||''}
      <button onclick="removeLangue(${i})" title="Supprimer">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </span>`).join('');
}

// ── Export PDF via window.print() (menu impression natif) ──
function handleDownload() {
  if (!App.user) {
    App.toast('Connectez-vous pour télécharger', 'info');
    openAuthModal('login');
    return;
  }
  if (!App.plan) {
    App.toast('Choisissez un abonnement pour télécharger', 'info');
    App.navigate('pricing');
    return;
  }
  if (!App.canDownload()) {
    App.toast('Limite de CV atteinte — changez de plan', 'error');
    App.navigate('pricing');
    return;
  }

  const btn = document.getElementById('btn-download-cv');
  const btnSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
  const btnLabel = `${btnSVG} Télécharger PDF`;

  if (btn) { btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> Préparation...`; }

  // Construire le HTML du CV
  const cvHTML = buildCVHTML(App.currentTemplate, App.cvData);
  const nom    = App.cvData.nom    || 'CV';
  const prenom = App.cvData.prenom || '';

  // Supprimer un éventuel iframe précédent
  const old = document.getElementById('cv-print-frame');
  if (old) old.remove();

  // Créer l'iframe d'impression (invisible)
  const frame = document.createElement('iframe');
  frame.id = 'cv-print-frame';
  frame.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:none;opacity:0;pointer-events:none;';
  document.body.appendChild(frame);

  // Collecter les URLs CSS de la page courante
  const cssUrls = Array.from(document.styleSheets)
    .map(s => { try { return s.href || ''; } catch(e) { return ''; } })
    .filter(Boolean);

  // Écrire le document complet dans l'iframe
  const doc = frame.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>CV — ${prenom} ${nom}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  ${cssUrls.map(u => `<link rel="stylesheet" href="${u}">`).join('\n  ')}
  <style>
    /* ── Reset impression ── */
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }
    .cv-page {
      box-shadow: none !important;
      width: 210mm !important;
      min-height: 297mm !important;
      max-height: 297mm !important;
      overflow: hidden !important;
      page-break-after: avoid !important;
    }
  </style>
</head>
<body>${cvHTML}</body>
</html>`);
  doc.close();

  // Attendre que les polices et styles soient chargés
  frame.onload = () => {
    // Délai pour laisser les fonts Google se charger
    setTimeout(() => {
      if (btn) { btn.disabled = false; btn.innerHTML = btnLabel; }

      // Ouvrir le menu d'impression natif
      frame.contentWindow.focus();
      frame.contentWindow.print();

      // Comptabiliser + nettoyer après fermeture du menu
      setTimeout(() => {
        App.cvCount++;
        try {
          localStorage.setItem('cvplus_cvcount_' + App.user.email, App.cvCount);
        } catch(e) {}
        updatePlanBadge();
        App.toast('Choisissez "Enregistrer en PDF" dans le menu impression', 'info');

        // Supprimer l'iframe après 30s (délai large pour l'impression)
        setTimeout(() => {
          const f = document.getElementById('cv-print-frame');
          if (f) f.remove();
        }, 30000);
      }, 800);
    }, 900);
  };
}

