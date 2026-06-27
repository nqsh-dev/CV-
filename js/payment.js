// ══════════════════════════════════════════════════
//  CV+ — Payment.js (Renderer)
//  ⚠️  AUCUNE clé API ici.
//  ⚠️  L'abonnement est activé UNIQUEMENT après
//      confirmation STATUS === 'SUCCESS' du backend.
// ══════════════════════════════════════════════════

'use strict';

const PLANS_CONFIG = {
  starter: { amount: 500,  label: 'Starter',  period: 'unique',  cvMax: 2        },
  pro:     { amount: 1500, label: 'Pro',       period: '1 mois',  cvMax: Infinity },
  premium: { amount: 3750, label: 'Premium',   period: '3 mois',  cvMax: Infinity },
};

// Détection Electron : window.cvplusAPI injectée par preload.js
const isElectron = typeof window !== 'undefined'
  && window.cvplusAPI?.env?.isElectron === true;

// Pour une version web front + backend Vercel distant, personnalisez cette URL
// via `window.CVPLUS_BACKEND_URL` avant le chargement de js/payment.js.
const BACKEND_BASE_URL = typeof window !== 'undefined'
  ? (window.CVPLUS_BACKEND_URL || window.location.origin)
  : '';

// ── État paiement ─────────────────────────────────
let _operator    = 'mtn';
let _txnId       = null;
let _polling     = null;
let _planPending = null;  // Plan en attente — pas encore activé

// ══════════════════════════════════════════════════
//  OUVRIR LE FORMULAIRE DE PAIEMENT
// ══════════════════════════════════════════════════
async function initiatePayment(planId) {
  if (!App.user) {
    App.toast("Connectez-vous d'abord", 'info');
    openAuthModal('login');
    return;
  }
  const plan = PLANS_CONFIG[planId];
  if (!plan) return;

  // Reset état
  _operator    = 'mtn';
  _txnId       = null;
  _planPending = null;
  stopPolling();

  _renderPaymentForm(planId, plan);
  document.getElementById('payment-modal').classList.add('open');
}

function _renderPaymentForm(planId, plan) {
  document.getElementById('payment-modal-title').textContent = 'Paiement Mobile Money';
  document.getElementById('payment-modal-content').innerHTML = `

    <div style="text-align:center;padding:0 0 16px;">
      <div style="font-size:13px;font-weight:600;color:var(--text-second);margin-bottom:6px;">${plan.label}</div>
      <div style="font-size:36px;font-weight:800;color:var(--blue);line-height:1;">
        ${plan.amount.toLocaleString()}
        <span style="font-size:15px;font-weight:500;color:var(--text-muted);">FCFA</span>
      </div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${plan.period}</div>
    </div>

    ${planId === 'premium' ? `
    <div style="background:var(--blue-light);border:1px solid rgba(30,94,255,0.2);
                border-radius:var(--r-sm);padding:8px 12px;font-size:12px;
                color:var(--blue);margin-bottom:12px;text-align:center;font-weight:500;">
      Économisez 750 FCFA vs plan mensuel
    </div>` : ''}

    ${!isElectron ? `
    <div style="background:#FEF9C3;border:1px solid #F59E0B;border-radius:var(--r-sm);
                padding:8px 12px;font-size:12px;color:#713F12;margin-bottom:12px;">
      <strong>Mode simulation</strong> — Les paiements réels nécessitent l'application de bureau CV+.
    </div>` : ''}

    <div class="form-group">
      <label class="form-label">Numéro Mobile Money</label>
      <input class="form-input" id="pay-phone" placeholder="6XX XXX XXX"
             type="tel" maxlength="9" oninput="this.value=this.value.replace(/\\D/g,'')">
      <div class="auth-error" id="pay-phone-err" style="display:none;"></div>
    </div>

    <div class="form-group">
      <label class="form-label">Réseau</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div id="op-mtn" onclick="selectOperator('mtn')"
          style="border:2px solid #F59E0B;background:#FFFBEB;
                 border-radius:var(--r-md);padding:12px;text-align:center;cursor:pointer;">
          <div style="font-size:20px;margin-bottom:3px;">📱</div>
          <div style="font-size:12px;font-weight:700;color:#B45309;">MTN MoMo</div>
        </div>
        <div id="op-orange" onclick="selectOperator('orange')"
          style="border:2px solid var(--border);background:var(--bg-surface);
                 border-radius:var(--r-md);padding:12px;text-align:center;cursor:pointer;">
          <div style="font-size:20px;margin-bottom:3px;">📱</div>
          <div style="font-size:12px;font-weight:700;color:#FF8C00;">Orange Money</div>
        </div>
      </div>
    </div>

    <div style="background:var(--bg-surface);border-radius:var(--r-sm);
                padding:10px 12px;font-size:12px;color:var(--text-muted);
                margin-bottom:14px;line-height:1.6;">
      Paiement sécurisé. Une notification sera envoyée sur votre téléphone.
    </div>

    <button class="btn btn-primary btn-lg btn-full" id="confirm-pay-btn"
            onclick="confirmPayment('${planId}')">
      Confirmer le paiement
    </button>
    <button class="btn btn-ghost btn-full" style="margin-top:8px;"
            onclick="closePaymentModal()">Annuler</button>`;
}

