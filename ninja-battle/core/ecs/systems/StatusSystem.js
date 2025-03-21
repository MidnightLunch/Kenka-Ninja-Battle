// core/ecs/systems/StatusSystem.js
import System from './System.js';
import StanceComponent from '../components/StanceComponent.js';

class StatusSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['StatusEffect'];
  }
  
  update(gameState) {
    const entities = this.entityManager.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of entities) {
      const statusComponent = this.entityManager.getComponent(entityId, 'StatusEffect');
      
      // Process active effects
      this.processActiveEffects(entityId, statusComponent, gameState);
      
      // Update effect durations
      statusComponent.updateEffects();
    }
  }
  
  processActiveEffects(entityId, statusComponent, gameState) {
    for (const effect of statusComponent.activeEffects) {
      switch (effect.type) {
        case 'Bleeding':
          this.applyBleedingDamage(entityId, effect.intensity);
          break;
        case 'Prone':
          this.processProne(entityId, gameState);
          break;
        case 'Stunned':
          this.processStunned(entityId, gameState);
          break;
        case 'Disoriented':
          this.processDisoriented(entityId, gameState);
          break;
      }
    }
  }
  
  applyBleedingDamage(entityId, intensity) {
    const healthComponent = this.entityManager.getComponent(entityId, 'Health');
    if (healthComponent) {
      healthComponent.currentHealth -= intensity;
      // Ensure health doesn't go below 0
      healthComponent.currentHealth = Math.max(0, healthComponent.currentHealth);
    }
  }
  
  processProne(entityId, gameState) {
    // Check if player has used Jump to recover
    const moves = gameState.playerMoves.get(entityId) || [];
    const hasJumped = moves.includes('^');
    
    if (hasJumped) {
      // Remove prone status
      const statusComponent = this.entityManager.getComponent(entityId, 'StatusEffect');
      statusComponent.removeEffect('Prone');
      
      // Update stance
      const stanceComponent = this.entityManager.getComponent(entityId, 'Stance');
      if (stanceComponent && stanceComponent.currentStance === StanceComponent.PRONE) {
        stanceComponent.currentStance = StanceComponent.NORMAL;
      }
      
      gameState.events.push({
        type: 'RECOVERED_FROM_PRONE',
        entityId
      });
    }
  }
  
  processStunned(entityId, gameState) {
    // If stunned, remove the first move
    const moves = gameState.playerMoves.get(entityId) || [];
    if (moves.length > 0) {
      moves.shift();
      gameState.playerMoves.set(entityId, moves);
      
      gameState.events.push({
        type: 'MOVE_SKIPPED_DUE_TO_STUN',
        entityId
      });
    }
  }
  
  processDisoriented(entityId, gameState) {
    // If disoriented, reverse move inputs
    const moves = gameState.playerMoves.get(entityId) || [];
    const reversedMoves = moves.map(move => this.reverseMove(move));
    
    gameState.playerMoves.set(entityId, reversedMoves);
    
    if (moves.length > 0) {
      gameState.events.push({
        type: 'MOVES_REVERSED_DUE_TO_DISORIENTATION',
        entityId
      });
    }
  }
  
  reverseMove(move) {
    // Define reversed moves
    const reversalMap = {
      '>': '<',
      '<': '>',
      '\\': '/',
      '/': '\\'
    };
    
    return reversalMap[move] || move;
  }
}

export default StatusSystem;