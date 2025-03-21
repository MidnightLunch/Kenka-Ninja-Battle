// core/ecs/components/ResourceComponent.js
export default class ResourceComponent {
  constructor(maxChi = 5, maxStamina = 10) {
    this.currentChi = maxChi;
    this.maxChi = maxChi;
    this.currentStamina = maxStamina;
    this.maxStamina = maxStamina;
    this.specialMoves = 3; // Number of special moves remaining
  }
}
