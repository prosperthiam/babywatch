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

// GET tous les favoris du parent
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.city,
              sp.rating, sp.hourly_rate, sp.bio, sp.verification_status,
              sp.accepts_camera, sp.available
       FROM favorites f
       JOIN users u ON f.sitter_id = u.id
       JOIN sitter_profiles sp ON sp.user_id = u.id
       WHERE f.parent_id = $1
       ORDER BY f.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch(e) { res.status(500).json({ error: 'Erreur serveur.' }); }
});

// POST ajouter un favori
router.post('/:sitterId', auth, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO favorites (parent_id, sitter_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.userId, req.params.sitterId]
    );
    res.json({ success: true, message: 'Ajouté aux favoris !' });
  } catch(e) { res.status(500).json({ error: 'Erreur serveur.' }); }
});

// DELETE supprimer un favori
router.delete('/:sitterId', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM favorites WHERE parent_id = $1 AND sitter_id = $2',
      [req.userId, req.params.sitterId]
    );
    res.json({ success: true, message: 'Retiré des favoris.' });
  } catch(e) { res.status(500).json({ error: 'Erreur serveur.' }); }
});

module.exports = router;