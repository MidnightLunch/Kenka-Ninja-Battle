// core/rules/RuleRepository.js
class RuleRepository {
  constructor() {
    this.rules = [];
    this.initializeRules();
  }
  
  initializeRules() {
    // Attack moves basic rules
    this.addLeftSwipeRules();
    this.addRightSwipeRules();
    this.addVerticalStrikeRules();
    this.addSweepKickRules();
    
    // Defense rules
    this.addBlockRules();
    
    // Movement rules
    this.addJumpRules();
    this.addForwardDashRules();
    this.addBackwardLeapRules();
    
    // Special move rules
    this.addNinjaStarRules();
    this.addPowerStrikeRules();
    this.addFocusRules();
    
    // Combo rules
    this.addTripRushRules();
    this.addScissorSweepRules();
    this.addDescendingCraneRules();
  }
  
  addRule(rule) {
    this.rules.push(rule);
  }
  
  getRules() {
    return this.rules;
  }
  
  // Left Swipe rules
  addLeftSwipeRules() {
    // Base Left Swipe rule
    this.addRule({
      id: 'left_swipe_base',
      conditions: [
        { type: 'MoveExecution', move: '\\', player: 'P1' },
        { type: 'Distance', value: 'Close' }
      ],
      actions: [
        { type: 'ApplyDamage', target: 'P2', value: 1 }
      ],
      priority: 100
    });
    
    // Left Swipe against Prone
    this.addRule({
      id: 'left_swipe_vs_prone',
      conditions: [
        { type: 'MoveExecution', move: '\\', player: 'P1' },
        { type: 'Distance', value: 'Close' },
        { type: 'PlayerState', player: 'P2', state: 'Prone' }
      ],
      actions: [
        { type: 'ApplyDamage', target: 'P2', value: 2 } // Extra damage vs prone
      ],
      priority: 110 // Higher priority than base
    });
    
    // Left Swipe blocked
    this.addRule({
      id: 'left_swipe_blocked',
      conditions: [
        { type: 'MoveExecution', move: '\\', player: 'P1' },
        { type: 'MoveExecution', move: '0', player: 'P2' }
      ],
      actions: [
        { type: 'NegateEffect', source: 'P1' }
      ],
      priority: 120 // Higher priority than damage
    });
    
    // Left Swipe evaded by Jump
    this.addRule({
      id: 'left_swipe_vs_jump',
      conditions: [
        { type: 'MoveExecution', move: '\\', player: 'P1' },
        { type: 'MoveExecution', move: '^', player: 'P2' }
      ],
      actions: [
        { type: 'NegateEffect', source: 'P1' }
      ],
      priority: 120 // Same priority as block
    });
  }
  
  // Add other move rules similarly...
  addRightSwipeRules() {
    // Similar to left swipe rules
    this.addRule({
      id: 'right_swipe_base',
      conditions: [
        { type: 'MoveExecution', move: '/', player: 'P1' },
        { type: 'Distance', value: 'Close' }
      ],
      actions: [
        { type: 'ApplyDamage', target: 'P2', value: 1 }
      ],
      priority: 100
    });
    
    // Add more right swipe rules...
  }
  
  addVerticalStrikeRules() {
    this.addRule({
      id: 'vertical_strike_base',
      conditions: [
        { type: 'MoveExecution', move: '|', player: 'P1' },
        { type: 'Distance', value: 'Close' }
      ],
      actions: [
        { type: 'ApplyDamage', target: 'P2', value: 2 }
      ],
      priority: 100
    });
    
    // Medium range vertical strike
    this.addRule({
      id: 'vertical_strike_medium',
      conditions: [
        { type: 'MoveExecution', move: '|', player: 'P1' },
        { type: 'Distance', value: 'Medium' }
      ],
      actions: [
        { type: 'ApplyDamage', target: 'P2', value: 2 }
      ],
      priority: 100
    });
    
    // Vertical strike blocked
    this.addRule({
      id: 'vertical_strike_blocked',
      conditions: [
        { type: 'MoveExecution', move: '|', player: 'P1' },
        { type: 'MoveExecution', move: '0', player: 'P2' }
      ],
      actions: [
        { type: 'NegateEffect', source: 'P1' }
      ],
      priority: 120
    });
  }
  
  addSweepKickRules() {
    this.addRule({
      id: 'sweep_kick_base',
      conditions: [
        { type: 'MoveExecution', move: '_', player: 'P1' },
        { type: 'Distance', value: 'Close' }
      ],
      actions: [
        { type: 'ApplyDamage', target: 'P2', value: 1 },
        { type: 'ApplyStatus', target: 'P2', status: 'Prone', duration: 1 },
        { type: 'ChangeStance', target: 'P2', stance: 'Prone' }
      ],
      priority: 100
    });
    
    // Sweep kick evaded by Jump
    this.addRule({
      id: 'sweep_kick_vs_jump',
      conditions: [
        { type: 'MoveExecution', move: '_', player: 'P1' },
        { type: 'MoveExecution', move: '^', player: 'P2' }
      ],
      actions: [
        { type: 'NegateEffect', source: 'P1' }
      ],
      priority: 120
    });
  }
  
  // Let's add one combo rule as an example
  addTripRushRules() {
    this.addRule({
      id: 'trip_rush_combo',
      conditions: [
        { type: 'MoveExecution', move: '>', player: 'P1' },
        { type: 'MoveExecution', move: '_', player: 'P1' },
        { type: 'Distance', value: 'Medium' } // Starting distance
      ],
      actions: [
        { type: 'ChangeDistance', value: 'Close' }, // First move effect
        { type: 'ApplyDamage', target: 'P2', value: 2 }, // Enhanced damage
        { type: 'ApplyStatus', target: 'P2', status: 'Prone', duration: 1 },
        { type: 'ChangeStance', target: 'P2', stance: 'Prone' }
      ],
      priority: 150 // Higher priority than individual move rules
    });
  }
  
  // Add other rules for combinations and special moves...
}

export default RuleRepository;