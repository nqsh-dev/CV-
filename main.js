// ══════════════════════════════════════════════════
//  CV+ — Main Process Electron
//  Pont sécurisé : Renderer → Backend CamperPay
// ══════════════════════════════════════════════════
'use strict';

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');

// ── Charger .env AVANT tout require backend ───────
const envPath = app.isPackaged
  ? path.join(process.resourcesPath, '.env')
  : path.join(__dirname, '.env');
require('dotenv').config({ path: envPath });

const PaymentBackend = require('./backend/payment-backend');
const DB             = require('./backend/db');

let mainWindow;
const isDev = process.argv.includes('--dev') || !app.isPackaged;

// ══════════════════════════════════════════════════
//  FENÊTRE
// ══════════════════════════════════════════════════
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280, height: 820, minWidth: 900, minHeight: 600,
    frame: false,
    icon:  path.join(__dirname, 'assets/logo.png'),
    webPreferences: {
      preload:          path.join(__dirname, 'preload/preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      sandbox:          false,
    },
    backgroundColor: '#F5F7FA',
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

// ══════════════════════════════════════════════════
//  IPC — CONTRÔLES FENÊTRE
// ══════════════════════════════════════════════════
ipcMain.on('window:minimize',  () => mainWindow?.minimize());
ipcMain.on('window:maximize',  () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.on('window:close',     () => mainWindow?.close());
ipcMain.on('open-external',    (_, url) => shell.openExternal(url));

// ══════════════════════════════════════════════════
//  IPC — PAIEMENT
//  RÈGLE CRITIQUE : L'abonnement est activé ICI
//  dans le Main Process, et UNIQUEMENT si le
//  backend confirme status === 'SUCCESS'.
//  Le Renderer ne peut pas s'auto-activer.
// ══════════════════════════════════════════════════

// ÉTAPE 1 — Initiation → retourne transaction_id + PENDING
ipcMain.handle('payment:initiate', async (event, { planId, phone, operator, user }) => {
  console.log(`[Main] payment:initiate — plan=${planId} op=${operator} tel=${phone}`);
  try {
    const data = await PaymentBackend.initiate({ planId, phone, operator, user });
    // Sanity check : on ne doit jamais retourner SUCCESS ici
    if (data.status === 'SUCCESS') {
      console.error('[Main] ALERTE : backend a retourné SUCCESS à l\'initiation. Forcé à PENDING.');
      data.status = 'PENDING';
    }
    return { success: true, data };
  } catch (err) {
    console.error('[Main] Erreur initiation :', err.message);
    return { success: false, error: err.message };
  }
});

// ÉTAPE 2 — Vérification statut (polling depuis Renderer)
// ✅ FIX BUG 4 : Retourner { success, transactionId, status, planId }
//    directement (plus de double-nesting .status.status)
ipcMain.handle('payment:check-status', async (event, { transactionId }) => {
  console.log(`[Main] payment:check-status — txn=${transactionId}`);
  try {
    const result = await PaymentBackend.checkStatus(transactionId);
    // result = { transactionId, status, planId, amount, updatedAt }

    // ✅ ACTIVATION SÉCURISÉE : uniquement si SUCCESS confirmé par CamperPay
    if (result.status === 'SUCCESS' && result.planId) {
      const userEmail = result.userEmail || null;
      if (userEmail) {
        DB.activatePlan(userEmail, result.planId, transactionId);
        console.log(`[Main] ✅ Abonnement ${result.planId} activé pour ${userEmail}`);
      }
    }

    // Retourner à plat — le Renderer lit directement result.status
    return {
      success:       true,
      transactionId: result.transactionId,
      status:        result.status,   // 'PENDING' | 'SUCCESS' | 'FAILED'
      planId:        result.planId,
      amount:        result.amount,
    };
  } catch (err) {
    console.error('[Main] Erreur check-status :', err.message);
    return { success: false, error: err.message };
  }
});

// ÉTAPE 3 — Remboursement (admin)
ipcMain.handle('payment:refund', async (event, { transactionId }) => {
  try {
    const data = await PaymentBackend.refund(transactionId);
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ── Démarrage log ─────────────────────────────────
console.log('══════════════════════════════════════');
console.log('  CV+ Electron');
console.log(`  Mode    : ${isDev ? 'DEV' : 'PRODUCTION'}`);
console.log(`  CamperPay ENV : ${process.env.CAMERPAY_ENV || '⚠️ non défini'}`);
console.log(`  API Key : ${process.env.CAMERPAY_API_KEY ? '✅ Chargée' : '❌ MANQUANTE'}`);
console.log('══════════════════════════════════════');
