// core/GameManager.js
import EntityManager from './ecs/EntityManager.js';
import SystemManager from './ecs/systems/SystemManager.js';
import GameState from './GameState.js';

// Import Components
import HealthComponent from './ecs/components/HealthComponent.js';
import StanceComponent from './ecs/components/StanceComponent.js';
import ResourceComponent from './ecs/components/ResourceComponent.js';
import PositionComponent from './ecs/components/PositionComponent.js';
import StatusEffectComponent from './ecs/components/StatusEffectComponent.js';

// Import Systems
import MovementSystem from './ecs/systems/MovementSystem.js';
import CombatSystem from './ecs/systems/CombatSystem.js';
import ResourceSystem from './ecs/systems/ResourceSystem.js';
import StatusSystem from './ecs/systems/StatusSystem.js';

class GameManager {
  constructor() {
    this.entityManager = new EntityManager();
    this.systemManager = new SystemManager(this.entityManager);
    this.gameState = new GameState();
    
    // Initialize systems
    this.initializeSystems();
  }
  
  initializeSystems() {
    this.systemManager.addSystem(new StatusSystem());
    this.systemManager.addSystem(new MovementSystem());
    this.systemManager.addSystem(new CombatSystem());
    this.systemManager.addSystem(new ResourceSystem());
  }
  
  createPlayer(name, isEnemy = false) {
    const entityId = this.entityManager.createEntity(isEnemy ? 'Enemy' : 'Player');
    
    // Add components
    this.entityManager.addComponent(entityId, 'Health', new HealthComponent(10));
    this.entityManager.addComponent(entityId, 'Stance', new StanceComponent());
    this.entityManager.addComponent(entityId, 'Resource', new ResourceComponent());
    this.entityManager.addComponent(entityId, 'Position', new PositionComponent());
    this.entityManager.addComponent(entityId, 'StatusEffect', new StatusEffectComponent());
    
    return entityId;
  }
  
  processTurn(player1Moves, player2Moves) {
    // Clear previous state
    this.gameState.clearEvents();
    this.gameState.clearMoves();
    
    // Set moves for this turn
    const playerEntities = this.entityManager.getEntitiesWithComponents(['Health']);
    
    if (playerEntities.length >= 1) {
      this.gameState.addMoves(playerEntities[0], player1Moves);
    }
    
    if (playerEntities.length >= 2) {
      this.gameState.addMoves(playerEntities[1], player2Moves);
    }
    
    // Process systems
    this.systemManager.update(this.gameState);
    
    // Check for game over
    this.checkGameOver();
    
    // Increment turn counter
    this.gameState.currentTurn++;
    
    return {
      events: this.gameState.events,
      gameOver: this.gameState.gameOver,
      winner: this.gameState.winner
    };
  }
  
  checkGameOver() {
    const playerEntities = this.entityManager.getEntitiesWithComponents(['Health']);
    
    for (const entityId of playerEntities) {
      const health = this.entityManager.getComponent(entityId, 'Health');
      
      if (health.currentHealth <= 0) {
        this.gameState.gameOver = true;
        this.gameState.winner = playerEntities.find(id => id !== entityId);
        
        this.gameState.events.push({
          type: 'GAME_OVER',
          winner: this.gameState.winner
        });
        
        break;
      }
    }
  }
  
  getPlayerState(entityId) {
    const health = this.entityManager.getComponent(entityId, 'Health');
    const stance = this.entityManager.getComponent(entityId, 'Stance');
    const resource = this.entityManager.getComponent(entityId, 'Resource');
    const position = this.entityManager.getComponent(entityId, 'Position');
    const status = this.entityManager.getComponent(entityId, 'StatusEffect');
    
    return {
      health: {
        current: health.currentHealth,
        max: health.maxHealth
      },
      stance: stance.currentStance,
      resources: {
        chi: {
          current: resource.currentChi,
          max: resource.maxChi
        },
        stamina: {
          current: resource.currentStamina,
          max: resource.maxStamina
        },
        specialMoves: resource.specialMoves
      },
      distance: position.distance,
      statusEffects: status.activeEffects
    };
  }
}

export default GameManager;