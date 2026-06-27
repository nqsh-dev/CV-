// ══════════════════════════════════════════════════
//  CV+ — Base de données locale (JSON)
//  Stocke les utilisateurs et abonnements confirmés
// ══════════════════════════════════════════════════

'use strict';

const fs   = require('fs');
const path = require('path');
const { app } = require('electron');

// Fichier stocké dans %AppData%/CVPlus/ (Windows)
// ou ~/Library/Application Support/CVPlus/ (Mac)
const DB_DIR  = app ? path.join(app.getPath('userData'), 'CVPlus') : '/tmp/CVPlus';
const DB_FILE = path.join(DB_DIR, 'database.json');

// Structure initiale
const DEFAULT_DB = {
  version: 1,
  users:   {},           // { email: { nom, email, plan, cvCount, txHistory } }
  created: Date.now(),
  updated: Date.now(),
};

// ── Charger la DB ─────────────────────────────────
function load() {
  try {
    if (!fs.existsSync(DB_DIR))  fs.mkdirSync(DB_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) save(DEFAULT_DB);
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch(e) {
    console.error('[DB] Erreur lecture:', e.message);
    return { ...DEFAULT_DB };
  }
}

// ── Sauvegarder la DB ─────────────────────────────
function save(data) {
  try {
    data.updated = Date.now();
    if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch(e) {
    console.error('[DB] Erreur écriture:', e.message);
  }
}

// ── Activer un abonnement après paiement confirmé ─
function activatePlan(email, planId, transactionId) {
  const db = load();
  if (!db.users[email]) {
    db.users[email] = { email, plan: null, cvCount: 0, txHistory: [] };
  }
  db.users[email].plan    = planId;
  db.users[email].cvCount = 0;
  db.users[email].txHistory.push({
    transactionId,
    planId,
    date:   new Date().toISOString(),
    amount: { starter:500, pro:1500, premium:3750 }[planId],
  });
  save(db);
  console.log(`[DB] Plan ${planId} activé pour ${email} (txn: ${transactionId})`);
  return db.users[email];
}

// ── Récupérer les infos d'un utilisateur ──────────
function getUser(email) {
  const db = load();
  return db.users[email] || null;
}

module.exports = { load, save, activatePlan, getUser };
