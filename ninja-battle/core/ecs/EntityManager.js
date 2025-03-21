// core/ecs/EntityManager.js
class EntityManager {
  constructor() {
    this.entities = new Map();
    this.nextEntityId = 1;
    this.componentArrays = new Map();
  }

  createEntity(type = "Generic") {
    const entityId = `E${String(this.nextEntityId).padStart(4, '0')}`;
    this.entities.set(entityId, {
      id: entityId,
      type,
      active: true,
      componentMask: []
    });
    this.nextEntityId++;
    return entityId;
  }

  removeEntity(entityId) {
    // Remove all components for this entity
    for (const componentArray of this.componentArrays.values()) {
      if (componentArray.has(entityId)) {
        componentArray.delete(entityId);
      }
    }
    // Remove the entity itself
    this.entities.delete(entityId);
  }

  addComponent(entityId, componentType, componentData) {
    if (!this.entities.has(entityId)) {
      throw new Error(`Entity ${entityId} does not exist`);
    }

    // Create component array if it doesn't exist
    if (!this.componentArrays.has(componentType)) {
      this.componentArrays.set(componentType, new Map());
    }

    // Add component to array
    this.componentArrays.get(componentType).set(entityId, componentData);
    
    // Update component mask
    const entity = this.entities.get(entityId);
    if (!entity.componentMask.includes(componentType)) {
      entity.componentMask.push(componentType);
    }
  }

  getComponent(entityId, componentType) {
    if (!this.componentArrays.has(componentType) || 
        !this.componentArrays.get(componentType).has(entityId)) {
      return null;
    }
    return this.componentArrays.get(componentType).get(entityId);
  }

  getEntitiesWithComponents(componentTypes) {
    const result = [];
    
    for (const [entityId, entity] of this.entities.entries()) {
      let hasAllComponents = true;
      
      for (const componentType of componentTypes) {
        if (!entity.componentMask.includes(componentType)) {
          hasAllComponents = false;
          break;
        }
      }
      
      if (hasAllComponents) {
        result.push(entityId);
      }
    }
    
    return result;
  }
}

// Export the class
export default EntityManager;