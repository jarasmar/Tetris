describe('Tetris', function() {
  
  var tetris;

  beforeEach(function() {
    tetris = new tetris;
  });

  describe('creates a piece', function() {
    it('creates a T piece', function() {
      expect(tetris.createPiece('T')).toEqual([
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ]);
    });
  });

});