// ══════════════════════════════════════════════════
//  SÉLECTION OPÉRATEUR
// ══════════════════════════════════════════════════
function selectOperator(op) {
  _operator = op;
  const mtn    = document.getElementById('op-mtn');
  const orange = document.getElementById('op-orange');
  if (!mtn || !orange) return;

  const BASE = 'border-radius:var(--r-md);padding:12px;text-align:center;cursor:pointer;';
  mtn.style.cssText    = op === 'mtn'
    ? `border:2px solid #F59E0B;background:#FFFBEB;${BASE}`
    : `border:2px solid var(--border);background:var(--bg-surface);${BASE}`;
  orange.style.cssText = op === 'orange'
    ? `border:2px solid #FF8C00;background:#FFF7ED;${BASE}`
    : `border:2px solid var(--border);background:var(--bg-surface);${BASE}`;
}

// ══════════════════════════════════════════════════
//  CONFIRMATION — Point d'entrée du flux de paiement
// ══════════════════════════════════════════════════
async function confirmPayment(planId) {
  const phone = document.getElementById('pay-phone')?.value?.trim();
  const errEl = document.getElementById('pay-phone-err');

  // Validation numéro
  if (!phone || phone.length < 9) {
    errEl.textContent = 'Entrez un numéro valide (9 chiffres)';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';

  const btn = document.getElementById('confirm-pay-btn');
  setBtn(btn, true, '<span class="spinner"></span> Envoi en cours...');

  try {
    if (isElectron) {
      await _flowElectron(planId, phone, btn);
    } else {
      await _flowWebVercel(planId, phone, btn);
    }
  } catch (err) {
    console.error('[Payment] Erreur :', err);
    console.log("Réponse :", err.response?.data);
    setBtn(btn, false, 'Réessayer');
    App.toast(`Erreur : ${err.message}`, 'error');
  }
}

// ══════════════════════════════════════════════════
//  FLUX ELECTRON (production + sandbox)
//
//  État machine :
//  1. initiate()  → transaction_id, status='PENDING'
//  2. polling checkStatus() toutes les 3s
//  3. status='SUCCESS' → activer abonnement
//  4. status='FAILED'  → afficher erreur
//  5. timeout (2min)   → afficher timeout
// ══════════════════════════════════════════════════
async function _flowElectron(planId, phone, btn,operator) {

  // ── ÉTAPE 1 : Initiation ─────────────────────────
  const initResult = await window.cvplusAPI.payment.initiate({
    planId,
    phone,
    operator: _operator,
    user: App.user,
  });

  if (!initResult.success) {
    throw new Error(initResult.error || 'Échec de la demande de paiement');
  }

  const { transaction_id, status: initStatus } = initResult.data;

  // ✅ GARDE : Si le backend retourne SUCCESS immédiatement → bug côté backend
  //    On refuse d'activer et on log l'anomalie
  if (initStatus === 'SUCCESS') {
    console.error('[Payment] ANOMALIE : initiation a retourné SUCCESS. Ignoré.');
    setBtn(btn, false, 'Réessayer');
    App.toast('Erreur interne de paiement. Contactez le support.', 'error');
    return;
  }

  _txnId       = transaction_id;
  _planPending = planId;   // Mémoriser le plan mais NE PAS l'activer

  setBtn(btn, true, `<span class="spinner"></span> En attente (${_operator.toUpperCase()})...`);
  App.toast('Notification envoyée — Confirmez sur votre téléphone', 'info');

  // ── ÉTAPE 2 : Polling checkStatus ────────────────
  let attempts   = 0;
  const MAX      = 40;   // 40 × 3s = 2 minutes max

  _polling = setInterval(async () => {
    attempts++;

    try {
      const poll = await window.cvplusAPI.payment.checkStatus(_txnId);

      if (!poll.success) {
        console.warn('[Payment] Erreur polling :', poll.error);
        return; // Continuer à essayer
      }

      const { status } = poll;
      console.log(`[Payment] Poll #${attempts} — ${_txnId} → ${status}`);

      if (status === 'SUCCESS') {
        // ✅ ÉTAPE 3 : Activation — UNIQUEMENT ici, après confirmation réelle
        stopPolling();
        _activateSubscription(planId, _txnId);

      } else if (status === 'FAILED' || status === 'CANCELLED') {
        // ❌ Paiement échoué
        stopPolling();
        setBtn(btn, false, 'Réessayer');
        App.toast('Paiement refusé ou annulé. Réessayez.', 'error');

      } else if (attempts >= MAX) {
        // ⏰ Timeout
        stopPolling();
        setBtn(btn, false, 'Réessayer');
        App.toast(
          'Délai dépassé (2 min). Si votre compte a été débité, contactez le support.',
          'error'
        );
      }
      // Si 'PENDING' → attendre le prochain tick
    } catch (pollErr) {
      console.error('[Payment] Exception polling :', pollErr.message);
    }

  }, 3000);
}

// ══════════════════════════════════════════════════
//  FLUX WEB (simulation — navigateur sans Electron)
//  ✅ FIX BUG 5 : NE PLUS activer automatiquement
//     Afficher clairement que c'est une simulation.
// ══════════════════════════════════════════════════
async function _flowWebVercel(planId, phone, btn) {
  if (!BACKEND_BASE_URL) {
    throw new Error('Backend non configuré pour le paiement web');
  }

  setBtn(btn, true, '<span class="spinner"></span> Initialisation du paiement...');

  const response = await fetch(`${BACKEND_BASE_URL}/api/payment/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      planId,
      phone,
      operator: _operator,
      user: App.user,
    }),
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error || payload.message || 'Échec de l\'initialisation du paiement');
  }

  const { transaction_id, status: initStatus } = payload.data;
  if (!transaction_id) {
    throw new Error('Aucun transaction_id retourné par le backend');
  }

  if (initStatus === 'SUCCESS') {
    console.error('[Payment] ANOMALIE : initiation a retourné SUCCESS. Ignoré.');
    setBtn(btn, false, 'Réessayer');
    App.toast('Erreur interne de paiement. Contactez le support.', 'error');
    return;
  }

  _txnId       = transaction_id;
  _planPending = planId;

  setBtn(btn, true, `<span class="spinner"></span> En attente (${_operator.toUpperCase()})...`);
  App.toast('Notification envoyée — Confirmez sur votre téléphone', 'info');

  let attempts = 0;
  const MAX = 40;

  _polling = setInterval(async () => {
    attempts++;

    try {
      const pollResponse = await fetch(`${BACKEND_BASE_URL}/api/payment/status/${encodeURIComponent(_txnId)}`);
      const pollData = await pollResponse.json();

      if (!pollResponse.ok || !pollData.success) {
        console.warn('[Payment] Erreur polling :', pollData.error || pollData.message);
        if (attempts >= MAX) {
          stopPolling();
          setBtn(btn, false, 'Réessayer');
          App.toast('Délai dépassé (2 min). Si votre compte a été débité, contactez le support.', 'error');
        }
        return;
      }

      const { status } = pollData;
      console.log(`[Payment] Poll #${attempts} — ${_txnId} → ${status}`);

      if (status === 'SUCCESS') {
        stopPolling();
        _activateSubscription(planId, _txnId);
      } else if (status === 'FAILED' || status === 'CANCELLED') {
        stopPolling();
        setBtn(btn, false, 'Réessayer');
        App.toast('Paiement refusé ou annulé. Réessayez.', 'error');
      } else if (attempts >= MAX) {
        stopPolling();
        setBtn(btn, false, 'Réessayer');
        App.toast('Délai dépassé (2 min). Si votre compte a été débité, contactez le support.', 'error');
      }
    } catch (pollErr) {
      console.error('[Payment] Exception polling :', pollErr.message);
    }
  }, 3000);
}

