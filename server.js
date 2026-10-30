'use strict';
const express = require('express');
const http = require('http');
const crypto = require('crypto');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingInterval: 25000,
  pingTimeout: 20000
});
const PORT = process.env.PORT || 3000;
const MAX_PARTICIPANTS = Number(process.env.MAX_PARTICIPANTS || 8);
const rooms = new Map();

app.get('/health', (_req, res) => res.json({ ok: true, service: 'StreamBuddies', rooms: rooms.size }));
app.use(express.static(path.join(__dirname, 'public')));

function makeCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}
function leaveRoom(socket) {
  const code = socket.data.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  socket.data.roomCode = null;
  if (!room) return;
  room.delete(socket.id);
  socket.to(code).emit('peer-left', { id: socket.id });
  socket.leave(code);
  if (room.size === 0) rooms.delete(code);
}
function relay(socket, event, payload) {
  const code = socket.data.roomCode;
  if (!code || !payload || typeof payload.to !== 'string') return;
  const room = rooms.get(code);
  if (!room || !room.has(socket.id) || !room.has(payload.to)) return;
  const field = event === 'ice' ? 'candidate' : 'description';
  if (!payload[field]) return;
  io.to(payload.to).emit(event, { from: socket.id, [field]: payload[field] });
}

io.on('connection', socket => {
  socket.data.roomCode = null;

  socket.on('create-room', (payload = {}, callback) => {
    leaveRoom(socket);
    let code;
    do { code = makeCode(); } while (rooms.has(code));
    const participant = { id: socket.id, name: String(payload.name || 'Streamer').slice(0, 32), host: true };
    rooms.set(code, new Map([[socket.id, participant]]));
    socket.join(code);
    socket.data.roomCode = code;
    if (typeof callback === 'function') callback({ ok: true, code, participants: [participant] });
  });

  socket.on('join-room', (payload = {}, callback) => {
    leaveRoom(socket);
    const code = String(payload.code || '').trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) return typeof callback === 'function' && callback({ ok: false, error: 'Sala não encontrada.' });
    if (room.size >= MAX_PARTICIPANTS) return typeof callback === 'function' && callback({ ok: false, error: 'Sala cheia.' });
    const peers = [...room.values()];
    const participant = { id: socket.id, name: String(payload.name || 'Convidado').slice(0, 32), host: false };
    room.set(socket.id, participant);
    socket.join(code);
    socket.data.roomCode = code;
    if (typeof callback === 'function') callback({ ok: true, code, peers });
    socket.to(code).emit('peer-joined', participant);
  });

  socket.on('offer', payload => relay(socket, 'offer', payload));
  socket.on('answer', payload => relay(socket, 'answer', payload));
  socket.on('ice', payload => relay(socket, 'ice', payload));
  socket.on('leave-room', () => leaveRoom(socket));
  socket.on('disconnect', () => leaveRoom(socket));
});

server.listen(PORT, '0.0.0.0', () => console.log(`StreamBuddies rodando na porta ${PORT}`));
