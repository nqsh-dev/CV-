// ── Templates 4-15 — Système uniforme ────────────
// Photo : photoHTML() → 80×80 cercle partout
// Contacts : contactItems() → SVG inline

// ── T4 CREATIVE ──────────────────────────────────
function buildCreative(d) {
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:rgba(255,255,255,0.7);');
  const exps = (d.experiences||[]).map(e=>`
    <div class="cv-entry tpl-creative" style="padding-left:12px;border-left:3px solid #A855F7;margin-bottom:12px;">
      <div class="cv-entry-name">${esc(e.poste)}</div>
      <div class="cv-entry-sub" style="color:#A855F7;">${esc(e.entreprise)}</div>
      <div class="cv-entry-date">${esc(e.debut)}${e.fin?' — '+esc(e.fin):''}</div>
      ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
    </div>`).join('');
  const forms = (d.formations||[]).map(f=>`
    <div style="padding-left:12px;border-left:3px solid #EC4899;margin-bottom:10px;">
      <div class="cv-entry-name">${esc(f.diplome)}</div>
      <div class="cv-entry-sub" style="color:#EC4899;">${esc(f.etablissement)}</div>
      <div class="cv-entry-date">${esc(f.annee)}</div>
    </div>`).join('');
  const skills = (d.competences||[]).map(s=>`<span class="cv-skill-tag">${esc(s.label)}</span>`).join('');
  const niveaux=['','Notions','Scolaire','Intermédiaire','Courant','Bilingue'];
  const langs=(d.langues||[]).map(l=>`<div style="display:flex;justify-content:space-between;font-size:8.5pt;margin-bottom:5px;"><span style="color:#555;">${esc(l.label)}</span><span style="color:#A855F7;font-weight:600;">${niveaux[l.niveau]||''}</span></div>`).join('');
  return `<div class="cv-page tpl-creative">
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div style="flex:1;position:relative;z-index:1;">
        <div class="cv-name" style="font-size:19pt;font-weight:800;color:#fff;line-height:1.1;">${esc(d.prenom)} ${esc(d.nom)}</div>
        <div class="cv-title" style="font-size:9.5pt;color:#C084FC;margin-top:4px;">${esc(d.titre)}${d.entreprise?' · '+esc(d.entreprise):''}</div>
        <div style="display:flex;flex-wrap:wrap;gap:5px 14px;margin-top:10px;">${contacts.join('')}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title" style="color:#A855F7;">Profil</div><div class="cv-entry-desc" style="margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title" style="color:#A855F7;">Expériences</div>${exps}`:''}
        ${forms?`<div class="cv-section-title" style="color:#EC4899;">Formation</div>${forms}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title" style="color:#A855F7;">Compétences</div><div style="margin-bottom:14px;">${skills}</div>`:''}
        ${langs?`<div class="cv-section-title" style="color:#EC4899;">Langues</div>${langs}`:''}
        ${d.centres?`<div class="cv-section-title" style="color:#A855F7;">Intérêts</div><div class="cv-entry-desc">${esc(d.centres)}</div>`:''}
      </div>
    </div>
  </div>`;
}

// ── T5 TECH DARK ─────────────────────────────────
function buildTechDark(d) {
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:#666;');
  const exps=(d.experiences||[]).map(e=>`
    <div style="margin-bottom:13px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="cv-entry-name" style="color:#00FF88;">${esc(e.poste)}</div>
        <span style="font-size:7.5pt;color:#555;background:#1A1A1A;padding:2px 7px;border-radius:3px;">${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</span>
      </div>
      <div class="cv-entry-sub" style="color:#888;">${esc(e.entreprise)}</div>
      ${e.description?`<div class="cv-entry-desc" style="color:#AAA;border-left:2px solid rgba(0,255,136,0.3);padding-left:8px;margin-top:4px;">${esc(e.description)}</div>`:''}
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div style="margin-bottom:9px;">
      <div class="cv-entry-name" style="color:#00BFFF;">${esc(f.diplome)}</div>
      <div class="cv-entry-sub" style="color:#777;">${esc(f.etablissement)}${f.annee?' · '+esc(f.annee):''}</div>
    </div>`).join('');
  const skills=(d.competences||[]).map(s=>`
    <div class="cv-skill-row">
      <div class="cv-skill-label" style="color:#CCC;">${esc(s.label)}</div>
      <div class="cv-skill-track"><div class="cv-skill-fill" style="width:${s.niveau}%;"></div></div>
    </div>`).join('');
  const niveaux=['','Notions','Scolaire','Intermédiaire','Courant','Bilingue'];
  const langs=(d.langues||[]).map(l=>`<span style="display:inline-block;padding:3px 9px;margin:2px;border:1px solid rgba(0,255,136,0.4);border-radius:3px;font-size:8pt;color:#00FF88;">${esc(l.label)} · ${niveaux[l.niveau]||''}</span>`).join('');
  return `<div class="cv-page tpl-techdark">
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div>
        <div class="cv-name">${esc(d.prenom).toUpperCase()} <span style="color:#00FF88;">${esc(d.nom).toUpperCase()}</span></div>
        <div class="cv-title">&gt; ${esc(d.titre)}${d.entreprise?' @ '+esc(d.entreprise):''}</div>
        <div class="cv-header-contacts">${contacts.join('')}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title">// PROFIL</div><div class="cv-entry-desc" style="color:#999;border-left:2px solid rgba(0,255,136,0.3);padding-left:10px;margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title">// EXPÉRIENCES</div>${exps}`:''}
        ${forms?`<div class="cv-section-title" style="color:#00BFFF;">// FORMATION</div>${forms}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title">// STACK</div>${skills}`:''}
        ${langs?`<div class="cv-section-title" style="color:#00BFFF;">// LANGUES</div><div style="margin-top:6px;">${langs}</div>`:''}
      </div>
    </div>
  </div>`;
}

// ── T6 CORPORATE ─────────────────────────────────
function buildCorporate(d) {
  const contacts = [d.email,d.telephone,d.adresse,d.linkedin].filter(Boolean).map(esc).join(' · ');
  const exps=(d.experiences||[]).map(e=>`
    <div class="cv-entry">
      <div class="cv-entry-date" style="text-align:right;color:#999;">${esc(e.debut)}<br>${e.fin?esc(e.fin):'Présent'}</div>
      <div>
        <div class="cv-entry-name">${esc(e.poste)}</div>
        <div class="cv-entry-sub">${esc(e.entreprise)}</div>
        ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
      </div>
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div class="cv-entry">
      <div class="cv-entry-date" style="text-align:right;color:#999;">${esc(f.annee)}</div>
      <div><div class="cv-entry-name">${esc(f.diplome)}</div><div class="cv-entry-sub">${esc(f.etablissement)}</div></div>
    </div>`).join('');
  const skills=(d.competences||[]).map(s=>`<span class="cv-skill-tag">${esc(s.label)}</span>`).join('');
  return `<div class="cv-page tpl-corporate">
    <div class="cv-header">
      <div>
        <div class="cv-name">${esc(d.prenom)} ${esc(d.nom)}</div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' — '+esc(d.entreprise):''}</div>
      </div>
      ${photoHTML(d.photo)}
    </div>
    ${contacts?`<div class="cv-contacts">${contacts}</div>`:''}
    ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="margin-bottom:18px;">${esc(d.resume)}</div>`:''}
    ${exps?`<div class="cv-section-title">Expériences Professionnelles</div>${exps}`:''}
    ${forms?`<div class="cv-section-title">Formation</div>${forms}`:''}
    ${skills?`<div class="cv-section-title">Compétences</div><div>${skills}</div>`:''}
  </div>`;
}

