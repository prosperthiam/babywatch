const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// INSCRIPTION
router.post('/register', async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, first_name, last_name`,
      [email, hash, role, firstName, lastName]
    );
    const user = result.rows[0];
    if (role === 'sitter') {
      await pool.query('INSERT INTO sitter_profiles (user_id) VALUES ($1)', [user.id]);
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
        avatar: role === 'parent' ? '👨‍👧' : '👩'
      }
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Email déjà utilisé.' });
  }
});

// CONNEXION
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Email introuvable.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect.' });
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