// core/ecs/components/PositionComponent.js
export default class PositionComponent {
  static CLOSE = 'Close';
  static MEDIUM = 'Medium';
  static FAR = 'Far';
  
  constructor(initialDistance = PositionComponent.MEDIUM) {
    this.distance = initialDistance;
  }
}