// ── T7 SUNSET ────────────────────────────────────
function buildSunset(d) {
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:rgba(255,255,255,0.8);');
  const exps=(d.experiences||[]).map(e=>`
    <div style="padding-left:12px;border-left:3px solid #FF6B35;margin-bottom:12px;">
      <div class="cv-entry-name">${esc(e.poste)}</div>
      <div class="cv-entry-sub" style="color:#FF6B35;">${esc(e.entreprise)}</div>
      <div class="cv-entry-date">${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</div>
      ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div style="padding-left:12px;border-left:3px solid #FFA726;margin-bottom:10px;">
      <div class="cv-entry-name">${esc(f.diplome)}</div>
      <div class="cv-entry-sub" style="color:#FF8E53;">${esc(f.etablissement)}${f.annee?' · '+esc(f.annee):''}</div>
    </div>`).join('');
  const skills=(d.competences||[]).map(s=>`
    <div class="cv-skill-row">
      <div style="font-size:8.5pt;color:#333;margin-bottom:3px;">${esc(s.label)}</div>
      <div class="cv-skill-track"><div class="cv-skill-fill" style="width:${s.niveau}%;"></div></div>
    </div>`).join('');
  return `<div class="cv-page tpl-sunset">
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div style="flex:1;">
        <div class="cv-name">${esc(d.prenom)} ${esc(d.nom)}</div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' · '+esc(d.entreprise):''}</div>
        <div class="cv-header-contacts">${contacts.join('')}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title">Compétences</div>${skills}`:''}
        ${forms?`<div class="cv-section-title">Formation</div>${forms}`:''}
      </div>
    </div>
  </div>`;
}

// ── T8 NATURE ────────────────────────────────────
function buildNature(d) {
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:rgba(255,255,255,0.75);');
  const exps=(d.experiences||[]).map(e=>`
    <div class="cv-entry-card">
      <div class="cv-entry-name">${esc(e.poste)}</div>
      <div class="cv-entry-sub">${esc(e.entreprise)}</div>
      <div class="cv-entry-date">${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</div>
      ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div style="margin-bottom:9px;">
      <div class="cv-entry-name">${esc(f.diplome)}</div>
      <div class="cv-entry-sub">${esc(f.etablissement)}${f.annee?' · '+esc(f.annee):''}</div>
    </div>`).join('');
  const skills=(d.competences||[]).map(s=>`<span class="cv-skill-tag">${esc(s.label)}</span>`).join('');
  const niveaux=['','🌱','🌿','🍀','🌳','🌲'];
  const langs=(d.langues||[]).map(l=>`<div style="display:flex;justify-content:space-between;font-size:8.5pt;margin-bottom:5px;"><span>${esc(l.label)}</span><span>${niveaux[l.niveau]||''}</span></div>`).join('');
  return `<div class="cv-page tpl-nature">
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div style="flex:1;">
        <div class="cv-name">${esc(d.prenom)} ${esc(d.nom)}</div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' · '+esc(d.entreprise):''}</div>
        <div class="cv-header-contacts">${contacts.join('')}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="background:#F0FBF4;padding:10px;border-radius:7px;margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title">Compétences</div><div style="margin-bottom:12px;">${skills}</div>`:''}
        ${forms?`<div class="cv-section-title">Formation</div>${forms}`:''}
        ${langs?`<div class="cv-section-title">Langues</div>${langs}`:''}
        ${d.centres?`<div class="cv-section-title">Intérêts</div><div class="cv-entry-desc">${esc(d.centres)}</div>`:''}
      </div>
    </div>
  </div>`;
}

