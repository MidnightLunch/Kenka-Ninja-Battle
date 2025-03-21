// core/ecs/systems/SystemManager.js
class SystemManager {
  constructor(entityManager) {
    this.systems = [];
    this.entityManager = entityManager;
  }
  
  addSystem(system) {
    system.setEntityManager(this.entityManager);
    this.systems.push(system);
  }
  
  update(gameState) {
    for (const system of this.systems) {
      system.update(gameState);
    }
  }
}

export default SystemManager;