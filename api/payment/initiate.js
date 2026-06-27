const PaymentBackend = require('../../backend/payment-backend');

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Max-Age', '86400');
};

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') {
    // Return early for preflight
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  try {
    const { planId, phone, operator, user } = req.body;
    const data = await PaymentBackend.initiate({ planId, phone, operator, user });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[Vercel] /api/payment/initiate error:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
};