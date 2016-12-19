'use strict';

const game = window.p2pboardgameapi('../node_modules/p2pboardgameapi/src/signaling.php');
const die = game.createDie('die');
const statusElement = document.getElementById('status');
const tableElement = document.getElementById('table');
const dieElement = document.getElementById('die');
const pieces = new Map();
document.querySelectorAll('.pawn').forEach(pawn => {
  const piece = game.createPiece(pawn.id);
  pieces.set(pawn.id, piece);
  piece.on.move.add((x, y) => {
    pawn.style.left = x + 'px';
    pawn.style.top = y + 'px';
  });
});

statusElement.textContent = 'Connecting to channel from host …';
game.startConnection();
game.channel.on.message.add((message, userID) => console.log('received message from', userID, ': ', message));
if (game.playerNumber === 0) {
  const url = game.getURL();
  statusElement.textContent = `Channel opened. Please share the following URL: ${url}`;
  const connectedElement = document.createElement('div');
  connectedElement.textContent = '0 players connected';
  statusElement.appendChild(connectedElement);
  const update = () => {
    game.getNumberOfPlayers().then((numberOfPlayers) => {
      const playerCount = numberOfPlayers - 1;
      connectedElement.textContent = `${playerCount} player(s) connected with you.`;
      const startButton = document.createElement('button');
      startButton.textContent = 'Start Game';
      startButton.addEventListener('click', game.start.bind(game));
      connectedElement.appendChild(startButton);
    });
  };
  game.on.playerJoin.add(update);
  game.on.playerLeave.add(update);
} else {
  const update = () => {
    game.getNumberOfPlayers().then((numberOfPlayers) => {
      const playerCount = numberOfPlayers - 1;
      statusElement.textContent = `Connected with ${playerCount} player(s). Waiting for start …`;
    });
  };
  game.on.playerJoin.add(update);
  game.on.playerLeave.add(update);
}

die.on.error.add(error => { alert(error.message) });
dieElement.addEventListener('click', () => { die.roll() }, false);
interact('.pawn').draggable({
  inertia: true,
  autoScroll: true,
  onmove: (e) => {
    const pawn = e.target;
    const pawnStyle = getComputedStyle(pawn);
    const x = parseInt(pawnStyle.left || 0) + e.dx;
    const y = parseInt(pawnStyle.top || 0) + e.dy;
    const piece = pieces.get(pawn.id);
    piece.move(x, y);
  }
});
game.on.start.add(() => {
  statusElement.setAttribute('hidden', 'hidden');
  tableElement.removeAttribute('hidden');
});
function animateDie() {
  if (die.isRolling) {
    dieElement.textContent = Math.floor(Math.random() * 5) + 1;
    setTimeout(() => {
      requestAnimationFrame(animateDie);
    }, 10);
  }
}
die.on.rollStart.add(animateDie);
die.on.rollFinish.add((number) => {
  dieElement.textContent = number;
});
