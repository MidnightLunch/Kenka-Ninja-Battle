// app.js
import EntityManager from './core/ecs/EntityManager.js';
import SystemManager from './core/ecs/systems/SystemManager.js';
import GameState from './core/GameState.js';
import GameManager from './core/GameManager.js';
import RuleEngine from './core/rules/RuleEngine.js';
import RuleRepository from './core/rules/RuleRepository.js';
import EventBus from './core/reactive/EventBus.js';
import GameStateObservable from './core/reactive/GameStateObservable.js';
import UIController from './ui/UIController.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Create core ECS components
  const entityManager = new EntityManager();
  const systemManager = new SystemManager(entityManager);
  const gameState = new GameState();
  const gameManager = new GameManager();
  
  // Create rule engine components
  const ruleEngine = new RuleEngine();
  const ruleRepository = new RuleRepository();
  
  // Load rules into engine
  for (const rule of ruleRepository.getRules()) {
    ruleEngine.addRule(rule);
  }
  
  // Create reactive components
  const eventBus = new EventBus();
  const gameStateObservable = new GameStateObservable(gameManager);
  
  // Create UI controller
  const uiController = new UIController(gameManager, gameStateObservable);
  
  // Subscribe to events
  eventBus.subscribe('GAME_STATE_UPDATED', () => {
    gameStateObservable.update();
  });
  
  // Log initialization
  console.log('Ninja Battle Game initialized');
});