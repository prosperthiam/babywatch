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
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide.' });
  }
};

// POST — Laisser un avis
router.post('/:bookingId', auth, async (req, res) => {
  const { rating, review } = req.body;
  const { bookingId } = req.params;
  try {
    // Vérifier que c'est bien le parent de cette réservation
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND parent_id = $2 AND status = $3',
      [bookingId, req.userId, 'completed']
    );
    if (bookingResult.rows.length === 0) {
      return res.status(403).json({ error: 'Vous ne pouvez pas noter cette garde.' });
    }
    const booking = bookingResult.rows[0];

    // Sauvegarder l'avis
    await pool.query(
      'UPDATE bookings SET rating = $1, review = $2 WHERE id = $3',
      [rating, review, bookingId]
    );

    // Mettre à jour la note moyenne du babysitter
    const avgResult = await pool.query(
      'SELECT AVG(rating) as avg, COUNT(*) as count FROM bookings WHERE sitter_id = $1 AND rating IS NOT NULL',
      [booking.sitter_id]
    );
    const avg = parseFloat(avgResult.rows[0].avg).toFixed(2);
    const count = parseInt(avgResult.rows[0].count);
    await pool.query(
      'UPDATE sitter_profiles SET rating = $1, total_missions = $2 WHERE user_id = $3',
      [avg, count, booking.sitter_id]
    );

    res.json({ success: true, message: 'Avis publié avec succès !' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET — Avis d'un babysitter
router.get('/sitter/:sitterId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.rating, b.review, b.date, b.created_at,
              u.first_name || ' ' || u.last_name as parent_name
       FROM bookings b
       JOIN users u ON b.parent_id = u.id
       WHERE b.sitter_id = $1 AND b.rating IS NOT NULL
       ORDER BY b.created_at DESC`,
      [req.params.sitterId]
    );
    res.json(result.rows);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;