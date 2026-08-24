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

// GET messages d'une réservation
router.get('/:bookingId', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, 
        u.first_name || ' ' || u.last_name as sender_name,
        u.role as sender_role
       FROM chat_messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.booking_id = $1
       ORDER BY m.created_at ASC`,
      [req.params.bookingId]
    );
    // Marquer les messages comme lus
    await pool.query(
      'UPDATE chat_messages SET read = true WHERE booking_id = $1 AND receiver_id = $2',
      [req.params.bookingId, req.userId]
    );
    res.json(result.rows);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// POST envoyer un message
router.post('/:bookingId', auth, async (req, res) => {
  const { content, receiverId } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Message vide.' });
  try {
    const result = await pool.query(
      `INSERT INTO chat_messages (booking_id, sender_id, receiver_id, content)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.bookingId, req.userId, receiverId, content.trim()]
    );
    const message = result.rows[0];

    // Récupérer le nom de l'expéditeur
    const userResult = await pool.query(
      'SELECT first_name, last_name, role FROM users WHERE id = $1',
      [req.userId]
    );
    const user = userResult.rows[0];

    const fullMessage = {
      ...message,
      sender_name: `${user.first_name} ${user.last_name}`,
      sender_role: user.role
    };

    // Émettre via Socket.io
    req.io?.to(`booking_${req.params.bookingId}`).emit('new_message', fullMessage);

    res.json(fullMessage);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// GET nombre de messages non lus
router.get('/unread/count', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM chat_messages WHERE receiver_id = $1 AND read = false',
      [req.userId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch(e) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

module.exports = router;