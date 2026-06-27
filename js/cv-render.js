// ── CV+ Renderer v3 — Templates uniformes ────────
// Photo : toujours cv-photo (80×80, border-radius:50%)
// Sauf templates corporate/minimal/bold : border-radius:6px (via CSS override)

function renderPreview() {
  const c = document.getElementById('cv-preview-container');
  if (!c) return;
  c.innerHTML = buildCVHTML(App.currentTemplate, App.cvData);
}

function buildCVHTML(tpl, d) {
  const extras = {
    creative:'buildCreative', techDark:'buildTechDark', corporate:'buildCorporate',
    sunset:'buildSunset', nature:'buildNature', gold:'buildGold',
    ocean:'buildOcean', rose:'buildRose', slate:'buildSlate',
    split:'buildSplit', infographic:'buildInfographic', bold:'buildBold'
  };
  if (extras[tpl] && window[extras[tpl]]) return window[extras[tpl]](d);
  switch(tpl) {
    case 'executive': return buildExecutive(d);
    case 'minimal':   return buildMinimal(d);
    default:          return buildModern(d);
  }
}

const esc = s => s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';

// ── Photo helper uniforme ──
function photoHTML(src, extraClass='') {
  if (src) return `<img src="${src}" class="cv-photo ${extraClass}" alt="Photo">`;
  return `<div class="cv-photo-placeholder ${extraClass}"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`;
}

// ── Icônes contact SVG inline ──
const ICONS = {
  email: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 9.81a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  link: `<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`
};

function contactItems(d, style='') {
  const items = [];
  if (d.email)     items.push(`<span style="${style}">${ICONS.email} ${esc(d.email)}</span>`);
  if (d.telephone) items.push(`<span style="${style}">${ICONS.phone} ${esc(d.telephone)}</span>`);
  if (d.adresse)   items.push(`<span style="${style}">${ICONS.pin} ${esc(d.adresse)}</span>`);
  if (d.linkedin)  items.push(`<span style="${style}">${ICONS.link} ${esc(d.linkedin)}</span>`);
  return items;
}

// ── T1 MODERNE BLEU ───────────────────────────────
function buildModern(d) {
  const skillBars = (d.competences||[]).map(s=>`
    <div class="cv-skill-row">
      <div class="cv-skill-label">${esc(s.label)}</div>
      <div class="cv-skill-track"><div class="cv-skill-fill" style="width:${s.niveau}%"></div></div>
    </div>`).join('');

  const niveaux = ['','Notions','Scolaire','Intermédiaire','Courant','Bilingue'];
  const langDots = (d.langues||[]).map(l=>`
    <div class="cv-lang-item">
      <span>${esc(l.label)}</span>
      <div class="cv-lang-dots">${Array.from({length:5},(_,i)=>`<div class="cv-lang-dot${i<l.niveau?' on':''}"></div>`).join('')}</div>
    </div>`).join('');

  const exps = (d.experiences||[]).map(e=>`
    <div class="cv-entry">
      <div class="cv-entry-name">${esc(e.poste)}</div>
      <div class="cv-entry-sub">${esc(e.entreprise)}</div>
      <div class="cv-entry-date">${esc(e.debut)}${e.fin?' — '+esc(e.fin):''}</div>
      ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
    </div>`).join('');

  const forms = (d.formations||[]).map(f=>`
    <div class="cv-entry">
      <div class="cv-entry-name">${esc(f.diplome)}</div>
      <div class="cv-entry-sub">${esc(f.etablissement)}</div>
      <div class="cv-entry-date">${esc(f.annee)}</div>
    </div>`).join('');

  const contacts = contactItems(d, 'display:flex;align-items:center;gap:5px;font-size:8pt;color:rgba(255,255,255,0.85);margin-bottom:5px;word-break:break-all;');

  return `<div class="cv-page tpl-modern">
    <div class="cv-sidebar">
      ${photoHTML(d.photo)}
      <div class="cv-name">${esc(d.prenom)} ${esc(d.nom)}</div>
      <div class="cv-title">${esc(d.titre)}${d.entreprise?'<br><span style="font-size:8pt;opacity:0.6">'+esc(d.entreprise)+'</span>':''}</div>
      <div class="cv-section-title" style="margin-top:16px;">Contact</div>
      ${contacts.map(c=>`<div class="cv-contact-item">${c}</div>`).join('')}
      ${skillBars?`<div class="cv-section-title">Compétences</div>${skillBars}`:''}
      ${langDots?`<div class="cv-section-title">Langues</div>${langDots}`:''}
    </div>
    <div class="cv-main">
      ${d.resume?`<div class="cv-section-title" style="color:#1565C0;border-left:3px solid #FF8C00;padding-left:8px;border-bottom:none;margin-bottom:8px;">Profil</div><div class="cv-entry-desc" style="margin-bottom:14px;">${esc(d.resume)}</div>`:''}
      ${exps?`<div class="cv-section-title" style="color:#1565C0;border-left:3px solid #FF8C00;padding-left:8px;border-bottom:none;">Expériences</div>${exps}`:''}
      ${forms?`<div class="cv-section-title" style="color:#1565C0;border-left:3px solid #FF8C00;padding-left:8px;border-bottom:none;">Formation</div>${forms}`:''}
      ${d.centres?`<div class="cv-section-title" style="color:#1565C0;border-left:3px solid #FF8C00;padding-left:8px;border-bottom:none;">Intérêts</div><div class="cv-entry-desc">${esc(d.centres)}</div>`:''}
    </div>
  </div>`;
}

