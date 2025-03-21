// core/ecs/components/MoveComponent.js
export default class MoveComponent {
  constructor(type, damage = 0, staminaCost = 1, chiCost = 0) {
    this.type = type; // e.g., '\', '/', etc.
    this.damage = damage;
    this.staminaCost = staminaCost;
    this.chiCost = chiCost;
    this.ownerRef = null; // Reference to owner entity ID
  }
}