// ══════════════════════════════════════════════════
//  CV+ — Backend HTTP pour Render / Railway / Heroku
//  expose des endpoints REST pour initier et vérifier les paiements.
// ══════════════════════════════════════════════════
'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const PaymentBackend = require('./payment-backend');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'production' });
});

app.post('/api/payment/initiate', async (req, res) => {
  try {
    const { planId, phone, operator, user } = req.body;
    const data = await PaymentBackend.initiate({ planId, phone, operator, user });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('[Server] /api/payment/initiate error:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/payment/status/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await PaymentBackend.checkStatus(transactionId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Server] /api/payment/status error:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/payment/status', async (req, res) => {
  try {
    const transactionId = req.query.transaction_uuid || req.query.transactionId || req.query.id;
    if (!transactionId) {
      return res.status(400).json({ success: false, error: 'transaction_uuid manquant' });
    }
    const result = await PaymentBackend.checkStatus(transactionId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error('[Server] /api/payment/status query error:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/payment/refund', async (req, res) => {
  try {
    const { transactionId } = req.body;
    const data = await PaymentBackend.refund(transactionId);
    return res.json({ success: true, data });
  } catch (err) {
    console.error('[Server] /api/payment/refund error:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'CV+ backend actif', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`CV+ backend démarré sur le port ${PORT}`);
});
