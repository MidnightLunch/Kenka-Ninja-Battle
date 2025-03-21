// core/rules/RuleEngine.js
class RuleEngine {
  constructor() {
    this.rules = [];
  }
  
  addRule(rule) {
    this.rules.push(rule);
  }
  
  evaluateRules(context) {
    const matchedRules = [];
    
    for (const rule of this.rules) {
      if (this.matchesConditions(rule.conditions, context)) {
        matchedRules.push(rule);
      }
    }
    
    // Sort by priority
    matchedRules.sort((a, b) => b.priority - a.priority);
    
    return matchedRules;
  }
  
  executeActions(matchedRules, context) {
    const results = [];
    
    for (const rule of matchedRules) {
      const result = this.executeRule(rule, context);
      results.push(result);
    }
    
    return results;
  }
  
  matchesConditions(conditions, context) {
    for (const condition of conditions) {
      if (!this.matchesCondition(condition, context)) {
        return false;
      }
    }
    
    return true;
  }
  
  matchesCondition(condition, context) {
    switch (condition.type) {
      case 'MoveExecution':
        return this.matchesMoveExecution(condition, context);
      case 'PlayerState':
        return this.matchesPlayerState(condition, context);
      case 'ResourceLevel':
        return this.matchesResourceLevel(condition, context);
      case 'Distance':
        return this.matchesDistance(condition, context);
      case 'StatusEffect':
        return this.matchesStatusEffect(condition, context);
      default:
        return false;
    }
  }
  
  matchesMoveExecution(condition, context) {
    const playerMoves = context.playerMoves.get(condition.player);
    if (!playerMoves) return false;
    
    return playerMoves.includes(condition.move);
  }
  
  matchesPlayerState(condition, context) {
    const player = context.getPlayer(condition.player);
    if (!player) return false;
    
    return player.stance === condition.state;
  }
  
  matchesResourceLevel(condition, context) {
    const player = context.getPlayer(condition.player);
    if (!player) return false;
    
    const resource = player.resources[condition.resource];
    if (!resource) return false;
    
    switch (condition.operator) {
      case '=':
        return resource.current === condition.value;
      case '>':
        return resource.current > condition.value;
      case '<':
        return resource.current < condition.value;
      case '>=':
        return resource.current >= condition.value;
      case '<=':
        return resource.current <= condition.value;
      default:
        return false;
    }
  }
  
  matchesDistance(condition, context) {
    return context.distance === condition.value;
  }
  
  matchesStatusEffect(condition, context) {
    const player = context.getPlayer(condition.player);
    if (!player) return false;
    
    return player.statusEffects.some(effect => effect.type === condition.effect);
  }
  
  executeRule(rule, context) {
    const result = {
      rule: rule.id,
      actions: []
    };
    
    for (const action of rule.actions) {
      const actionResult = this.executeAction(action, context);
      result.actions.push(actionResult);
    }
    
    return result;
  }
  
  executeAction(action, context) {
    switch (action.type) {
      case 'ApplyDamage':
        return this.applyDamage(action, context);
      case 'ApplyStatus':
        return this.applyStatus(action, context);
      case 'ChangeStance':
        return this.changeStance(action, context);
      case 'ChangeDistance':
        return this.changeDistance(action, context);
      case 'ModifyResource':
        return this.modifyResource(action, context);
      case 'NegateEffect':
        return this.negateEffect(action, context);
      default:
        return { success: false, message: `Unknown action type: ${action.type}` };
    }
  }
  
  applyDamage(action, context) {
    const target = context.getPlayer(action.target);
    if (!target) {
      return { success: false, message: 'Target not found' };
    }
    
    const damage = action.value;
    target.health.current -= damage;
    
    return {
      success: true,
      type: 'DamageApplied',
      target: action.target,
      value: damage
    };
  }
  
  applyStatus(action, context) {
    const target = context.getPlayer(action.target);
    if (!target) {
      return { success: false, message: 'Target not found' };
    }
    
    // Find existing effect or add new one
    const existingEffectIndex = target.statusEffects.findIndex(
      effect => effect.type === action.status
    );
    
    if (existingEffectIndex >= 0) {
      target.statusEffects[existingEffectIndex].duration = action.duration;
      target.statusEffects[existingEffectIndex].intensity = action.intensity || 1;
    } else {
      target.statusEffects.push({
        type: action.status,
        duration: action.duration,
        intensity: action.intensity || 1
      });
    }
    
    return {
      success: true,
      type: 'StatusApplied',
      target: action.target,
      status: action.status,
      duration: action.duration
    };
  }
  
  changeStance(action, context) {
    const target = context.getPlayer(action.target);
    if (!target) {
      return { success: false, message: 'Target not found' };
    }
    
    target.stance = action.stance;
    
    return {
      success: true,
      type: 'StanceChanged',
      target: action.target,
      stance: action.stance
    };
  }
  
  changeDistance(action, context) {
    context.distance = action.value;
    
    return {
      success: true,
      type: 'DistanceChanged',
      value: action.value
    };
  }
  
  modifyResource(action, context) {
    const target = context.getPlayer(action.target);
    if (!target) {
      return { success: false, message: 'Target not found' };
    }
    
    const resource = target.resources[action.resource];
    if (!resource) {
      return { success: false, message: `Resource not found: ${action.resource}` };
    }
    
    resource.current += action.value;
    
    // Ensure within bounds
    resource.current = Math.max(0, Math.min(resource.max, resource.current));
    
    return {
      success: true,
      type: 'ResourceModified',
      target: action.target,
      resource: action.resource,
      value: action.value
    };
  }
  
  negateEffect(action, context) {
    // Find the effect in the context and negate it
    // This is a simplification - in a real implementation,
    // you'd need to track the effect and mark it as negated
    
    return {
      success: true,
      type: 'EffectNegated',
      source: action.source
    };
  }
}

export default RuleEngine;