async function _flowWebSimulation(planId, btn) {
  setBtn(btn, true, '<span class="spinner"></span> Simulation (mode web)...');

  await delay(1500);
  setBtn(btn, true, '<span class="spinner"></span> Attente confirmation simulée...');
  await delay(3000);

  const simTxnId = `SIM_${Date.now()}`;
  console.log('[Payment/Web] Simulation — abonnement activé avec txnId:', simTxnId);
  _activateSubscription(planId, simTxnId);
}

// ══════════════════════════════════════════════════
//  ACTIVATION ABONNEMENT
//  Appelé UNIQUEMENT après status === 'SUCCESS'
//  confirmé (Electron) ou simulation (web only).
// ══════════════════════════════════════════════════
function _activateSubscription(planId, transactionId) {
  // Mettre à jour l'état App
  App.plan    = planId;
  App.cvCount = 0;

  // Persister localement
  try {
    const email = App.user?.email;
    if (email) {
      localStorage.setItem(`cvplus_plan_${email}`,    planId);
      localStorage.setItem(`cvplus_cvcount_${email}`, '0');
      localStorage.setItem(`cvplus_txn_${email}`,     transactionId);
    }
    App.saveSession();
  } catch(e) { /* localStorage indisponible */ }

  updatePlanBadge();
  closePaymentModal();

  App.toast(`Plan ${PLANS_CONFIG[planId]?.label} activé !`, 'success');
  _showSuccessScreen(planId, transactionId);

  // Reset état
  _txnId       = null;
  _planPending = null;
}

