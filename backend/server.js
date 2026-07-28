const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api/reviews', require('./routes/reviews'));

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