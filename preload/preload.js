// ══════════════════════════════════════════════════
//  CV+ — Preload (contextBridge)
//  Seul pont autorisé Renderer ↔ Main
// ══════════════════════════════════════════════════
'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cvplusAPI', {

  // Contrôles fenêtre
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close:    () => ipcRenderer.send('window:close'),
  },

  // Paiement
  payment: {
    /**
     * Initier un paiement.
     * Retourne { success, data: { transaction_id, status:'PENDING', ... } }
     * Ne jamais activer l'abonnement sur ce retour.
     */
    initiate: (params) =>
      ipcRenderer.invoke('payment:initiate', params),

    /**
     * Vérifier le statut d'une transaction.
     * Retourne { success, transactionId, status, planId, amount }
     * status : 'PENDING' | 'SUCCESS' | 'FAILED'
     * N'activer l'abonnement QUE si status === 'SUCCESS'.
     */
    checkStatus: (transactionId) =>
      ipcRenderer.invoke('payment:check-status', { transactionId }),

    /**
     * Rembourser (admin uniquement).
     */
    refund: (transactionId) =>
      ipcRenderer.invoke('payment:refund', { transactionId }),
  },

  openExternal: (url) => ipcRenderer.send('open-external', url),

  env: {
    isElectron: true,
    platform:   process.platform,
  },
});
