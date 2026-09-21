// server/chatsecurity.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
// Serve the chat UI at /test/chatsecurity
app.use('/test/chatsecurity', express.static(path.join(__dirname, '..', 'test', 'chatsecurity')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);
  // Broadcast incoming messages to all other clients (no persistence)
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Secure chat server listening on http://localhost:${PORT}`);
});
