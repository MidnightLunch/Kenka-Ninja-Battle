// core/ecs/systems/CombatSystem.js
import System from './System.js';
import PositionComponent from '../components/PositionComponent.js';
import StanceComponent from '../components/StanceComponent.js';

class CombatSystem extends System {
  constructor() {
    super();
    this.requiredComponents = ['Health', 'Move'];
  }
  
  update(gameState) {
    const entities = this.entityManager.getEntitiesWithComponents(this.requiredComponents);
    
    for (const entityId of entities) {
      const moveComponent = this.entityManager.getComponent(entityId, 'Move');
      
      // Only process attack moves
      if (!this.isAttackMove(moveComponent.type)) {
        continue;
      }
      
      const targets = this.findTargets(entityId, moveComponent);
      
      for (const targetId of targets) {
        this.processAttack(entityId, targetId, moveComponent, gameState);
      }
    }
  }
  
  isAttackMove(moveType) {
    // Define attack moves
    const attackMoves = ['\\', '/', '|', '_', '*', '!'];
    return attackMoves.includes(moveType);
  }
  
  findTargets(attackerId, moveComponent) {
    // In a 1v1 game, this would be simple - just the other player
    // For now, let's assume we have a simple way to get the opponent
    const allEntities = Array.from(this.entityManager.entities.keys());
    return allEntities.filter(id => id !== attackerId && 
                           this.entityManager.getComponent(id, 'Health'));
  }
  
  processAttack(attackerId, targetId, moveComponent, gameState) {
    const attackerPos = this.entityManager.getComponent(attackerId, 'Position');
    const targetPos = this.entityManager.getComponent(targetId, 'Position');
    
    // Check if attack can hit based on distance
    if (!this.canHitAtDistance(moveComponent.type, attackerPos.distance)) {
      gameState.events.push({
        type: 'ATTACK_MISS_DISTANCE',
        attackerId,
        targetId,
        moveType: moveComponent.type
      });
      return;
    }
    
    const targetStance = this.entityManager.getComponent(targetId, 'Stance');
    const targetStatus = this.entityManager.getComponent(targetId, 'StatusEffect');
    
    // Check for evasion based on stance/status
    if (this.isEvaded(moveComponent.type, targetStance.currentStance, targetStatus)) {
      gameState.events.push({
        type: 'ATTACK_EVADED',
        attackerId,
        targetId,
        moveType: moveComponent.type
      });
      return;
    }
    
    // Check for blocks
    if (this.isBlocked(moveComponent.type, targetId, gameState)) {
      gameState.events.push({
        type: 'ATTACK_BLOCKED',
        attackerId,
        targetId,
        moveType: moveComponent.type
      });
      return;
    }
    
    // Apply damage
    const damage = this.calculateDamage(moveComponent, attackerId, targetId);
    const targetHealth = this.entityManager.getComponent(targetId, 'Health');
    targetHealth.currentHealth -= damage;
    
    // Apply status effects if applicable
    this.applyStatusEffects(moveComponent.type, targetId);
    
    gameState.events.push({
      type: 'ATTACK_HIT',
      attackerId,
      targetId,
      moveType: moveComponent.type,
      damage
    });
  }
  
  canHitAtDistance(moveType, distance) {
    // Define which moves can hit at which distances
    const closeOnlyMoves = ['\\', '/', '_'];
    const mediumRangeMoves = ['|'];
    const anyRangeMoves = ['*'];
    
    if (distance === PositionComponent.CLOSE) {
      return true; // All attacks can hit at close range
    } else if (distance === PositionComponent.MEDIUM) {
      return mediumRangeMoves.includes(moveType) || anyRangeMoves.includes(moveType);
    } else { // FAR
      return anyRangeMoves.includes(moveType);
    }
  }
  
  isEvaded(moveType, targetStance, targetStatus) {
    // Low attacks are evaded by jumping or airborne targets
    const lowAttacks = ['\\', '/', '_'];
    if (lowAttacks.includes(moveType) && 
        (targetStatus?.hasEffect('Airborne') || targetStatus?.hasEffect('Jumping'))) {
      return true;
    }
    
    // Prone targets can't evade
    if (targetStance === StanceComponent.PRONE) {
      return false;
    }
    
    return false;
  }
  
  isBlocked(moveType, targetId, gameState) {
    // Check if target has used a block move
    const targetMoves = gameState.playerMoves.get(targetId) || [];
    const hasBlock = targetMoves.some(move => move === '0');
    
    // Ninja star (*) ignores blocks
    if (moveType === '*') {
      return false;
    }
    
    return hasBlock;
  }
  
  calculateDamage(moveComponent, attackerId, targetId) {
    let baseDamage = moveComponent.damage;
    
    // Apply stance modifiers
    const attackerStance = this.entityManager.getComponent(attackerId, 'Stance');
    if (attackerStance?.currentStance === StanceComponent.OFFENSIVE) {
      baseDamage *= 1.15; // 15% more damage in offensive stance
    }
    
    const targetStance = this.entityManager.getComponent(targetId, 'Stance');
    if (targetStance?.currentStance === StanceComponent.DEFENSIVE) {
      baseDamage *= 0.85; // 15% less damage taken in defensive stance
    }
    
    // Apply status effect modifiers
    const attackerStatus = this.entityManager.getComponent(attackerId, 'StatusEffect');
    if (attackerStatus?.hasEffect('Focus')) {
      baseDamage += 1; // +1 damage from Focus
      attackerStatus.removeEffect('Focus'); // Focus is consumed
    }
    
    return Math.floor(baseDamage);
  }
  
  applyStatusEffects(moveType, targetId) {
    const targetStatus = this.entityManager.getComponent(targetId, 'StatusEffect');
    if (!targetStatus) return;
    
    // Apply effects based on move type
    switch (moveType) {
      case '_': // Sweep Kick
        targetStatus.addEffect('Prone', 1); // Until recovered with Jump
        const targetStance = this.entityManager.getComponent(targetId, 'Stance');
        if (targetStance) {
          targetStance.currentStance = StanceComponent.PRONE;
        }
        break;
      case '*': // Ninja Star
        if (Math.random() < 0.3) { // 30% chance
          targetStatus.addEffect('Bleeding', 2);
        }
        break;
      case '!': // Power Strike
        if (Math.random() < 0.2) { // 20% chance
          targetStatus.addEffect('Stunned', 1);
        }
        break;
    }
  }
}

export default CombatSystem;