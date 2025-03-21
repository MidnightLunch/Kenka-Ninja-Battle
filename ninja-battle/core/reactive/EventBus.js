// core/reactive/EventBus.js
class EventBus {
  constructor() {
    this.subscribers = new Map();
  }
  
  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    
    this.subscribers.get(eventType).push(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  publish(event) {
    const { type } = event;
    
    if (!this.subscribers.has(type)) {
      return; // No subscribers for this event type
    }
    
    for (const callback of this.subscribers.get(type)) {
      callback(event);
    }
  }
}

export default EventBus;