// core/GameState.js
class GameState {
  constructor() {
    this.playerMoves = new Map(); // Map of entityId -> array of moves
    this.currentTurn = 1;
    this.events = []; // Events that happened during this turn
    this.gameOver = false;
    this.winner = null;
  }
  
  clearEvents() {
    this.events = [];
  }
  
  addMoves(entityId, moves) {
    this.playerMoves.set(entityId, moves);
  }
  
  clearMoves() {
    this.playerMoves.clear();
  }
}

export default GameState;