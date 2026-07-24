const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { Resend } = require('resend');
const crypto = require('crypto');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const resend = new Resend(process.env.RESEND_API_KEY);

// ── INSCRIPTION ──
router.post('/register', async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name, verified)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, email, role, first_name, last_name`,
      [email, hash, role, firstName, lastName]
    );
    const user = result.rows[0];

    if (role === 'sitter') {
      await pool.query('INSERT INTO sitter_profiles (user_id) VALUES ($1)', [user.id]);
    }

    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await pool.query(
      'INSERT INTO email_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // Envoyer l'email de confirmation
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm?token=${token}`;

    await resend.emails.send({
      from: 'BabyWatch <onboarding@resend.dev>',
      to: email,
      subject: '✅ Confirmez votre compte BabyWatch',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#0f1923;color:#e2e8f0;border-radius:12px;">
          <h1 style="color:#2dd4bf;font-size:1.8rem;margin-bottom:8px;">🍼 BabyWatch</h1>
          <h2 style="font-size:1.2rem;margin-bottom:16px;">Bonjour ${firstName} 👋</h2>
          <p style="color:#94a3b8;margin-bottom:24px;">
            Merci de vous être inscrit sur BabyWatch ! Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.
          </p>
          <a href="${confirmUrl}" style="display:inline-block;background:#2dd4bf;color:#0f1923;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:1rem;">
            ✅ Confirmer mon compte
          </a>
          <p style="color:#64748b;font-size:0.8rem;margin-top:24px;">
            Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
          </p>
        </div>
      `
    });

    res.json({
      message: 'Compte créé ! Vérifiez votre email pour confirmer votre inscription.',
      needsVerification: true
    });

  } catch (e) {
    console.error(e);
    if (e.code === '23505') {
      res.status(400).json({ error: 'Email déjà utilisé.' });
    } else {
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
});

// ── CONFIRMATION EMAIL ──
router.get('/confirm/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM email_tokens WHERE token = $1 AND used = false AND expires_at > NOW()',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Lien invalide ou expiré.' });
    }
    const { user_id } = result.rows[0];
    await pool.query('UPDATE users SET verified = true WHERE id = $1', [user_id]);
    await pool.query('UPDATE email_tokens SET used = true WHERE token = $1', [token]);

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    const user = userResult.rows[0];

    const jwtToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`,
        avatar: user.role === 'parent' ? '👨‍👧' : '👩'
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ── CONNEXION ──
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
        avatar: user.role === 'parent' ? '👨‍👧' : '👩'
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;