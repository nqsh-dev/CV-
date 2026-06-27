# CV+ — Corrections du flux de paiement

## Bugs corrigés

### BUG 1 — Mauvais endpoint CamperPay (cause principale : aucun push Mobile Money)
**Avant** : `POST /payments/initiate` (avec `s`)  
**Après** : `POST /payment/initiate` (sans `s`)  
**Fichier** : `backend/payment-backend.js`

### BUG 2 — Mauvais noms de champs dans le payload
**Avant** : `{ phone, operator }` → CamperPay ignorait la requête  
**Après** : `{ phone_number, service: 'MTN_MOMO_CMR' | 'ORANGE_MONEY_CMR' }`  
**Fichier** : `backend/payment-backend.js`

### BUG 3 — Race condition sandbox (setTimeout avant transactions.set)
**Avant** : `setTimeout()` s'exécutait avant que la transaction soit dans le Map  
**Après** : `transactions.set()` en premier, puis `setTimeout()`  
**Fichier** : `backend/payment-backend.js`

### BUG 4 — Double nesting du statut (statusResult.status.status)
**Avant** : `main.js` retournait `{ success, status: { status, planId... } }`  
         → Renderer lisait `poll.status` qui était un objet, pas une string  
**Après** : `main.js` retourne `{ success, transactionId, status, planId }` à plat  
**Fichiers** : `main.js`, `preload/preload.js`

### BUG 5 — Abonnement activé sans confirmation (mode web)
**Avant** : `processWebSimulation()` appelait `onPaymentSuccess()` directement  
**Après** : Simulation clairement labellisée, abonnement non activé en prod web  
**Fichier** : `js/payment.js`

### BUG 6 — Activation abonnement côté Renderer (contournable)
**Avant** : `onPaymentSuccess()` dans le Renderer activait l'abonnement  
**Après** : Activation dans `main.js` uniquement, après confirmation `SUCCESS`  
           Le Renderer reçoit l'ordre d'activer seulement après poll `SUCCESS`  
**Fichiers** : `main.js`, `js/payment.js`

## Machine d'états du paiement

```
[Utilisateur clique "Confirmer"]
         │
         ▼
  payment:initiate (IPC)
         │
         ▼
  Backend → CamperPay POST /payment/initiate
         │
         ▼
  Retour : { transaction_id, status: 'PENDING' }
  ⚠️  Aucune activation ici
         │
         ▼
  Polling toutes les 3s → payment:check-status (IPC)
         │
    ┌────┴────┐
    │         │
  PENDING   SUCCESS ──→ main.js activatePlan() ──→ Renderer affiche succès
    │         │
  (wait)   FAILED ───→ Renderer affiche erreur
```

## Configuration .env requise

```env
CAMERPAY_API_KEY=ta_vraie_cle_ici
CAMERPAY_SECRET=ton_secret_ici
CAMERPAY_BASE_URL=https://camerpay.com/api/v1
CAMERPAY_ENV=production
```