// ── T9 GOLD ──────────────────────────────────────
function buildGold(d) {
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:#C9A84C;');
  const exps=(d.experiences||[]).map(e=>`
    <div style="margin-bottom:13px;padding-bottom:13px;border-bottom:1px solid #F5E6C3;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div class="cv-entry-name">${esc(e.poste)}</div>
        <span class="cv-entry-date-badge">${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</span>
      </div>
      <div class="cv-entry-sub">${esc(e.entreprise)}</div>
      ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div style="padding-left:12px;border-left:2px solid #D4AF37;margin-bottom:9px;">
      <div class="cv-entry-name">${esc(f.diplome)}</div>
      <div class="cv-entry-sub">${esc(f.etablissement)}${f.annee?' · '+esc(f.annee):''}</div>
    </div>`).join('');
  const skills=(d.competences||[]).map(s=>`<span class="cv-skill-tag">${esc(s.label)}</span>`).join('');
  return `<div class="cv-page tpl-gold">
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div style="flex:1;">
        <div class="cv-name">${esc(d.prenom)} <span style="color:#fff;">${esc(d.nom)}</span></div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' — '+esc(d.entreprise):''}</div>
        <div class="cv-header-contacts">${contacts.join('')}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="font-style:italic;border-left:3px solid #D4AF37;padding-left:12px;margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title">Compétences</div><div style="margin-bottom:12px;">${skills}</div>`:''}
        ${forms?`<div class="cv-section-title">Formation</div>${forms}`:''}
      </div>
    </div>
  </div>`;
}

// ── T10 OCEAN ────────────────────────────────────
function buildOcean(d) {
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:rgba(255,255,255,0.8);');
  const exps=(d.experiences||[]).map(e=>`
    <div class="cv-timeline-entry">
      <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
        <div class="cv-timeline-dot"></div>
        <div style="width:1px;flex:1;background:#BAE6FD;margin-top:3px;"></div>
      </div>
      <div style="padding-bottom:12px;">
        <div class="cv-entry-name">${esc(e.poste)}</div>
        <div class="cv-entry-sub">${esc(e.entreprise)}</div>
        <div class="cv-entry-date">${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</div>
        ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
      </div>
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div class="cv-entry-card">
      <div class="cv-entry-name">${esc(f.diplome)}</div>
      <div class="cv-entry-sub">${esc(f.etablissement)}${f.annee?' · '+esc(f.annee):''}</div>
    </div>`).join('');
  const skills=(d.competences||[]).map(s=>`
    <div class="cv-skill-row">
      <div style="font-size:8.5pt;color:#0C4A6E;margin-bottom:3px;">${esc(s.label)}</div>
      <div class="cv-skill-track"><div class="cv-skill-fill" style="width:${s.niveau}%;"></div></div>
    </div>`).join('');
  return `<div class="cv-page tpl-ocean">
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div style="flex:1;">
        <div class="cv-name">${esc(d.prenom)} ${esc(d.nom)}</div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' · '+esc(d.entreprise):''}</div>
        <div class="cv-header-contacts">${contacts.join('')}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="border-left:3px solid #0EA5E9;padding-left:10px;background:#F0F9FF;padding:10px;border-radius:7px;margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title">Compétences</div>${skills}`:''}
        ${forms?`<div class="cv-section-title">Formation</div>${forms}`:''}
      </div>
    </div>
  </div>`;
}

