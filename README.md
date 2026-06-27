# CV+ — Version Web

## 🔐 Compte Administrateur
| | |
|---|---|
| **Email** | `admin@cvplus.cm` |
| **Password** | `CVplus@Admin2025!` |

## 🚀 Déploiement sur Netlify (gratuit, 2 minutes)

1. Créer un compte sur [netlify.com](https://netlify.com)
2. Glisser-déposer ce dossier `cvplus-web/` sur le dashboard Netlify
3. Votre site est en ligne immédiatement ✅

## 🌐 Autres hébergements possibles
- **GitHub Pages** : pousser sur un repo GitHub → activer Pages
- **Vercel** : glisser-déposer ou connecter GitHub
- **Render** : hébergement statique gratuit
- **VPS local** : serveur Nginx ou Apache

## 💳 Avant mise en production
Dans `js/payment.js`, remplacer :
```
apiKey: 'VOTRE_CLE_CAMERPAY_ICI'
```
par votre vraie clé API CamperPay.

## 📁 Structure
```
cvplus-web/
├── index.html          ← Application complète
├── assets/logo.png
├── css/
│   ├── main.css
│   ├── editor.css
│   └── templates.css
└── js/
    ├── app.js
    ├── auth.js
    ├── cv-render.js
    ├── editor.js
    ├── payment.js
    └── admin.js
```
