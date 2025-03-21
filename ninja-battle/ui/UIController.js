// ui/UIController.js
class UIController {
  constructor(gameManager, gameStateObservable) {
    this.gameManager = gameManager;
    this.gameStateObservable = gameStateObservable;
    this.moveSequence = [];
    this.aiMoveSequence = [];
    this.maxMoves = 5;
    this.turnTimer = null;
    this.timerDuration = 10000; // 10 seconds
    this.timeRemaining = this.timerDuration;
    this.playerEntityId = null;
    this.aiEntityId = null;
    
    // Initialize game
    this.initializeGame();
    
    // Initialize UI elements
    this.initializeUI();
    
    // Subscribe to game state changes
    this.subscribeToGameState();
  }
  
  initializeGame() {
    // Create player and AI
    this.playerEntityId = this.gameManager.createPlayer('SHADOW');
    this.aiEntityId = this.gameManager.createPlayer('ZEPHYR', true);
    
    // Initialize observables
    this.gameStateObservable.initialize();
  }
  
  initializeUI() {
    // Move buttons
    const moveButtons = document.querySelectorAll('.move-btn');
    moveButtons.forEach(button => {
      button.addEventListener('click', () => {
        const move = button.textContent.trim()[0]; // Get the first character of the button text
        this.addMove(move);
      });
    });
    
    // Clear button
    const clearButton = document.querySelector('.clear-btn');
    clearButton.addEventListener('click', () => this.clearMoves());
    
    // Submit button
    const submitButton = document.querySelector('.submit-btn');
    submitButton.addEventListener('click', () => this.submitMoves());
    
    // Initialize move slots
    this.updateMoveSlots();
  }
  
  subscribeToGameState() {
    // Player health
    const playerHealth = this.gameStateObservable.getPlayerObservables(this.playerEntityId).health;
    playerHealth.subscribe(value => {
      const healthBar = document.querySelector('.health-fill');
      const percentage = (value.current / value.max) * 100;
      healthBar.style.width = `${percentage}%`;
    });
    
    // Player chi
    const playerChi = this.gameStateObservable.getPlayerObservables(this.playerEntityId).chi;
    playerChi.subscribe(value => {
      const chiBar = document.querySelector('.chi-fill');
      const percentage = (value.current / value.max) * 100;
      chiBar.style.width = `${percentage}%`;
    });
    
    // Player stamina
    const playerStamina = this.gameStateObservable.getPlayerObservables(this.playerEntityId).stamina;
    playerStamina.subscribe(value => {
      const staminaBar = document.querySelector('.stamina-fill');
      const percentage = (value.current / value.max) * 100;
      staminaBar.style.width = `${percentage}%`;
    });
    
    // Player stance
    const playerStance = this.gameStateObservable.getPlayerObservables(this.playerEntityId).stance;
    playerStance.subscribe(value => {
      const stanceElement = document.querySelector('.ninja-stance');
      stanceElement.textContent = value.toUpperCase();
      
      // Remove all stance classes
      stanceElement.classList.remove('stance-normal', 'stance-offensive', 'stance-defensive', 'stance-prone');
      
      // Add appropriate stance class
      stanceElement.classList.add(`stance-${value.toLowerCase()}`);
    });
    
    // AI health
    const aiHealth = this.gameStateObservable.getPlayerObservables(this.aiEntityId).health;
    aiHealth.subscribe(value => {
      const healthBar = document.querySelector('.enemy-health-fill');
      const percentage = (value.current / value.max) * 100;
      healthBar.style.width = `${percentage}%`;
    });
    
    // AI chi
    const aiChi = this.gameStateObservable.getPlayerObservables(this.aiEntityId).chi;
    aiChi.subscribe(value => {
      const chiBar = document.querySelector('.enemy-chi-fill');
      const percentage = (value.current / value.max) * 100;
      chiBar.style.width = `${percentage}%`;
    });
    
    // AI stamina
    const aiStamina = this.gameStateObservable.getPlayerObservables(this.aiEntityId).stamina;
    aiStamina.subscribe(value => {
      const staminaBar = document.querySelector('.enemy-stamina-fill');
      const percentage = (value.current / value.max) * 100;
      staminaBar.style.width = `${percentage}%`;
    });
    
    // AI stance
    const aiStance = this.gameStateObservable.getPlayerObservables(this.aiEntityId).stance;
    aiStance.subscribe(value => {
      const stanceElement = document.querySelector('.enemy-avatar + .ninja-name + .ninja-stance');
      stanceElement.textContent = value.toUpperCase();
      
      // Remove all stance classes
      stanceElement.classList.remove('stance-normal', 'stance-offensive', 'stance-defensive', 'stance-prone');
      
      // Add appropriate stance class
      stanceElement.classList.add(`stance-${value.toLowerCase()}`);
    });
    
    // Distance
    this.gameStateObservable.distance.subscribe(value => {
      const distanceElement = document.querySelector('.battle-distance');
      distanceElement.textContent = `${value.toUpperCase()} DISTANCE`;
    });
    
    // Events - update battle log
    this.gameStateObservable.events.subscribe(events => {
      this.updateBattleLog(events);
    });
  }
  
