// core/reactive/Observable.js
class Observable {
  constructor(initialValue) {
    this.value = initialValue;
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
    
    // Immediately notify with current value
    observer(this.value);
    
    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(observer);
      if (index !== -1) {
        this.observers.splice(index, 1);
      }
    };
  }
  
  setValue(newValue) {
    // Only update if value changed
    if (JSON.stringify(this.value) !== JSON.stringify(newValue)) {
      this.value = newValue;
      this.notifyObservers();
    }
  }
  
  notifyObservers() {
    for (const observer of this.observers) {
      observer(this.value);
    }
  }
}

export default Observable;