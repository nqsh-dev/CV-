# CV+ — Application Electron

## Installation

```bash
npm install
```

## Configuration CamperPay

Édite le fichier `.env` à la racine :

```env
CAMERPAY_API_KEY=ta_vraie_cle_ici
CAMERPAY_SECRET=ton_secret_ici
CAMERPAY_BASE_URL=https://api.camerpay.cm/v1
CAMERPAY_ENV=production   # ou "sandbox" pour les tests
```

## Lancement en développement

```bash
npm start
```

## Build (application installable)

```bash
npm run build
```
Génère un installeur dans `/dist` pour Windows, Mac ou Linux.

## Architecture sécurisée

```
┌─────────────────────────────────────────────────┐
│  RENDERER (index.html + js/)                    │
│  ✗ Pas de clé API    ✗ Pas d'accès Node         │
│  ✓ Appels via window.cvplusAPI seulement        │
└──────────────────┬──────────────────────────────┘
                   │ contextBridge (IPC sécurisé)
┌──────────────────▼──────────────────────────────┐
│  PRELOAD (preload/preload.js)                   │
│  Pont strict : expose uniquement les fonctions  │
│  nécessaires, rien d'autre                      │
└──────────────────┬──────────────────────────────┘
                   │ ipcMain.handle
┌──────────────────▼──────────────────────────────┐
│  MAIN PROCESS (main.js + backend/)              │
│  ✓ Clé API CamperPay (depuis .env)              │
│  ✓ Appels HTTP vers CamperPay                   │
│  ✓ Base de données locale (JSON)                │
└─────────────────────────────────────────────────┘
```

## Compte administrateur

| Email    | admin@cvplus.cm     |
| Password | CVplus@Admin2025!   |
