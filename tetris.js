'use strict';

function Tetris() {
};

const canvas = document.getElementById('tetris');

const context = canvas.getContext('2d');

const matrix = []

const colors = [
  null,
  '#FF0000',
  '#FF8C00',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#0000FF',
  '#FF00FF',
];
  
const player = {
  pos: {x: 0, y: 0},
  matrix: null,
  score: 0,
};

// create sections in the background to hold the pieces
Tetris.prototype.createMatrix = function(w, h) {
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// Fill matrix with shapes
Tetris.prototype.drawMatrix = function(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x, 
                        y + offset.y, 
                        1, 1);
      }
    });
  });
}

Tetris.prototype.draw = function() {
  // Canvas style
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  
  // draws the old players in arena
  tetris.drawMatrix(arena, {x: 0, y: 0});
  // draws the moving player
  tetris.drawMatrix(player.matrix, player.pos);
}

Tetris.prototype.createPiece = function(type) {
  if (type === 'T') {
    return [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
  } else if (type === 'O') {
    return [
      [2, 2],
      [2, 2],
    ];
  } else if (type === 'L') {
    return [
      [0, 3, 0],
      [0, 3, 0],
      [0, 3, 3],
    ];
  } else if (type === 'J') {
    return [
      [0, 4, 0],
      [0, 4, 0],
      [4, 4, 0],
    ];
  } else if (type === 'I') {
    return [
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
      [0, 5, 0, 0],
    ];
  } else if (type === 'S') {
    return [
      [0, 6, 6],
      [6, 6, 0],
      [0, 0, 0],
    ];
  } else if (type === 'Z') {
    return [
      [7, 7, 0],
      [0, 7, 7],
      [0, 0, 0],
    ]; 
  }  
}

// Keep shapes in arena
Tetris.prototype.merge = function(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  });
};

// Check for shapes collisions
Tetris.prototype.collide = function(arena, player) {
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

// clear full lines in arena
Tetris.prototype.arenaSweep = function() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length;  ++x) {
      // if not fully populated goes back to the for loop
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    // if full, empty the row, add space to top
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    // add points to score. Every line doubles points
    player.score += rowCount * 10;
    rowCount *= 2;
  }
}

// Control pieces movements
Tetris.prototype.playerDrop = function() {
  player.pos.y++;
  if (tetris.collide(arena, player)) {
    // move the player one up, merge with arena and move back to the top to start again
    player.pos.y--;
    tetris.merge(arena, player);
    tetris.playerReset();
    tetris.arenaSweep();
    tetris.updateScore();
  }
  dropCounter = 0;
}

Tetris.prototype.playerMove = function(dir) {
  // doesn't allow collision with the sides or other players
  player.pos.x += dir;
  if (tetris.collide(arena, player)) {
    player.pos.x -= dir;
  }
}

// New pieces are random and appear top center
Tetris.prototype.playerReset = function() {
  const pieces = 'ILJOTSZ'; 
  player.matrix = tetris.createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) -
                  (player.matrix[0].length / 2 | 0);

  // if we collide inmediately with a new piece: game over (clean arena and reset score)
  if (tetris.collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    tetris.updateScore();
  }
}

Tetris.prototype.playerRotate = function(dir) {
  const pos = player.pos.x;
  let offset = 1;

  tetris.rotate(player.matrix, dir);

  while (tetris.collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      tetris.rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

Tetris.prototype.rotate = function(matrix, dir) {
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

// Changes piece position automatically
Tetris.prototype.update = function(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  // Everytime a second passes, piece drops one position
  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    tetris.playerDrop();
  }

  tetris.draw();
  requestAnimationFrame(tetris.update);
}

Tetris.prototype.updateScore = function() {
  document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {
  // Find keyCode for arrows
  // console.log(event);

  if (event.keyCode === 37) {
    tetris.playerMove(-1)
  } else if (event.keyCode === 39) {
    tetris.playerMove(1)
  } else if (event.keyCode === 40) {
    tetris.playerDrop();
  } else if (event.keyCode === 81) {
    tetris.playerRotate(-1);
  } else if (event.keyCode === 87) {
    tetris.playerRotate(1);
  }
});

// Scale pieces x20
context.scale(20, 20);

let tetris = new Tetris;
const arena = tetris.createMatrix(12, 20);
tetris.playerReset();
tetris.updateScore();
tetris.update();
