const { Pool } = require('pg');
const { sendReminderToParent, sendReminderToSitter } = require('./email');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sendReminders = async () => {
  try {
    // Trouver toutes les gardes confirmées pour demain
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const result = await pool.query(
      `SELECT b.*,
        p.email as parent_email, p.first_name as parent_name,
        s.email as sitter_email, s.first_name as sitter_name
       FROM bookings b
       JOIN users p ON b.parent_id = p.id
       JOIN users s ON b.sitter_id = s.id
       WHERE b.date = $1 AND b.status = 'confirmed'`,
      [tomorrowStr]
    );

    for (const booking of result.rows) {
      await sendReminderToParent(booking.parent_email, booking.parent_name, booking, booking.sitter_name).catch(console.error);
      await sendReminderToSitter(booking.sitter_email, booking.sitter_name, booking, booking.parent_name).catch(console.error);
      console.log(`✅ Rappels envoyés pour la garde du ${booking.date}`);
    }
  } catch(e) {
    console.error('Erreur rappels:', e);
  }
};

module.exports = { sendReminders };