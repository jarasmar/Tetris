const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Scale pieces x20
context.scale(20, 20);

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

function draw() {
  // Canvas style
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // draws the old players in arena
  drawMatrix(arena, {x: 0, y: 0});
  // draws the moving player
  drawMatrix(player.matrix, player.pos);
}

function createPiece(type ) {
  if (type === 'T') {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  } else if (type === 'O') {
    return [
      [1, 1],
      [1, 1],
    ];
  } else if (type === 'L') {
    return [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ];
  } else if (type === 'J') {
    return [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ];
  } else if (type === 'I') {
    return [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ];
  } else if (type === 'S') {
    return [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ];
  } else if (type === 'Z') {
    return [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ]; 
  }  
}

// copy values from player at arena in right position
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  });
};

function collide(arena, player) {
  // rename player matrix and position
  const [m, o] = [player.matrix, player.pos];
  
  // for player matrix: y is column, x is row
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      // if the matrix of player is not 0
      if (m[y][x] !== 0 &&
        // and the arena is not 0
        (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0) {
          // we collide
          return true;
        }
    }
  }
  return false;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    // move the player one up, merge with arena and move back to the top to start again
    player.pos.y--;
    merge(arena, player);
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  // doesn't allow collision with the sides or other players
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

// New pieces are random and appear top center
function playerReset() {
  const pieces = 'ILJOTSZ'; 
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                  (player.matrix[0].length / 2 | 0);

  // if we collide inmediately with a new piece: game over
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;

  rotate(player.matrix, dir);

  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x =0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
        matrix[y][x],
        matrix[x][y],
      ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
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

const arena = createMatrix(12, 20);
// console.log(arena); console.table(arena);

const player = {
  pos: {x: 0, y: 0},
  matrix: createPiece('T'),
};


document.addEventListener('keydown', event => {
  // Find keyCode for arrows
  // console.log(event);

  if (event.keyCode === 37) {
    playerMove(-1)
  } else if (event.keyCode === 39) {
    playerMove(1)
  } else if (event.keyCode === 40) {
    playerDrop();
  } else if (event.keyCode === 81) {
    playerRotate(-1);
  } else if (event.keyCode === 87) {
    playerRotate(1);
  }
});

update();
