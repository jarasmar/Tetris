const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Scale pieces x20
context.scale(20, 20);

// Piece on 'T' Shape
const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0]
];

// create sections in the background to hold the pieces at bottom
function createMatrix(w, h) {
  const matrix = []
  // while height is not zero, decrease
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = 'red';
        context.fillRect(x + offset.x, 
                        y + offset.y, 
                        1, 1);
      }
    });
  });
}

const arena = createMatrix(12, 20);
console.log(arena); console.table(arena);

const player = {
  pos: {x: 5, y: 5},
  matrix: matrix,
}

function draw() {
  // Canvas style
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  drawMatrix(player.matrix, player.pos);
}

function playerDrop() {
  player.pos.y++;
  dropCounter = 0;
}

// Every second the piece drops
let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  // Everytime a second passes, piece drops one position
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
  // Find keyCode for arrows
  // console.log(event);

  if (event.keyCode === 37) {
    player.pos.x--
  } else if (event.keyCode === 39) {
    player.pos.x++
  } else if (event.keyCode === 40) {
    playerDrop();
  }
});

update();