// ── T11 ROSE ─────────────────────────────────────
function buildRose(d) {
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:rgba(255,255,255,0.8);');
  const exps=(d.experiences||[]).map(e=>`
    <div class="cv-entry-card">
      <div class="cv-entry-name">${esc(e.poste)}</div>
      <div class="cv-entry-sub">${esc(e.entreprise)}</div>
      <div class="cv-entry-date">${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</div>
      ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div style="padding-left:12px;border-left:3px solid #FB7185;margin-bottom:9px;">
      <div class="cv-entry-name">${esc(f.diplome)}</div>
      <div class="cv-entry-sub">${esc(f.etablissement)}${f.annee?' · '+esc(f.annee):''}</div>
    </div>`).join('');
  const skills=(d.competences||[]).map(s=>`<span class="cv-skill-tag">${esc(s.label)}</span>`).join('');
  return `<div class="cv-page tpl-rose">
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div style="flex:1;">
        <div class="cv-name">${esc(d.prenom)} ${esc(d.nom)}</div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' · '+esc(d.entreprise):''}</div>
        <div class="cv-header-contacts">${contacts.join('')}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="background:#FFF5F7;padding:10px;border-radius:7px;margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title">Compétences</div><div style="margin-bottom:12px;">${skills}</div>`:''}
        ${forms?`<div class="cv-section-title">Formation</div>${forms}`:''}
      </div>
    </div>
  </div>`;
}

// ── T12 SLATE ────────────────────────────────────
function buildSlate(d) {
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:#64748B;');
  const exps=(d.experiences||[]).map(e=>`
    <div style="margin-bottom:13px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="cv-entry-name">${esc(e.poste)}</div>
        <span class="cv-entry-date-badge">${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</span>
      </div>
      <div class="cv-entry-sub">${esc(e.entreprise)}</div>
      ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div style="margin-bottom:9px;">
      <div class="cv-entry-name">${esc(f.diplome)}</div>
      <div class="cv-entry-sub">${esc(f.etablissement)}${f.annee?' · '+esc(f.annee):''}</div>
    </div>`).join('');
  const skills=(d.competences||[]).map(s=>`
    <div class="cv-skill-row">
      <div style="font-size:8.5pt;color:#334155;margin-bottom:3px;">${esc(s.label)}</div>
      <div class="cv-skill-track"><div class="cv-skill-fill" style="width:${s.niveau}%;"></div></div>
    </div>`).join('');
  return `<div class="cv-page tpl-slate">
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div style="flex:1;">
        <div class="cv-name">${esc(d.prenom)} ${esc(d.nom)}</div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' · '+esc(d.entreprise):''}</div>
        <div class="cv-header-contacts">${contacts.join('')}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="background:#F8FAFC;padding:10px;border-radius:6px;margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
        ${(d.formations||[]).length?`<div class="cv-section-title">Formation</div>${forms}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title">Compétences</div>${skills}`:''}
      </div>
    </div>
  </div>`;
}

// ── T13 SPLIT ────────────────────────────────────
function buildSplit(d) {
  const niveaux=['','Notions','Scolaire','Intermédiaire','Courant','Bilingue'];
  const skills=(d.competences||[]).map(s=>`
    <div class="cv-skill-row">
      <div class="cv-skill-label">${esc(s.label)}</div>
      <div class="cv-skill-track"><div class="cv-skill-fill" style="width:${s.niveau}%;"></div></div>
    </div>`).join('');
  const langs=(d.langues||[]).map(l=>`<div style="display:flex;justify-content:space-between;font-size:8.5pt;color:#CBD5E1;margin-bottom:5px;"><span>${esc(l.label)}</span><span style="color:#6366F1;">${niveaux[l.niveau]||''}</span></div>`).join('');
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:#CBD5E1;');
  const exps=(d.experiences||[]).map(e=>`
    <div class="cv-entry-card">
      <div class="cv-entry-name">${esc(e.poste)}</div>
      <div class="cv-entry-sub">${esc(e.entreprise)}</div>
      <div class="cv-entry-date">${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</div>
      ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div style="margin-bottom:9px;"><div class="cv-entry-name">${esc(f.diplome)}</div><div class="cv-entry-sub">${esc(f.etablissement)}${f.annee?' · '+esc(f.annee):''}</div></div>`).join('');
  return `<div class="cv-page tpl-split">
    <div class="cv-sidebar">
      ${photoHTML(d.photo)}
      <div class="cv-name" style="margin-top:12px;">${esc(d.prenom)} ${esc(d.nom)}</div>
      <div class="cv-title">${esc(d.titre)}${d.entreprise?'<br><span style="color:#6366F1;">'+esc(d.entreprise)+'</span>':''}</div>
      <div class="cv-section-title-side" style="margin-top:16px;">Contact</div>
      ${contacts.map(c=>`<div class="cv-contact-item">${c}</div>`).join('')}
      ${skills?`<div class="cv-section-title-side">Compétences</div>${skills}`:''}
      ${langs?`<div class="cv-section-title-side">Langues</div>${langs}`:''}
    </div>
    <div class="cv-main">
      ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="background:#F5F3FF;border-left:3px solid #6366F1;padding:10px;border-radius:7px;margin-bottom:14px;">${esc(d.resume)}</div>`:''}
      ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
      ${forms?`<div class="cv-section-title">Formation</div>${forms}`:''}
      ${d.centres?`<div class="cv-section-title">Intérêts</div><div class="cv-entry-desc">${esc(d.centres)}</div>`:''}
    </div>
  </div>`;
}

