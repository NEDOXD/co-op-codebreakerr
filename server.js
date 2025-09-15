const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const rooms = {};

function generateCode(){ let code=''; for(let i=0;i<4;i++) code+=Math.floor(Math.random()*10); return code; }
function getFeedback(secret, guess){ let fb=[]; let s=secret.split(''), g=guess.split(''); for(let i=0;i<g.length;i++){ if(g[i]===s[i]){ fb[i]='✅'; s[i]=null; g[i]=null; } } for(let i=0;i<g.length;i++){ if(g[i]&&s.includes(g[i])){ fb[i]='⚪'; s[s.indexOf(g[i])]=null; } else if(g[i]) fb[i]='❌'; } return fb.join(' '); }

io.on('connection', socket=>{
  console.log('New player connected');

  socket.on('joinRoom', ({roomCode, playerName, nameColor, avatar})=>{
    if(!playerName) return socket.emit('errorMsg','Name required');
    socket.join(roomCode);
    socket.playerName = playerName;
    socket.nameColor = nameColor;
    socket.avatar = avatar;
    if(!rooms[roomCode]) rooms[roomCode]={secretCode: generateCode(), guesses: []};
    socket.emit('joinedRoom', rooms[roomCode].guesses);
  });

  socket.on('makeGuess', ({roomCode, guess})=>{
    if(!rooms[roomCode]) return;
    const feedback=getFeedback(rooms[roomCode].secretCode, guess);
    rooms[roomCode].guesses.push({ player: socket.playerName, guess, feedback, color: socket.nameColor, avatar: socket.avatar });
    io.to(roomCode).emit('updateGuesses', rooms[roomCode].guesses);
    if(feedback==='✅ ✅ ✅ ✅'){ io.to(roomCode).emit('gameWon',{player: socket.playerName, guess}); delete rooms[roomCode]; }
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
