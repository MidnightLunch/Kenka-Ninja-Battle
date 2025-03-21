// core/ecs/systems/System.js
class System {
  constructor() {
    this.entityManager = null;
  }
  
  setEntityManager(entityManager) {
    this.entityManager = entityManager;
  }
  
  update(gameState) {
    // To be implemented by subclasses
  }
}

export default System;
