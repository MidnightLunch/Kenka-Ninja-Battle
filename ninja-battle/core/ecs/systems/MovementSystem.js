// core/ecs/systems/MovementSystem.js
import System from './System.js';
import PositionComponent from '../components/PositionComponent.js';

class MovementSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['Position', 'Move'];
  }
  
  update(gameState) {
    const entities = this.entityManager.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of entities) {
      const positionComponent = this.entityManager.getComponent(entityId, 'Position');
      const moveComponent = this.entityManager.getComponent(entityId, 'Move');
      
      // Process movement based on move type
      switch (moveComponent.type) {
        case '>': // Forward dash
          this.moveForward(positionComponent);
          break;
        case '<': // Backward leap
          this.moveBackward(positionComponent);
          break;
        // Other movement types can be added here
      }
    }
  }
  
  moveForward(positionComponent) {
    switch (positionComponent.distance) {
      case PositionComponent.FAR:
        positionComponent.distance = PositionComponent.MEDIUM;
        break;
      case PositionComponent.MEDIUM:
        positionComponent.distance = PositionComponent.CLOSE;
        break;
      case PositionComponent.CLOSE:
        // Already at closest distance
        break;
    }
  }
  
  moveBackward(positionComponent) {
    switch (positionComponent.distance) {
      case PositionComponent.CLOSE:
        positionComponent.distance = PositionComponent.MEDIUM;
        break;
      case PositionComponent.MEDIUM:
        positionComponent.distance = PositionComponent.FAR;
        break;
      case PositionComponent.FAR:
        // Already at farthest distance
        break;
    }
  }
}

export default MovementSystem;