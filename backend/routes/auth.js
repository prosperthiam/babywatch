const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const crypto = require('crypto');
const { sendConfirmationEmail } = require('../services/email');
const { Resend } = require('resend');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const resend = new Resend(process.env.RESEND_API_KEY);

// ── INSCRIPTION ──
router.post('/register', async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body;
  try {
    // Vérifier si email existe déjà
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email déjà utilisé.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name, verified, is_parent, is_sitter)
       VALUES ($1, $2, $3, $4, $5, false, $6, $7)
       RETURNING id, email, role, first_name, last_name`,
      [email, hash, role, firstName, lastName, role === 'parent', role === 'sitter']
    );
    const user = result.rows[0];

    if (role === 'sitter') {
      await pool.query('INSERT INTO sitter_profiles (user_id) VALUES ($1)', [user.id]);
    }

    // Générer token de confirmation
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      'INSERT INTO email_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Envoyer email
    await sendConfirmationEmail(email, firstName, token);

    res.json({
      success: true,
      message: `Un email de confirmation a été envoyé à ${email}. Vérifiez votre boîte mail.`
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── CONFIRMATION EMAIL ──
router.get('/confirm/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const result = await pool.query(
      `SELECT et.*, u.email, u.role, u.first_name, u.last_name 
       FROM email_tokens et
       JOIN users u ON et.user_id = u.id
       WHERE et.token = $1 AND et.used = false AND et.expires_at > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Lien invalide ou expiré.' });
    }

    const row = result.rows[0];
    await pool.query('UPDATE users SET verified = true WHERE id = $1', [row.user_id]);
    await pool.query('UPDATE email_tokens SET used = true WHERE token = $1', [token]);

    const jwtToken = jwt.sign(
      { userId: row.user_id, role: row.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: row.user_id,
        email: row.email,
        role: row.role,
        name: `${row.first_name} ${row.last_name}`,
        avatar: row.role === 'parent' ? '👨‍👧' : '👩',
        hasBothRoles: row.is_parent && row.is_sitter,
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── CONNEXION AVEC 2FA ──
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Email introuvable.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect.' });

    if (!user.verified) {
      return res.status(401).json({ error: 'Veuillez confirmer votre email avant de vous connecter.' });
    }

    // Si 2FA activé
    if (user.two_factor_enabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await pool.query(
        'UPDATE users SET two_factor_code = $1, two_factor_expires = $2 WHERE id = $3',
        [code, expires, user.id]
      );

      // Envoyer le code par email
      await resend.emails.send({
        from: 'BabyWatch <onboarding@resend.dev>',
        to: email,
        subject: '🔐 Code de vérification BabyWatch',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#0f1923;color:#e2e8f0;border-radius:12px;">
            <h1 style="color:#2dd4bf;">🍼 BabyWatch</h1>
            <h2>Code de vérification</h2>
            <p style="color:#94a3b8;">Votre code de connexion à usage unique :</p>
            <div style="background:#1e2d40;border-radius:12px;padding:24px;text-align:center;margin:20px 0;">
              <span style="font-size:2.5rem;font-weight:900;color:#2dd4bf;letter-spacing:0.3em;">${code}</span>
            </div>
            <p style="color:#64748b;font-size:0.85rem;">Ce code expire dans 10 minutes. Ne le partagez jamais.</p>
          </div>
        `
      });

      return res.json({ requires2FA: true, userId: user.id });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
        avatar: user.role === 'parent' ? '👨‍👧' : '👩',
        hasBothRoles: user.is_parent && user.is_sitter,
      }
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── VÉRIFIER CODE 2FA ──
router.post('/verify-2fa', async (req, res) => {
  const { userId, code } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND two_factor_code = $2 AND two_factor_expires > NOW()',
      [userId, code]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Code invalide ou expiré.' });
    }
    const user = result.rows[0];
    await pool.query('UPDATE users SET two_factor_code = NULL, two_factor_expires = NULL WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
        avatar: user.role === 'parent' ? '👨‍👧' : '👩',
        hasBothRoles: user.is_parent && user.is_sitter,
      }
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── ACTIVER/DÉSACTIVER 2FA ──
router.post('/toggle-2fa', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorisé.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT two_factor_enabled FROM users WHERE id = $1', [decoded.userId]);
    const current = result.rows[0].two_factor_enabled;
    await pool.query('UPDATE users SET two_factor_enabled = $1 WHERE id = $2', [!current, decoded.userId]);
    res.json({ enabled: !current, message: !current ? '2FA activé !' : '2FA désactivé.' });
  } catch(e) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── MOT DE PASSE OUBLIÉ ──
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Email introuvable.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    await pool.query(
      'INSERT INTO email_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'BabyWatch <onboarding@resend.dev>',
      to: email,
      subject: '🔑 Réinitialisation de votre mot de passe BabyWatch',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#0f1923;color:#e2e8f0;border-radius:12px;">
          <h1 style="color:#2dd4bf;">🍼 BabyWatch</h1>
          <h2>Réinitialisation du mot de passe</h2>
          <p style="color:#94a3b8;">Cliquez ci-dessous pour réinitialiser votre mot de passe. Ce lien expire dans 1 heure.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#2dd4bf;color:#0f1923;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0;">
            🔑 Réinitialiser mon mot de passe
          </a>
          <p style="color:#64748b;font-size:0.8rem;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        </div>
      `
    });

    res.json({ message: `Email de réinitialisation envoyé à ${email}` });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── RÉINITIALISER LE MOT DE PASSE ──
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM email_tokens WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Lien invalide ou expiré.' });
    }
    const { user_id } = result.rows[0];
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, user_id]);
    await pool.query('UPDATE email_tokens SET used = true WHERE token = $1', [token]);
    res.json({ message: 'Mot de passe réinitialisé avec succès !' });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── MIDDLEWARE AUTH (double rôle) ──
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Non autorisé.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch { res.status(401).json({ error: 'Token invalide.' }); }
};

// ── ACTIVER LE SECOND RÔLE ──
router.post('/add-role', requireAuth, async (req, res) => {
  const { role } = req.body;
  if (!['parent','sitter'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide.' });
  }
  try {
    const col = role === 'parent' ? 'is_parent' : 'is_sitter';
    await pool.query(`UPDATE users SET ${col} = true WHERE id = $1`, [req.userId]);

    if (role === 'sitter') {
      await pool.query(
        'INSERT INTO sitter_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING',
        [req.userId]
      );
    }
    res.json({ success: true, message: 'Rôle activé.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── BASCULER D'UN ESPACE À L'AUTRE ──
router.post('/switch-role', requireAuth, async (req, res) => {
  const { role } = req.body;
  if (!['parent','sitter'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide.' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Compte introuvable.' });

    const allowed = role === 'parent' ? user.is_parent : user.is_sitter;
    if (!allowed) return res.status(403).json({ error: "Ce rôle n'est pas activé sur votre compte." });

    await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.userId]);

    const token = jwt.sign(
      { userId: user.id, role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role,
        name: `${user.first_name} ${user.last_name}`,
        avatar: role === 'parent' ? '👨‍👧' : '👩',
        hasBothRoles: user.is_parent && user.is_sitter,
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});
module.exports = router;