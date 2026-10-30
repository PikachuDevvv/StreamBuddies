const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }, maxHttpBufferSize: 1e6 });
const rooms = new Map();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/health', (_, res) => res.json({ ok: true, service: 'StreamBuddies' }));
function roomCode(){ return crypto.randomBytes(3).toString('hex').toUpperCase(); }
io.on('connection', socket => {
  socket.on('create-room', ({name}, done) => {
    let code; do { code = roomCode(); } while (rooms.has(code));
    rooms.set(code, new Map());
    socket.join(code); socket.data.room = code; socket.data.name = (name || 'Streamer').slice(0,32); socket.data.host = true;
    rooms.get(code).set(socket.id, {id:socket.id,name:socket.data.name,host:true});
    done?.({ok:true, code});
  });
  socket.on('join-room', ({code,name}, done) => {
    code = String(code || '').toUpperCase().trim(); const room = rooms.get(code);
    if (!room) return done?.({ok:false,error:'Sala não encontrada. Confira o código.'});
    if (room.size >= 8) return done?.({ok:false,error:'A sala já atingiu o limite de 8 conexões.'});
    socket.join(code); socket.data.room=code; socket.data.name=(name || 'Convidado').slice(0,32); socket.data.host=false;
    const peers=[...room.values()]; room.set(socket.id,{id:socket.id,name:socket.data.name,host:false});
    done?.({ok:true, peers});
    socket.to(code).emit('peer-joined',{id:socket.id,name:socket.data.name,host:false});
  });
  for (const event of ['offer','answer','ice']) socket.on(event, payload => {
    const room=socket.data.room; if (!room || !payload?.to) return;
    io.to(payload.to).emit(event,{from:socket.id,description:payload.description,candidate:payload.candidate});
  });
  socket.on('disconnect',()=>{
    const code=socket.data.room; if (!code || !rooms.has(code)) return;
    rooms.get(code).delete(socket.id); socket.to(code).emit('peer-left',{id:socket.id});
    if (rooms.get(code).size===0) rooms.delete(code);
  });
});
const port=process.env.PORT || 3000;
server.listen(port,'0.0.0.0',()=>console.log(`StreamBuddies rodando em http://localhost:${port}`));
