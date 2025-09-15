const socket=io();
const nameInput=document.getElementById('nameInput');
const roomInput=document.getElementById('roomInput');
const nameColor=document.getElementById('nameColor');
const joinBtn=document.getElementById('joinBtn');
const gameDiv=document.getElementById('game');
const guessInput=document.getElementById('guessInput');
const guessBtn=document.getElementById('guessBtn');
const guessesList=document.getElementById('guessesList');
const statusDiv=document.getElementById('status');
const avatarCanvas=document.getElementById('avatarCanvas');
const pixelColor=document.getElementById('pixelColor');
const hatSelect=document.getElementById('hatSelect');
const glassesSelect=document.getElementById('glassesSelect');

let currentRoom=''; 
let avatarGrid=Array(8).fill(0).map(()=>Array(8).fill('#000')); 
let playerAvatar={hat:'none', glasses:'none', base:avatarGrid};

function drawAvatar(){const ctx=avatarCanvas.getContext('2d');const cell=avatarCanvas.width/8;ctx.clearRect(0,0,avatarCanvas.width,avatarCanvas.height);for(let y=0;y<8;y++){for(let x=0;x<8;x++){ctx.fillStyle=avatarGrid[y][x];ctx.fillRect(x*cell,y*cell,cell,cell);}}
ctx.fillStyle='red';if(playerAvatar.hat==='beanie')ctx.fillRect(cell*2,0,cell*4,cell);if(playerAvatar.hat==='crown')ctx.fillRect(cell*1,0,cell*6,cell);if(playerAvatar.hat==='topHat')ctx.fillRect(cell*1,0,cell*6,cell*2);
ctx.fillStyle='blue';if(playerAvatar.glasses==='sunglasses')ctx.fillRect(cell*2,cell*3,cell*4,cell);if(playerAvatar.glasses==='nerd'){ctx.fillRect(cell*2,cell*3,cell,cell);ctx.fillRect(cell*5,cell*3,cell,cell);}}
avatarCanvas.addEventListener('click',e=>{const rect=avatarCanvas.getBoundingClientRect();const x=Math.floor((e.clientX-rect.left)/(rect.width/8));const y=Math.floor((e.clientY-rect.top)/(rect.height/8));avatarGrid[y][x]=pixelColor.value;drawAvatar();});
hatSelect.addEventListener('change',()=>{playerAvatar.hat=hatSelect.value;drawAvatar();});
glassesSelect.addEventListener('change',()=>{playerAvatar.glasses=glassesSelect.value;drawAvatar();});

joinBtn.addEventListener('click',()=>{const playerName=nameInput.value.trim();if(!playerName)return alert('Name is required!');const roomCode=roomInput.value.trim().toUpperCase();if(!roomCode)return alert('Room code is required!');currentRoom=roomCode;playerAvatar.base=avatarGrid;socket.emit('joinRoom',{roomCode,playerName,nameColor:nameColor.value,avatar:playerAvatar});});

socket.on('joinedRoom',guesses=>{document.getElementById('joinSection').style.display='none';gameDiv.style.display='block';guessesList.innerHTML='';guesses.forEach(g=>addGuess(g));});
guessBtn.addEventListener('click',()=>{const guess=guessInput.value.trim();if(guess.length!==4)return alert('Guess must be 4 digits');socket.emit('makeGuess',{roomCode:currentRoom,guess});guessInput.value='';});
socket.on('updateGuesses',guesses=>{guessesList.innerHTML='';guesses.forEach(g=>addGuess(g));});
socket.on('gameWon',({player,guess})=>{statusDiv.textContent=`🎉 ${player} cracked the code: ${guess} 🎉`;});

function addGuess({player,guess,feedback,color,avatar}){const li=document.createElement('li');const canvas=document.createElement('canvas');canvas.width=32;canvas.height=32;const ctx=canvas.getContext('2d');const cell=canvas.width/8;for(let y=0;y<8;y++){for(let x=0;x<8;x++){ctx.fillStyle=avatar.base[y][x]||'#000';ctx.fillRect(x*cell,y*cell,cell,cell);}}
ctx.fillStyle='red';if(avatar.hat==='beanie')ctx.fillRect(cell*2,0,cell*4,cell);if(avatar.hat==='crown')ctx.fillRect(cell*1,0,cell*6,cell);if(avatar.hat==='topHat')ctx.fillRect(cell*1,0,cell*6,cell*2);
ctx.fillStyle='blue';if(avatar.glasses==='sunglasses')ctx.fillRect(cell*2,cell*3,cell*4,cell);if(avatar.glasses==='nerd'){ctx.fillRect(cell*2,cell*3,cell,cell);ctx.fillRect(cell*5,cell*3,cell,cell);}
li.appendChild(canvas);const span=document.createElement('span');span.textContent=`${player} guessed ${guess} → ${feedback}`;span.style.color=color;li.appendChild(span);guessesList.appendChild(li);}
