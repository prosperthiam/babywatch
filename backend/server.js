const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const { sendReminders } = require('./services/reminders');

// Envoyer les rappels chaque jour à 9h
const scheduleReminders = () => {
  const now = new Date();
  const next9am = new Date();
  next9am.setHours(9, 0, 0, 0);
  if (now >= next9am) next9am.setDate(next9am.getDate() + 1);
  const delay = next9am - now;
  setTimeout(() => {
    sendReminders();
    setInterval(sendReminders, 24 * 60 * 60 * 1000);
  }, delay);
  console.log(`⏰ Rappels programmés à 9h (dans ${Math.round(delay/1000/60)} minutes)`);
};

scheduleReminders();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));

app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Serveur BabyWatch fonctionne !' });
});

io.on('connection', (socket) => {
  console.log('Utilisateur connecté :', socket.id);
  socket.on('join_booking', (bookingId) => {
    socket.join(`booking_${bookingId}`);
  });
  socket.on('send_message', (data) => {
    io.to(`booking_${data.bookingId}`).emit('new_message', data);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`✅ Serveur BabyWatch démarré sur le port ${process.env.PORT}`);
});