// ── T2 EXECUTIVE ─────────────────────────────────
function buildExecutive(d) {
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;').map(c=>`<div class="cv-contact-pill">${c}</div>`).join('');
  const exps = (d.experiences||[]).map(e=>`
    <div class="cv-entry">
      <div class="cv-entry-name">${esc(e.poste)}</div>
      <div class="cv-entry-sub">${esc(e.entreprise)}</div>
      <span class="cv-entry-date-badge">${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</span>
      ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
    </div>`).join('');
  const forms = (d.formations||[]).map(f=>`
    <div class="cv-entry">
      <div class="cv-entry-name">${esc(f.diplome)}</div>
      <div class="cv-entry-sub">${esc(f.etablissement)}</div>
      <span class="cv-entry-date-badge">${esc(f.annee)}</span>
    </div>`).join('');
  const skills = (d.competences||[]).map(s=>`
    <div class="cv-skill-item"><span>${esc(s.label)}</span>
    <span class="cv-skill-badge">${s.niveau>=80?'Expert':s.niveau>=60?'Avancé':'Interm.'}</span></div>`).join('');
  const niveaux=['','Notions','Scolaire','Intermédiaire','Courant','Bilingue'];
  const langs = (d.langues||[]).map(l=>`
    <div class="cv-skill-item"><span>${esc(l.label)}</span><span class="cv-skill-badge">${niveaux[l.niveau]||''}</span></div>`).join('');
  return `<div class="cv-page tpl-executive">
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div style="flex:1;">
        <div class="cv-name">${esc(d.prenom)} ${esc(d.nom)}</div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' — '+esc(d.entreprise):''}</div>
        <div class="cv-header-contacts">${contacts}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
        ${forms?`<div class="cv-section-title">Formation</div>${forms}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title">Compétences</div>${skills}`:''}
        ${langs?`<div class="cv-section-title">Langues</div>${langs}`:''}
        ${d.centres?`<div class="cv-section-title">Intérêts</div><div class="cv-entry-desc">${esc(d.centres)}</div>`:''}
      </div>
    </div>
  </div>`;
}

// ── T3 MINIMAL ───────────────────────────────────
function buildMinimal(d) {
  const contacts = [d.email,d.telephone,d.adresse,d.linkedin].filter(Boolean).map(esc).join(' · ');
  const exps = (d.experiences||[]).map(e=>`
    <div class="cv-entry">
      <div class="cv-entry-date">${esc(e.debut)}${e.fin?'–'+esc(e.fin):''}</div>
      <div>
        <div class="cv-entry-name">${esc(e.poste)}</div>
        <div class="cv-entry-sub">${esc(e.entreprise)}</div>
        ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
      </div>
    </div>`).join('');
  const forms = (d.formations||[]).map(f=>`
    <div class="cv-entry">
      <div class="cv-entry-date">${esc(f.annee)}</div>
      <div><div class="cv-entry-name">${esc(f.diplome)}</div><div class="cv-entry-sub">${esc(f.etablissement)}</div></div>
    </div>`).join('');
  const skills = (d.competences||[]).map(s=>`<span class="cv-skill-pill">${esc(s.label)}</span>`).join('');
  const niveaux=['','Notions','Scolaire','Intermédiaire','Courant','Bilingue'];
  const langs = (d.langues||[]).map(l=>`<span class="cv-skill-pill">${esc(l.label)} · ${niveaux[l.niveau]||''}</span>`).join('');
  return `<div class="cv-page tpl-minimal">
    <div class="cv-header">
      <div>
        <div class="cv-name">${esc(d.prenom)} ${esc(d.nom)}</div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' — '+esc(d.entreprise):''}</div>
        ${contacts?`<div class="cv-contact-line">${contacts}</div>`:''}
      </div>
      ${photoHTML(d.photo)}
    </div>
    ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="margin-bottom:14px;">${esc(d.resume)}</div>`:''}
    ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
    ${forms?`<div class="cv-section-title">Formation</div>${forms}`:''}
    ${skills?`<div class="cv-section-title">Compétences</div><div class="cv-skills-wrap">${skills}</div>`:''}
    ${langs?`<div class="cv-section-title" style="margin-top:14px;">Langues</div><div class="cv-skills-wrap">${langs}</div>`:''}
  </div>`;
}
