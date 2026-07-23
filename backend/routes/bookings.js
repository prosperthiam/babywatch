const router = require('express').Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

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

// GET toutes les réservations
router.get('/', auth, async (req, res) => {
  try {
    let query, params;
    if (req.userRole === 'parent') {
      query = `SELECT b.*, 
        u.first_name || ' ' || u.last_name as sitter_name
        FROM bookings b
        JOIN users u ON b.sitter_id = u.id
        WHERE b.parent_id = $1
        ORDER BY b.created_at DESC`;
      params = [req.userId];
    } else {
      query = `SELECT b.*,
        u.first_name || ' ' || u.last_name as parent_name
        FROM bookings b
        JOIN users u ON b.parent_id = u.id
        WHERE b.sitter_id = $1
        ORDER BY b.created_at DESC`;
      params = [req.userId];
    }
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST créer une réservation
router.post('/', auth, async (req, res) => {
  const { sitterId, date, timeStart, duration, address, children, notes, camera, price } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bookings
        (parent_id, sitter_id, date, time_start, duration, address, children, notes, camera, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [req.userId, sitterId, date, timeStart, duration, address, children, notes, camera, price]
    );
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PATCH modifier le statut
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;