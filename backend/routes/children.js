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
  } catch { res.status(401).json({ error: 'Token invalide.' }); }
};

// GET tous mes enfants
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM children WHERE parent_id = $1 ORDER BY birth_date DESC NULLS LAST',
      [req.userId]
    );
    res.json(result.rows);
  } catch(e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

// POST ajouter un enfant
router.post('/', auth, async (req, res) => {
  const c = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO children (parent_id, first_name, birth_date, gender, avatar, allergies,
        medical_notes, medications, routines, favorite_activities, fears, bedtime,
        doctor_name, doctor_phone, emergency_contact_name, emergency_contact_phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [req.userId, c.firstName, c.birthDate||null, c.gender, c.avatar||'👶', c.allergies,
       c.medicalNotes, c.medications, c.routines, c.favoriteActivities, c.fears, c.bedtime||null,
       c.doctorName, c.doctorPhone, c.emergencyContactName, c.emergencyContactPhone]
    );
    res.json(result.rows[0]);
  } catch(e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

// PUT modifier un enfant
router.put('/:id', auth, async (req, res) => {
  const c = req.body;
  try {
    const result = await pool.query(
      `UPDATE children SET first_name=$1, birth_date=$2, gender=$3, avatar=$4, allergies=$5,
        medical_notes=$6, medications=$7, routines=$8, favorite_activities=$9, fears=$10,
        bedtime=$11, doctor_name=$12, doctor_phone=$13, emergency_contact_name=$14,
        emergency_contact_phone=$15
       WHERE id=$16 AND parent_id=$17 RETURNING *`,
      [c.firstName, c.birthDate||null, c.gender, c.avatar, c.allergies, c.medicalNotes,
       c.medications, c.routines, c.favoriteActivities, c.fears, c.bedtime||null,
       c.doctorName, c.doctorPhone, c.emergencyContactName, c.emergencyContactPhone,
       req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Enfant introuvable.' });
    res.json(result.rows[0]);
  } catch(e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

// DELETE supprimer un enfant
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM children WHERE id=$1 AND parent_id=$2', [req.params.id, req.userId]);
    res.json({ success: true, message: 'Fiche supprimée.' });
  } catch(e) { res.status(500).json({ error: 'Erreur serveur.' }); }
});

// GET fiches enfants d'une réservation (côté babysitter)
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const booking = await pool.query(
      'SELECT children_ids, sitter_id FROM bookings WHERE id = $1',
      [req.params.bookingId]
    );
    if (booking.rows.length === 0) return res.status(404).json({ error: 'Réservation introuvable.' });
    if (booking.rows[0].sitter_id !== req.userId) return res.status(403).json({ error: 'Accès refusé.' });
    const ids = booking.rows[0].children_ids || [];
    if (ids.length === 0) return res.json([]);
    const result = await pool.query('SELECT * FROM children WHERE id = ANY($1)', [ids]);
    res.json(result.rows);
  } catch(e) { console.error(e); res.status(500).json({ error: 'Erreur serveur.' }); }
});

module.exports = router;