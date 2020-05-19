const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Scale pieces x20
context.scale(20, 20);

// Canvas style
context.fillStyle = '#000';
context.fillRect(0, 0, canvas.width, canvas.height);

// Piece on 'T' Shape
const matrix = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0]
];

function drawMatrix(matrix) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = 'red';
        context.fillRect(x, y, 1, 1);
      }
    });
  });
}

drawMatrix(matrix);