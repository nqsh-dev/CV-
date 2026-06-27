const PaymentBackend = require('../../backend/payment-backend');

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
};

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Méthode non autorisée' });
  }

  try {
    const { transactionId } = req.body;
    const data = await PaymentBackend.refund(transactionId);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[Vercel] /api/payment/refund error:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
};