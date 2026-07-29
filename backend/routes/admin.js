const router = require('express').Router();
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware admin
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorisé.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Accès refusé.' });
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token invalide.' });
  }
};

// ── STATS GLOBALES ──
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [users, bookings, pending, sitters] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE role != $1', ['admin']),
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query("SELECT COUNT(*) FROM sitter_profiles WHERE verification_status = 'pending'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'sitter'"),
    ]);
    res.json({
      totalUsers:    parseInt(users.rows[0].count),
      totalBookings: parseInt(bookings.rows[0].count),
      pendingVerif:  parseInt(pending.rows[0].count),
      totalSitters:  parseInt(sitters.rows[0].count),
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── LISTE VÉRIFICATIONS EN ATTENTE ──
router.get('/verifications', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
             sp.verification_status, sp.id_document_type,
             sp.id_document_url, sp.verification_submitted_at,
             sp.rating, sp.total_missions
      FROM sitter_profiles sp
      JOIN users u ON sp.user_id = u.id
      WHERE sp.verification_status IN ('pending', 'verified', 'rejected')
      ORDER BY sp.verification_submitted_at DESC NULLS LAST
    `);
    res.json(result.rows);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── APPROUVER UNE VÉRIFICATION ──
router.post('/verify/:userId/approve', adminAuth, async (req, res) => {
  try {
    await pool.query(
      "UPDATE sitter_profiles SET verification_status = 'verified', id_verified = true WHERE user_id = $1",
      [req.params.userId]
    );
    const userResult = await pool.query('SELECT email, first_name FROM users WHERE id = $1', [req.params.userId]);
    const user = userResult.rows[0];

    await resend.emails.send({
      from: 'BabyWatch <onboarding@resend.dev>',
      to: user.email,
      subject: '✅ Identité vérifiée — BabyWatch',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#0f1923;color:#e2e8f0;border-radius:12px;">
          <h1 style="color:#2dd4bf;">🍼 BabyWatch</h1>
          <h2>Félicitations ${user.first_name} ! 🎉</h2>
          <p style="color:#94a3b8;">Votre identité a été vérifiée avec succès par notre équipe.</p>
          <div style="background:#1e2d40;border-radius:10px;padding:16px;margin:20px 0;border-left:4px solid #4ade80;">
            <p style="color:#4ade80;font-weight:bold;">✅ Compte vérifié</p>
            <p style="color:#94a3b8;font-size:0.85rem;">Un badge de vérification apparaît maintenant sur votre profil. Les parents peuvent voir que vous êtes un babysitter de confiance !</p>
          </div>
          <a href="https://babywatch.vercel.app" style="display:inline-block;background:#2dd4bf;color:#0f1923;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Voir mon profil →
          </a>
        </div>
      `
    });

    res.json({ success: true, message: 'Identité approuvée et email envoyé.' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── REJETER UNE VÉRIFICATION ──
router.post('/verify/:userId/reject', adminAuth, async (req, res) => {
  const { reason } = req.body;
  try {
    await pool.query(
      "UPDATE sitter_profiles SET verification_status = 'rejected', id_verified = false WHERE user_id = $1",
      [req.params.userId]
    );
    const userResult = await pool.query('SELECT email, first_name FROM users WHERE id = $1', [req.params.userId]);
    const user = userResult.rows[0];

    await resend.emails.send({
      from: 'BabyWatch <onboarding@resend.dev>',
      to: user.email,
      subject: '❌ Vérification d\'identité — Action requise',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#0f1923;color:#e2e8f0;border-radius:12px;">
          <h1 style="color:#2dd4bf;">🍼 BabyWatch</h1>
          <h2>Bonjour ${user.first_name}</h2>
          <p style="color:#94a3b8;">Nous n'avons pas pu vérifier votre identité.</p>
          <div style="background:#1e2d40;border-radius:10px;padding:16px;margin:20px 0;border-left:4px solid #ff5f57;">
            <p style="color:#ff5f57;font-weight:bold;">❌ Raison du rejet</p>
            <p style="color:#94a3b8;font-size:0.85rem;">${reason || "Document illisible ou non conforme."}</p>
          </div>
          <p style="color:#94a3b8;font-size:0.85rem;">Veuillez soumettre à nouveau votre document en vous assurant qu'il est :</p>
          <ul style="color:#94a3b8;font-size:0.85rem;margin-top:8px;">
            <li>Net et lisible</li>
            <li>En cours de validité</li>
            <li>Entièrement visible</li>
          </ul>
          <a href="https://babywatch.vercel.app" style="display:inline-block;background:#2dd4bf;color:#0f1923;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:20px;">
            Soumettre à nouveau →
          </a>
        </div>
      `
    });

    res.json({ success: true, message: 'Vérification rejetée et email envoyé.' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── LISTE TOUS LES UTILISATEURS ──
router.get('/users', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.role, u.first_name, u.last_name, 
             u.verified, u.created_at,
             sp.verification_status, sp.rating, sp.total_missions
      FROM users u
      LEFT JOIN sitter_profiles sp ON sp.user_id = u.id
      WHERE u.role != 'admin'
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── LISTE TOUTES LES RÉSERVATIONS ──
router.get('/bookings', adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*,
             p.first_name || ' ' || p.last_name as parent_name,
             s.first_name || ' ' || s.last_name as sitter_name
      FROM bookings b
      JOIN users p ON b.parent_id = p.id
      JOIN users s ON b.sitter_id = s.id
      ORDER BY b.created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;