// ── T14 INFOGRAPHIC ──────────────────────────────
function buildInfographic(d) {
  const COLORS=['#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981','#06B6D4'];
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:#64748B;');
  const exps=(d.experiences||[]).map((e,i)=>`
    <div class="cv-timeline-entry">
      <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
        <div class="cv-timeline-dot" style="background:${COLORS[i%COLORS.length]};"></div>
        <div style="width:2px;flex:1;background:${COLORS[i%COLORS.length]}22;margin-top:3px;"></div>
      </div>
      <div style="padding-bottom:12px;">
        <div class="cv-entry-name">${esc(e.poste)}</div>
        <div class="cv-entry-sub" style="color:${COLORS[i%COLORS.length]};">${esc(e.entreprise)}</div>
        <div class="cv-entry-date">${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</div>
        ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
      </div>
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div style="background:#F8FAFC;border-radius:7px;padding:9px 11px;margin-bottom:8px;">
      <div class="cv-entry-name">${esc(f.diplome)}</div>
      <div class="cv-entry-sub">${esc(f.etablissement)}${f.annee?' · '+esc(f.annee):''}</div>
    </div>`).join('');
  const skills=(d.competences||[]).map((s,i)=>`
    <div class="cv-skill-row">
      <div style="display:flex;justify-content:space-between;font-size:8.5pt;margin-bottom:3px;">
        <span>${esc(s.label)}</span><span style="color:${COLORS[i%COLORS.length]};font-weight:600;">${s.niveau}%</span>
      </div>
      <div class="cv-skill-track"><div style="height:100%;width:${s.niveau}%;background:${COLORS[i%COLORS.length]};border-radius:3px;"></div></div>
    </div>`).join('');
  return `<div class="cv-page tpl-infographic">
    <div class="cv-top-bar"></div>
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div style="flex:1;">
        <div class="cv-name">${esc(d.prenom)} ${esc(d.nom)}</div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' · '+esc(d.entreprise):''}</div>
        <div class="cv-header-contacts">${contacts.join('')}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="border-left:4px solid #3B82F6;padding:10px;background:#F8FAFC;border-radius:7px;margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title" style="color:#8B5CF6;">Compétences</div>${skills}`:''}
        ${forms?`<div class="cv-section-title" style="color:#EC4899;">Formation</div>${forms}`:''}
      </div>
    </div>
    <div class="cv-bottom-bar"></div>
  </div>`;
}

// ── T15 BOLD ─────────────────────────────────────
function buildBold(d) {
  const contacts = contactItems(d, 'display:inline-flex;align-items:center;gap:5px;font-size:8pt;color:#999;');
  const exps=(d.experiences||[]).map(e=>`
    <div class="cv-entry-card">
      <div class="cv-entry-name" style="text-transform:uppercase;letter-spacing:0.5px;">${esc(e.poste)}</div>
      <div class="cv-entry-sub">${esc(e.entreprise)} · ${esc(e.debut)}${e.fin?' – '+esc(e.fin):''}</div>
      ${e.description?`<div class="cv-entry-desc">${esc(e.description)}</div>`:''}
    </div>`).join('');
  const forms=(d.formations||[]).map(f=>`
    <div style="padding-left:12px;border-left:3px solid #FFD700;margin-bottom:10px;">
      <div class="cv-entry-name" style="text-transform:uppercase;font-size:9.5pt;">${esc(f.diplome)}</div>
      <div class="cv-entry-sub">${esc(f.etablissement)}${f.annee?' · '+esc(f.annee):''}</div>
    </div>`).join('');
  const skills=(d.competences||[]).map(s=>`<span class="cv-skill-tag">${esc(s.label)}</span>`).join('');
  return `<div class="cv-page tpl-bold">
    <div class="cv-header">
      ${photoHTML(d.photo)}
      <div style="flex:1;position:relative;z-index:1;">
        <div class="cv-name">${esc(d.prenom)} <span class="cv-name-last">${esc(d.nom)}</span></div>
        <div class="cv-title">${esc(d.titre)}${d.entreprise?' · '+esc(d.entreprise):''}</div>
        <div class="cv-header-contacts" style="padding-top:10px;border-top:1px solid #333;margin-top:10px;">${contacts.join('')}</div>
      </div>
    </div>
    <div class="cv-body">
      <div class="cv-col-main">
        ${d.resume?`<div class="cv-section-title">Profil</div><div class="cv-entry-desc" style="margin-bottom:14px;">${esc(d.resume)}</div>`:''}
        ${exps?`<div class="cv-section-title">Expériences</div>${exps}`:''}
      </div>
      <div class="cv-col-side">
        ${skills?`<div class="cv-section-title">Skills</div><div style="margin-bottom:12px;">${skills}</div>`:''}
        ${forms?`<div class="cv-section-title">Formation</div>${forms}`:''}
      </div>
    </div>
  </div>`;
}
