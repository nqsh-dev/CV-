// ══════════════════════════════════════════════════
//  CV+ — Backend CamperPay (Main Process ONLY)
//  ⚠️  Clé API isolée ici, jamais dans le Renderer
// ══════════════════════════════════════════════════
'use strict';

const fetch = require('node-fetch');

// ── Config depuis .env ────────────────────────────
const CONFIG = {
  apiKey:  process.env.CAMERPAY_API_KEY,
  secret:  process.env.CAMERPAY_SECRET,
  // ✅ FIX BUG 1 : URL de base correcte sans slash final
  baseUrl: (process.env.CAMERPAY_BASE_URL || 'https://camerpay.com/api/v1').replace(/\/$/, ''),
  env:     process.env.CAMERPAY_ENV || 'sandbox',
};

function buildCamperPayUrls(path) {
  const normalizedBase = CONFIG.baseUrl
    .replace(/\/+$/g, '')
    .replace(/\/(api\/v1|api|v1)$/i, '');

  const variants = [
    normalizedBase,
    `${normalizedBase}/api`,
    `${normalizedBase}/v1`,
    `${normalizedBase}/api/v1`,
  ];

  return [...new Set(variants.map(prefix => `${prefix}${path}`))];
}

// ── Plans ─────────────────────────────────────────
const PLANS = {
  starter: { id:'starter', label:'Abonnement Starter — 2 CV',          amount:500,  currency:'XAF', duration:'1 mois'  },
  pro:     { id:'pro',     label:'Abonnement Pro — CV illimités',       amount:1500, currency:'XAF', duration:'1 mois'  },
  premium: { id:'premium', label:'Abonnement Premium — Tout inclus',    amount:3750, currency:'XAF', duration:'3 mois'  },
};

// ── Stockage transactions (Main Process) ──────────
// Clé : transactionId → objet transaction
const transactions = new Map();

// ══════════════════════════════════════════════════
//  MACHINE D'ÉTATS : PENDING → SUCCESS | FAILED
//  Un abonnement n'est JAMAIS activé ici.
//  L'activation se fait dans main.js APRÈS
//  confirmation du statut SUCCESS par CamperPay.
// ══════════════════════════════════════════════════

