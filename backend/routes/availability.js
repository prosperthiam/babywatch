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

// GET mes créneaux (babysitter connectée)
router.get('/me', auth, async (req, res) => {
  try {
    const slots = await pool.query(
      'SELECT * FROM availability_slots WHERE sitter_id = $1 ORDER BY day_of_week, start_time',
      [req.userId]
    );
    const exceptions = await pool.query(
      'SELECT * FROM availability_exceptions WHERE sitter_id = $1 AND date >= CURRENT_DATE ORDER BY date',
      [req.userId]
    );
    res.json({ slots: slots.rows, exceptions: exceptions.rows });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

// PUT remplacer tous mes créneaux d'un coup
router.put('/me', auth, async (req, res) => {
  const { slots } = req.body;
  try {
    await pool.query('DELETE FROM availability_slots WHERE sitter_id = $1', [req.userId]);
    for (const s of slots) {
      await pool.query(
        'INSERT INTO availability_slots (sitter_id, day_of_week, start_time, end_time) VALUES ($1,$2,$3,$4)',
        [req.userId, s.day, s.start, s.end]
      );
    }
    res.json({ success: true, message: 'Disponibilités enregistrées !' });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

// POST bloquer / débloquer une date précise
router.post('/exception', auth, async (req, res) => {
  const { date, available, reason } = req.body;
  try {
    await pool.query(
      `INSERT INTO availability_exceptions (sitter_id, date, available, reason)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (sitter_id, date) DO UPDATE SET available = $3, reason = $4`,
      [req.userId, date, available, reason || null]
    );
    res.json({ success: true, message: available ? 'Date rouverte.' : 'Date bloquée.' });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

// DELETE supprimer une exception
router.delete('/exception/:date', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM availability_exceptions WHERE sitter_id = $1 AND date = $2', [req.userId, req.params.date]);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'Erreur serveur.' }); }
});

// GET disponibilités publiques d'une babysitter (côté parent)
router.get('/sitter/:sitterId', async (req, res) => {
  try {
    const slots = await pool.query(
      'SELECT day_of_week, start_time, end_time FROM availability_slots WHERE sitter_id = $1',
      [req.params.sitterId]
    );
    const exceptions = await pool.query(
      'SELECT date, available FROM availability_exceptions WHERE sitter_id = $1 AND date >= CURRENT_DATE',
      [req.params.sitterId]
    );
    const booked = await pool.query(
      "SELECT date, time_start, duration FROM bookings WHERE sitter_id = $1 AND status IN ('confirmed','pending') AND date >= CURRENT_DATE",
      [req.params.sitterId]
    );
    res.json({ slots: slots.rows, exceptions: exceptions.rows, booked: booked.rows });
  } catch(e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

module.exports = router;