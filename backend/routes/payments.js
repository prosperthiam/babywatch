const router = require('express').Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorisé.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide.' });
  }
};

// POST — Créer une intention de paiement
router.post('/create-intent', auth, async (req, res) => {
  const { amount, bookingId, sitterName } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      metadata: { bookingId: String(bookingId), userId: String(req.userId) },
      description: `BabyWatch — Garde avec ${sitterName}`,
    });
    res.json({
      clientSecret: paymentIntent.client_secret,
      publicKey: process.env.STRIPE_PUBLIC_KEY,
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur paiement.' });
  }
});

// POST — Confirmer le paiement
router.post('/confirm', auth, async (req, res) => {
  const { paymentIntentId, bookingId } = req.body;
  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status === 'succeeded') {
      await pool.query(
        'UPDATE bookings SET status = $1, payment_status = $2, payment_intent_id = $3 WHERE id = $4',
        ['confirmed', 'paid', paymentIntentId, bookingId]
      );
      res.json({ success: true, message: 'Paiement confirmé !' });
    } else {
      res.status(400).json({ error: 'Paiement non confirmé.' });
    }
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET — Clé publique Stripe
router.get('/public-key', (req, res) => {
  res.json({ publicKey: process.env.STRIPE_PUBLIC_KEY });
});

module.exports = router;