// ── FONCTION 1 : Initier le paiement ─────────────
async function initiate({ planId, phone, operator, user }) {

  // Validation stricte
  if (!CONFIG.apiKey || CONFIG.apiKey === 'ta_cle_api_camerpay_ici') {
    throw new Error('Clé API CamperPay non configurée. Édite le fichier .env');
  }
  const plan = PLANS[planId];
  if (!plan)                           throw new Error(`Plan inconnu : ${planId}`);
  if (!phone || phone.length < 9)      throw new Error('Numéro de téléphone invalide (9 chiffres requis)');
  if (!['mtn','orange'].includes(operator)) throw new Error('Opérateur invalide : mtn ou orange');

  // ── SANDBOX : simulation réaliste avec vraie state machine ──
  if (CONFIG.env === 'sandbox') {
    console.log('[Backend/Sandbox] Simulation initiation paiement');
    await delay(600);

    const transactionId = generateTxnId();

    // ✅ FIX BUG 3 : Sauvegarder AVANT le setTimeout
    transactions.set(transactionId, {
      id:        transactionId,
      planId,
      userEmail: user?.email,
      amount:    plan.amount,
      phone,
      operator,
      status:    'PENDING',   // État initial = PENDING, jamais SUCCESS
      created:   Date.now(),
      updated:   Date.now(),
    });

    // Simuler la confirmation opérateur après 4s (sandbox uniquement)
    setTimeout(() => {
      const tx = transactions.get(transactionId);
      if (tx && tx.status === 'PENDING') {
        tx.status  = 'SUCCESS';
        tx.updated = Date.now();
        console.log(`[Backend/Sandbox] Transaction ${transactionId} → SUCCESS`);
      }
    }, 4000);

    // Retourner PENDING — jamais SUCCESS immédiatement
    return {
      transaction_id: transactionId,
      status:         'PENDING',
      message:        `[SANDBOX] Notification simulée envoyée au ${phone}`,
      amount:         plan.amount,
      currency:       plan.currency,
    };
  }

  // ── PRODUCTION : appel réel CamperPay ────────────
  // ✅ FIX BUG 1 : Bon endpoint CamperPay
  // ✅ FIX BUG 2 : Bon payload (phone_number, service, not phone/operator)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const serviceMap = {
      mtn: 'mtn_mobile_money',
      orange: 'orange_money',
    };

    const service = serviceMap[operator?.toLowerCase()];
    if (!service) {
      throw new Error('Opérateur non supporté');
    }

    if (!process.env.CAMERPAY_CALLBACK_URL || !process.env.CAMERPAY_RETURN_URL) {
      throw new Error('CAMERPAY_CALLBACK_URL et CAMERPAY_RETURN_URL doivent être définis dans .env');
    }

    const payload = {
      payment_method:        service,
      amount:                plan.amount,
      currency:              plan.currency,
      customer_phone:        phone,
      merchant_invoice_id:   generateTxnId(),
      merchant_callback_url: process.env.CAMERPAY_CALLBACK_URL || '',
      merchant_return_url:   process.env.CAMERPAY_RETURN_URL || '',
      source:                'api',
      description:           plan.label,
      customer_name:         user?.nom || 'Utilisateur CV+',
      customer_email:        user?.email || '',
      metadata: {
        plan_id:    planId,
        user_email: user?.email,
        app:        'CVPlus',
      },
    };

    const urls = buildCamperPayUrls('/payment/initiate');
    console.log(`[Backend/Prod] Appel CamperPay — ${plan.label} — ${phone} (${operator})`);
    console.log(`[Backend/Prod] Initiate endpoints : ${urls.join(', ')}`);

    let response;
    let data;
    let lastError;
    const tried = [];

    for (const url of urls) {
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.apiKey}`,
            'Accept': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        const contentType = response.headers.get('content-type') || '';
        const rawText = await response.text();

        if (!response.ok) {
          tried.push({ url, status: response.status, body: rawText });
          if (response.status === 404) {
            console.warn(`[Backend/Prod] Endpoint non trouvé, essai suivant : ${url}`);
            continue;
          }
          console.error(`[Backend/Prod] Erreur CamperPay HTTP ${response.status} :`, rawText);
          throw new Error(`Erreur API (${response.status}) : ${rawText}`);
        }

        if (!contentType.includes('application/json')) {
          console.error(`[Backend/Prod] Réponse non-JSON (HTTP ${response.status}) :`, rawText.substring(0, 200));
          throw new Error(`CamperPay a retourné une réponse non-JSON (${response.status}). Vérifie l'URL de base dans .env`);
        }

        data = JSON.parse(rawText);
        if (data.status === 'error' || data.success === false) {
          throw new Error(data.message || data.error || `Erreur CamperPay HTTP ${response.status}`);
        }

        console.log(`[Backend/Prod] Transaction init endpoint trouvé : ${url}`);
        break;

      } catch (netErr) {
        lastError = netErr;
        if (netErr.message.includes('404') || netErr.message.includes('Not Found')) {
          continue;
        }
        throw new Error(`Erreur réseau : ${netErr.message}`);
      }
    }

    if (!response || !response.ok || !data) {
      const details = tried.map(t => `${t.url} (${t.status})`).join(', ');
      throw new Error(`Impossible de trouver un endpoint d'initiation valide pour CamperPay. Essais: ${details}. Dernière erreur: ${lastError?.message || 'aucune réponse'}`);
    }

    const transactionId = extractTransactionId(data);
    if (!transactionId) {
      console.error('[Backend/Prod] Réponse CamperPay sans transaction_id :', data);
      throw new Error(`CamperPay n'a pas retourné de transaction_id. Response keys: ${Object.keys(data).join(', ')}`);
    }

    transactions.set(transactionId, {
      id:        transactionId,
      planId,
      userEmail: user?.email,
      amount:    plan.amount,
      phone,
      operator,
      status:    'PENDING',
      created:   Date.now(),
      updated:   Date.now(),
      raw:       data,
    });

    console.log(`[Backend/Prod] Transaction créée : ${transactionId} → PENDING`);

    return {
      transaction_id: transactionId,
      status:         'PENDING',
      message:        data.message || `Notification envoyée au ${phone}. Confirmez sur votre téléphone.`,
      amount:         plan.amount,
      currency:       plan.currency,
    };

  } finally {
    clearTimeout(timeout);
  }
}

function extractTransactionId(data) {
  return data.transaction_id
    || data.transaction_uuid
    || data.transactionUuid
    || data.transactionId
    || data.id
    || data.data?.transaction_id
    || data.data?.transaction_uuid
    || data.data?.transactionUuid
    || data.data?.transactionId
    || data.data?.id
    || data.result?.transaction_id
    || data.result?.transaction_uuid
    || data.result?.transactionUuid
    || data.result?.transactionId
    || data.result?.id;
}

