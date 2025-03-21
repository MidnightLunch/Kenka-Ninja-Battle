// core/ecs/components/StanceComponent.js
export default class StanceComponent {
  static NORMAL = 'Normal';
  static OFFENSIVE = 'Offensive';
  static DEFENSIVE = 'Defensive';
  static PRONE = 'Prone';
  static EXHAUSTED = 'Exhausted';
  
  constructor(initialStance = StanceComponent.NORMAL) {
    this.currentStance = initialStance;
    this.stanceDuration = 0; // Turns remaining in current stance
  }
}





