// core/ecs/systems/ResourceSystem.js
import System from './System.js';
import StanceComponent from '../components/StanceComponent.js';

class ResourceSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['Resource'];
  }
  
  update(gameState) {
    const entities = this.entityManager.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of entities) {
      const resourceComponent = this.entityManager.getComponent(entityId, 'Resource');
      const stanceComponent = this.entityManager.getComponent(entityId, 'Stance');
      
      // Process resource consumption from moves
      this.processMoveResourceCosts(entityId, resourceComponent, gameState);
      
      // Regenerate resources
      this.regenerateResources(resourceComponent, stanceComponent);
      
      // Check for exhaustion
      this.checkExhaustion(entityId, resourceComponent, stanceComponent);
    }
  }
  
  processMoveResourceCosts(entityId, resourceComponent, gameState) {
    const moves = gameState.playerMoves.get(entityId) || [];
    
    for (const moveType of moves) {
      const costs = this.getMoveResourceCosts(moveType);
      
      resourceComponent.currentChi -= costs.chi;
      resourceComponent.currentStamina -= costs.stamina;
      
      // Ensure values don't go below 0
      resourceComponent.currentChi = Math.max(0, resourceComponent.currentChi);
      resourceComponent.currentStamina = Math.max(0, resourceComponent.currentStamina);
      
      // Track special move usage
      if (this.isSpecialMove(moveType)) {
        resourceComponent.specialMoves--;
      }
    }
  }
  
  getMoveResourceCosts(moveType) {
    // Define base costs for each move type
    switch (moveType) {
      case '\\': // Left Swipe
      case '/': // Right Swipe
      case '|': // Vertical Strike
      case '_': // Sweep Kick
        return { chi: 0, stamina: 1 };
      case '^': // Jump
      case '>': // Forward Dash
      case '<': // Backward Leap
        return { chi: 0, stamina: 1 };
      case '0': // Block
        return { chi: 0, stamina: 1 };
      case '*': // Ninja Star
        return { chi: 2, stamina: 0 };
      case '!': // Power Strike
        return { chi: 2, stamina: 1 };
      case '~': // Smoke Bomb
        return { chi: 2, stamina: 0 };
      case '=': // Focus
        return { chi: 1, stamina: 0 };
      default:
        return { chi: 0, stamina: 0 };
    }
  }
  
  isSpecialMove(moveType) {
    return ['*', '~', '&'].includes(moveType);
  }
  
  regenerateResources(resourceComponent, stanceComponent) {
    // Base regeneration
    let chiRegen = 1;
    let staminaRegen = 2;
    
    // Stance-based modifiers
    if (stanceComponent) {
      switch (stanceComponent.currentStance) {
        case StanceComponent.DEFENSIVE:
          chiRegen = 2; // More chi regen in defensive stance
          break;
        case StanceComponent.OFFENSIVE:
          staminaRegen = 1; // Less stamina regen in offensive stance
          break;
        case StanceComponent.EXHAUSTED:
          staminaRegen = 3; // More stamina regen when exhausted
          chiRegen = 0; // No chi regen when exhausted
          break;
        case StanceComponent.PRONE:
          staminaRegen = 1; // Less stamina regen when prone
          break;
      }
    }
    
    // Apply regeneration
    resourceComponent.currentChi = Math.min(
      resourceComponent.maxChi,
      resourceComponent.currentChi + chiRegen
    );
    
    resourceComponent.currentStamina = Math.min(
      resourceComponent.maxStamina,
      resourceComponent.currentStamina + staminaRegen
    );
  }
  
  checkExhaustion(entityId, resourceComponent, stanceComponent) {
    if (!stanceComponent) return;
    
    // Check for exhaustion
    if (resourceComponent.currentStamina === 0 && 
        stanceComponent.currentStance !== StanceComponent.PRONE) {
      stanceComponent.currentStance = StanceComponent.EXHAUSTED;
    }
    
    // Check for recovery from exhaustion
    if (resourceComponent.currentStamina > 2 && 
        stanceComponent.currentStance === StanceComponent.EXHAUSTED) {
      stanceComponent.currentStance = StanceComponent.NORMAL;
    }
  }
}

export default ResourceSystem;