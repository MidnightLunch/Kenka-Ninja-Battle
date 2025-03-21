// core/ecs/components/HealthComponent.js
export default class HealthComponent {
  constructor(maxHealth = 10) {
    this.currentHealth = maxHealth;
    this.maxHealth = maxHealth;
  }
}