// ══════════════════════════════════════════════════
//  ÉCRAN DE SUCCÈS
// ══════════════════════════════════════════════════
function _showSuccessScreen(planId, transactionId) {
  const plan = PLANS_CONFIG[planId];
  document.getElementById('payment-modal-title').textContent = 'Paiement confirmé';
  document.getElementById('payment-modal-content').innerHTML = `
    <div style="text-align:center;padding:10px 0 24px;">
      <div style="width:60px;height:60px;background:#D1FAE5;border-radius:50%;
                  margin:0 auto 14px;display:flex;align-items:center;justify-content:center;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div style="font-size:17px;font-weight:800;margin-bottom:6px;">Paiement confirmé !</div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:20px;">
        Plan <strong style="color:var(--blue);">${plan.label}</strong> activé
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:22px;text-align:left;">
        <div class="card-sm" style="display:flex;justify-content:space-between;">
          <span style="font-size:13px;color:var(--text-muted);">Montant</span>
          <span style="font-weight:700;color:var(--blue);">${plan.amount.toLocaleString()} FCFA</span>
        </div>
        <div class="card-sm" style="display:flex;justify-content:space-between;">
          <span style="font-size:13px;color:var(--text-muted);">Durée</span>
          <span style="font-weight:700;">${plan.period}</span>
        </div>
        <div class="card-sm" style="display:flex;justify-content:space-between;">
          <span style="font-size:13px;color:var(--text-muted);">Référence</span>
          <span style="font-size:11px;font-weight:600;color:var(--text-muted);">${transactionId}</span>
        </div>
      </div>
      <button class="btn btn-primary btn-lg btn-full"
              onclick="closePaymentModal();App.navigate('editor');">
        Créer mon CV
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>`;
  document.getElementById('payment-modal').classList.add('open');
}

// ══════════════════════════════════════════════════
//  FERMER LA MODALE
// ══════════════════════════════════════════════════
function closePaymentModal() {
  stopPolling();
  _txnId       = null;
  _planPending = null;
  document.getElementById('payment-modal').classList.remove('open');
}

// ── Helpers ───────────────────────────────────────
function stopPolling() {
  if (_polling) { clearInterval(_polling); _polling = null; }
}

function setBtn(btn, disabled, html) {
  if (!btn) return;
  btn.disabled  = disabled;
  btn.innerHTML = html;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}
