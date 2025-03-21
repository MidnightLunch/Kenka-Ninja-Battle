// core/ecs/components/StatusEffectComponent.js
export default class StatusEffectComponent {
  constructor() {
    this.activeEffects = []; // Array of {type, duration, intensity}
  }
  
  addEffect(type, duration, intensity = 1) {
    // Check if effect already exists
    const existingEffect = this.activeEffects.find(e => e.type === type);
    
    if (existingEffect) {
      // Handle stacking rules based on type
      switch (type) {
        case 'Bleeding':
          existingEffect.intensity += intensity;
          existingEffect.duration = Math.max(existingEffect.duration, duration);
          break;
        case 'Prone':
        case 'Stunned':
        case 'Disoriented':
        case 'Focus':
          // Non-stacking effects - just reset duration
          existingEffect.duration = duration;
          break;
        default:
          existingEffect.duration = duration;
      }
    } else {
      // Add new effect
      this.activeEffects.push({ type, duration, intensity });
    }
  }
  
  removeEffect(type) {
    this.activeEffects = this.activeEffects.filter(e => e.type !== type);
  }
  
  hasEffect(type) {
    return this.activeEffects.some(e => e.type === type);
  }
  
  updateEffects() {
    // Decrease duration and remove expired effects
    this.activeEffects.forEach(effect => {
      effect.duration--;
    });
    
    this.activeEffects = this.activeEffects.filter(e => e.duration > 0);
  }
}