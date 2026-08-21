const router = require('express').Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorisé.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch { res.status(401).json({ error: 'Token invalide.' }); }
};

// Enregistrer le token push
router.post('/register-token', auth, async (req, res) => {
  const { pushToken } = req.body;
  try {
    await pool.query('UPDATE users SET push_token = $1 WHERE id = $2', [pushToken, req.userId]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'Erreur serveur.' }); }
});

module.exports = router;