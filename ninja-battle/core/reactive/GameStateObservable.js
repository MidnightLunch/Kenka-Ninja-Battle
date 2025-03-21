// core/reactive/GameStateObservable.js
import Observable from './Observable.js';

class GameStateObservable {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.playerState = new Map();
    this.distance = new Observable('Medium');
    this.turnCounter = new Observable(1);
    this.events = new Observable([]);
  }
  
  initialize() {
    const playerEntities = this.gameManager.entityManager.getEntitiesWithComponents(['Health']);
    
    for (const entityId of playerEntities) {
      this.playerState.set(entityId, {
        health: new Observable({ current: 10, max: 10 }),
        stance: new Observable('Normal'),
        chi: new Observable({ current: 5, max: 5 }),
        stamina: new Observable({ current: 10, max: 10 }),
        specialMoves: new Observable(3),
        statusEffects: new Observable([])
      });
    }
  }
  
  update() {
    const playerEntities = this.gameManager.entityManager.getEntitiesWithComponents(['Health']);
    
    // Update player states
    for (const entityId of playerEntities) {
      const state = this.gameManager.getPlayerState(entityId);
      
      if (this.playerState.has(entityId)) {
        const observables = this.playerState.get(entityId);
        
        observables.health.setValue(state.health);
        observables.stance.setValue(state.stance);
        observables.chi.setValue(state.resources.chi);
        observables.stamina.setValue(state.resources.stamina);
        observables.specialMoves.setValue(state.resources.specialMoves);
        observables.statusEffects.setValue(state.statusEffects);
      }
    }
    
    // Update distance
    const firstPlayerState = this.gameManager.getPlayerState(playerEntities[0]);
    this.distance.setValue(firstPlayerState.distance);
    
    // Update turn counter
    this.turnCounter.setValue(this.gameManager.gameState.currentTurn);
    
    // Update events
    this.events.setValue(this.gameManager.gameState.events);
  }
  
  getPlayerObservables(entityId) {
    return this.playerState.get(entityId);
  }
}

export default GameStateObservable;