// ── FONCTION 2 : Vérifier le statut ──────────────
async function checkStatus(transactionId) {
  if (!transactionId) throw new Error('transaction_id manquant');

  // SANDBOX : lire depuis le Map local
  if (CONFIG.env === 'sandbox') {
    const tx = transactions.get(transactionId);
    if (!tx) {
      return { transactionId, status: 'NOT_FOUND', planId: null };
    }
    console.log(`[Backend/Sandbox] Check ${transactionId} → ${tx.status}`);
    return {
      transactionId: tx.id,
      status:        tx.status,     // 'PENDING' | 'SUCCESS' | 'FAILED'
      planId:        tx.planId,
      userEmail:     tx.userEmail,  // ✅ Nécessaire pour activatePlan() dans main.js
      amount:        tx.amount,
      updatedAt:     tx.updated,
    };
  }

  // PRODUCTION : interroger CamperPay
  const endpoints = buildCamperPayUrls(`/payment/${transactionId}`)
    .concat(buildCamperPayUrls(`/payment/status/${transactionId}`))
    .concat(buildCamperPayUrls(`/payment/${transactionId}/status`))
    .concat(buildCamperPayUrls(`/payment/status?transaction_uuid=${transactionId}`))
    .concat(buildCamperPayUrls(`/payment/${transactionId}/query`));

  let response;
  let lastError;
  let data;
  const tried = [];

  for (const url of endpoints) {
    try {
      response = await fetch(url, {
        method:  'GET',
        headers: {
          'Authorization': `Bearer ${CONFIG.apiKey}`,
          'Accept':        'application/json',
        },
        timeout: 10000,
      });

      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();

      if (!response.ok) {
        tried.push({ url, status: response.status, body: rawText });
        if (response.status === 404) {
          console.warn(`[Backend/Prod] Endpoint non trouvé, essai suivant : ${url}`);
          continue;
        }
        throw new Error(rawText || `Erreur check-status HTTP ${response.status}`);
      }

      if (!contentType.includes('application/json')) {
        throw new Error(`Réponse non-JSON de CamperPay (HTTP ${response.status})`);
      }

      data = JSON.parse(rawText);
      if (data.status === 'error' || data.success === false) {
        throw new Error(data.message || data.error || `Erreur check-status HTTP ${response.status}`);
      }

      break;

    } catch (netErr) {
      lastError = netErr;
      if (netErr.message.includes('404') || netErr.message.includes('Not Found')) {
        continue;
      }
      throw new Error(`Erreur réseau check-status : ${netErr.message}`);
    }
  }

  if (!response || !response.ok || !data) {
    const details = tried.map(t => `${t.url} (${t.status})`).join(', ');
    throw new Error(`Impossible de trouver un endpoint de statut valide pour CamperPay. Essais: ${details}. Dernière erreur: ${lastError?.message || 'aucune réponse'}`);
  }

  // Normaliser le statut CamperPay vers nos états internes
  const rawStatus  = (data.status || data.data?.status || '').toUpperCase();
  const normalized = normalizeStatus(rawStatus);

  // Mettre à jour le cache local
  const tx = transactions.get(transactionId);
  if (tx) { tx.status = normalized; tx.updated = Date.now(); }

  console.log(`[Backend/Prod] Check ${transactionId} → ${rawStatus} → ${normalized}`);

  // Parser metadata avec sécurité
  let meta = {};
  try { meta = data.metadata ? JSON.parse(data.metadata) : {}; } catch(e) {}

  return {
    transactionId,
    status:    normalized,
    planId:    meta.plan_id    || tx?.planId,
    userEmail: meta.user_email || tx?.userEmail,  // ✅ Pour activatePlan() dans main.js
    amount:    data.amount,
    updatedAt: Date.now(),
  };
}

// ── FONCTION 3 : Rembourser (admin) ──────────────
async function refund(transactionId) {
  if (CONFIG.env === 'sandbox') {
    const tx = transactions.get(transactionId);
    if (tx) { tx.status = 'REFUNDED'; tx.updated = Date.now(); }
    return { success: true, transactionId, status: 'REFUNDED' };
  }

  const response = await fetch(`${CONFIG.baseUrl}/payment/${transactionId}/refund`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.apiKey}`,
      'Accept':        'application/json',
    },
    timeout: 10000,
  });

  if (!response.ok) throw new Error(`Erreur remboursement HTTP ${response.status}`);
  return await response.json();
}

// ── Helpers ───────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateTxnId() {
  return `CVPLUS_${Date.now()}_${Math.random().toString(36).substr(2,8).toUpperCase()}`;
}

// Normaliser les statuts CamperPay vers : PENDING | SUCCESS | FAILED
function normalizeStatus(raw) {
  const SUCCESS_STATES = ['SUCCESS','SUCCESSFUL','COMPLETED','PAID','ACCEPTED'];
  const FAILED_STATES  = ['FAILED','FAILURE','CANCELLED','CANCELED','REJECTED','EXPIRED'];
  if (SUCCESS_STATES.includes(raw)) return 'SUCCESS';
  if (FAILED_STATES.includes(raw))  return 'FAILED';
  return 'PENDING';
}

module.exports = { initiate, checkStatus, refund };