  addMove(move) {
    if (this.moveSequence.length >= this.maxMoves) {
      return; // Max moves reached
    }
    
    this.moveSequence.push(move);
    this.updateMoveSlots();
  }
  
  clearMoves() {
    this.moveSequence = [];
    this.updateMoveSlots();
  }
  
  updateMoveSlots() {
    const moveSlots = document.querySelectorAll('.move-slot');
    
    // Reset all slots
    moveSlots.forEach((slot, index) => {
      slot.textContent = '';
      slot.classList.remove('filled', 'active');
      
      // Set content if there's a move
      if (index < this.moveSequence.length) {
        slot.textContent = this.moveSequence[index];
        slot.classList.add('filled');
      }
      
      // Set active slot
      if (index === this.moveSequence.length && index < this.maxMoves) {
        slot.classList.add('active');
      }
    });
  }
  
  submitMoves() {
    if (this.moveSequence.length === 0) {
      return; // No moves to submit
    }
    
    // Generate AI moves
    this.generateAIMoves();
    
    // Process turn
    const result = this.gameManager.processTurn(this.moveSequence, this.aiMoveSequence);
    
    // Update game state
    this.gameStateObservable.update();
    
    // Clear moves for next turn
    this.moveSequence = [];
    this.aiMoveSequence = [];
    this.updateMoveSlots();
    
    // Check game over
    if (result.gameOver) {
      this.handleGameOver(result.winner);
    }
  }
  
  generateAIMoves() {
    // For now, just a simple random move generator
    const possibleMoves = ['\\', '/', '|', '_', '^', '0', '>', '<', '*', '!', '='];
    this.aiMoveSequence = [];
    
    const numMoves = this.moveSequence.length;
    
    for (let i = 0; i < numMoves; i++) {
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      this.aiMoveSequence.push(possibleMoves[randomIndex]);
    }
    
    // TODO: Implement smarter AI logic based on game state
  }
  
  updateBattleLog(events) {
    const battleLog = document.querySelector('.battle-log');
    const logTitle = battleLog.querySelector('.log-title');
    
    // Keep only the title
    battleLog.innerHTML = '';
    battleLog.appendChild(logTitle);
    
    // Add events as log entries
    for (const event of events) {
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      
      switch (event.type) {
        case 'ATTACK_HIT':
          logEntry.innerHTML = `<span class="log-player">SHADOW</span> hits with <span class="log-success">${this.getMoveDisplay(event.moveType)}</span> for ${event.damage} damage!`;
          break;
        case 'ATTACK_MISS_DISTANCE':
          logEntry.innerHTML = `<span class="log-player">SHADOW</span> attempts <span class="log-failure">${this.getMoveDisplay(event.moveType)}</span> but is out of range!`;
          break;
        case 'ATTACK_EVADED':
          logEntry.innerHTML = `<span class="log-player">SHADOW</span> attempts <span class="log-failure">${this.getMoveDisplay(event.moveType)}</span> but <span class="log-enemy">ZEPHYR</span> evades!`;
          break;
        case 'ATTACK_BLOCKED':
          logEntry.innerHTML = `<span class="log-player">SHADOW</span> attempts <span class="log-failure">${this.getMoveDisplay(event.moveType)}</span> but <span class="log-enemy">ZEPHYR</span> blocks!`;
          break;
        case 'RECOVERED_FROM_PRONE':
          logEntry.innerHTML = `<span class="log-player">SHADOW</span> <span class="log-success">recovers from prone</span> with a jump!`;
          break;
        case 'MOVE_SKIPPED_DUE_TO_STUN':
          logEntry.innerHTML = `<span class="log-player">SHADOW</span> is <span class="log-failure">stunned</span> and skips a move!`;
          break;
        case 'GAME_OVER':
          logEntry.innerHTML = `<span class="log-special">GAME OVER</span> - ${event.winner === this.playerEntityId ? 'SHADOW' : 'ZEPHYR'} wins!`;
          break;
        default:
          logEntry.textContent = JSON.stringify(event);
      }
      
      battleLog.appendChild(logEntry);
    }
    
    // Scroll to bottom
    battleLog.scrollTop = battleLog.scrollHeight;
  }
  
  getMoveDisplay(moveType) {
    const moveNames = {
      '\\': 'Left Swipe',
      '/': 'Right Swipe',
      '|': 'Vertical Strike',
      '_': 'Sweep Kick',
      '^': 'Jump',
      '0': 'Block',
      '>': 'Forward Dash',
      '<': 'Backward Leap',
      '*': 'Ninja Star',
      '!': 'Power Strike',
      '=': 'Focus',
      '~': 'Smoke Bomb'
    };
    
    return moveNames[moveType] || moveType;
  }
  
  handleGameOver(winnerId) {
    // Display game over message
    setTimeout(() => {
      alert(`Game Over! ${winnerId === this.playerEntityId ? 'SHADOW' : 'ZEPHYR'} wins!`);
    }, 1000);
  }
}

export default UIController;