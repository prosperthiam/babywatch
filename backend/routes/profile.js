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

// GET profil babysitter
router.get('/sitter', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.first_name, u.last_name, u.email, u.phone, u.city,
              sp.bio, sp.hourly_rate, sp.rating, sp.total_missions,
              sp.available, sp.accepts_camera, sp.skills,
              sp.id_verified, sp.id_document_url, sp.verification_status
       FROM users u
       JOIN sitter_profiles sp ON sp.user_id = u.id
       WHERE u.id = $1`,
      [req.userId]
    );
    res.json(result.rows[0]);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT mettre à jour le profil babysitter
router.put('/sitter', auth, async (req, res) => {
  const { firstName, lastName, phone, city, bio, hourlyRate, skills, available, acceptsCamera } = req.body;
  try {
    await pool.query(
      `UPDATE users SET first_name=$1, last_name=$2, phone=$3, city=$4 WHERE id=$5`,
      [firstName, lastName, phone, city, req.userId]
    );
    await pool.query(
      `UPDATE sitter_profiles SET bio=$1, hourly_rate=$2, skills=$3, available=$4, accepts_camera=$5
       WHERE user_id=$6`,
      [bio, hourlyRate, skills, available, acceptsCamera, req.userId]
    );
    res.json({ success: true, message: 'Profil mis à jour !' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST vérification d'identité
router.post('/sitter/verify-identity', auth, async (req, res) => {
  const { documentType, documentNumber, birthDate, firstName, lastName } = req.body;
  try {
    // Marquer comme "en cours de vérification"
    await pool.query(
      `UPDATE sitter_profiles SET 
        verification_status = 'pending',
        id_document_type = $1,
        id_document_number = $2,
        verification_submitted_at = NOW()
       WHERE user_id = $3`,
      [documentType, documentNumber, req.userId]
    );

    // Envoyer email de confirmation à la babysitter
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const userResult = await pool.query('SELECT email, first_name FROM users WHERE id = $1', [req.userId]);
    const user = userResult.rows[0];

    await resend.emails.send({
      from: 'BabyWatch <onboarding@resend.dev>',
      to: user.email,
      subject: '🔍 Vérification d\'identité en cours — BabyWatch',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#0f1923;color:#e2e8f0;border-radius:12px;">
          <h1 style="color:#2dd4bf;">🍼 BabyWatch</h1>
          <h2>Bonjour ${user.first_name} 👋</h2>
          <p style="color:#94a3b8;">Votre demande de vérification d'identité a bien été reçue.</p>
          <div style="background:#1e2d40;border-radius:10px;padding:16px;margin:20px 0;">
            <p style="color:#fbbf24;font-weight:bold;">⏳ En cours de vérification</p>
            <p style="color:#94a3b8;font-size:0.85rem;">Notre équipe vérifiera votre identité dans les 24-48 heures. Vous recevrez un email de confirmation.</p>
          </div>
          <p style="color:#64748b;font-size:0.8rem;">Merci de votre confiance.</p>
        </div>
      `
    });

    res.json({ success: true, message: 'Demande de vérification envoyée ! Notre équipe vous contactera sous 24-48h.' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST — Upload photo d'identité
router.post('/sitter/upload-id', auth, async (req, res) => {
  try {
    const { upload, uploadToCloudinary } = require('../services/upload');
    
    upload.single('document')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu.' });

      const result = await uploadToCloudinary(req.file.buffer, 'babywatch/identity');

      await pool.query(
        `UPDATE sitter_profiles SET 
          id_document_url = $1,
          verification_status = 'pending',
          verification_submitted_at = NOW()
         WHERE user_id = $2`,
        [result.secure_url, req.userId]
      );

      res.json({
        success: true,
        url: result.secure_url,
        message: 'Document uploadé ! Vérification en cours sous 24-48h.'
      });
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Erreur serveur.' });
  }
});

// GET profil parent
router.get('/parent', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT first_name, last_name, email, phone, address, 
              postal_code, city, country, birth_date, birth_place,
              latitude, longitude
       FROM users WHERE id = $1`,
      [req.userId]
    );
    res.json(result.rows[0]);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT mettre à jour profil parent
router.put('/parent', auth, async (req, res) => {
  const { firstName, lastName, phone, address, postalCode, city, country, birthDate, birthPlace, latitude, longitude } = req.body;
  try {
    await pool.query(
      `UPDATE users SET 
        first_name=$1, last_name=$2, phone=$3, address=$4,
        postal_code=$5, city=$6, country=$7, birth_date=$8,
        birth_place=$9, latitude=$10, longitude=$11
       WHERE id=$12`,
      [firstName, lastName, phone, address, postalCode, city, country, birthDate, birthPlace, latitude, longitude, req.userId]
    );
    res.json({ success: true, message: 'Profil mis à jour !' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET tous les babysitters avec position (pour la map)
router.get('/sitters/map', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.city, u.latitude, u.longitude,
              sp.bio, sp.hourly_rate, sp.rating, sp.total_missions,
              sp.available, sp.accepts_camera, sp.skills, sp.verification_status
       FROM users u
       JOIN sitter_profiles sp ON sp.user_id = u.id
       WHERE u.role = 'sitter' AND sp.available = true
       ORDER BY sp.rating DESC`
    );
    res.json(result.rows);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// PUT mettre à jour profil sitter (version complète)
router.put('/sitter/complete', auth, async (req, res) => {
  const { firstName, lastName, phone, address, postalCode, city, country, birthDate, birthPlace, latitude, longitude, bio, hourlyRate, skills, available, acceptsCamera } = req.body;
  try {
    await pool.query(
      `UPDATE users SET 
        first_name=$1, last_name=$2, phone=$3, address=$4,
        postal_code=$5, city=$6, country=$7, birth_date=$8,
        birth_place=$9, latitude=$10, longitude=$11
       WHERE id=$12`,
      [firstName, lastName, phone, address, postalCode, city, country, birthDate, birthPlace, latitude, longitude, req.userId]
    );
    await pool.query(
      `UPDATE sitter_profiles SET bio=$1, hourly_rate=$2, skills=$3, available=$4, accepts_camera=$5
       WHERE user_id=$6`,
      [bio, hourlyRate, skills, available, acceptsCamera, req.userId]
    );
    res.json({ success: true, message: 'Profil mis à jour !' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;