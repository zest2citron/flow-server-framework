/**
 * Engine.js - Abstract base class for all engines
 * Provides common interface and lifecycle methods
 */
class Engine {
  constructor(options = {}) {
    this.options = options;
    this.flow = null;
    this.initialized = false;
    this.started = false;
    this.eventListeners = new Map();
  }

  /**
   * Set the Flow instance this engine belongs to
   */
  setFlow(flow) {
    this.flow = flow;
    return this;
  }

  /**
   * Initialize the engine
   */
  async init() {
    if (this.initialized) {
      return this;
    }

    // Emit before init event
    this.emit('engine.before_init', { engine: this });
    
    // Perform initialization logic (to be implemented by subclasses)
    await this._init();
    
    this.initialized = true;
    
    // Emit after init event
    this.emit('engine.after_init', { engine: this });
    
    return this;
  }

  /**
   * Start the engine
   */
  async start() {
    if (!this.initialized) {
      await this.init();
    }

    if (this.started) {
      return this;
    }

    // Emit before start event
    this.emit('engine.before_start', { engine: this });
    
    // Perform start logic (to be implemented by subclasses)
    await this._start();
    
    this.started = true;
    
    // Emit after start event
    this.emit('engine.after_start', { engine: this });
    
    return this;
  }

  /**
   * Stop the engine
   */
  async stop() {
    if (!this.started) {
      return this;
    }

    // Emit before stop event
    this.emit('engine.before_stop', { engine: this });
    
    // Perform stop logic (to be implemented by subclasses)
    await this._stop();
    
    this.started = false;
    
    // Emit after stop event
    this.emit('engine.after_stop', { engine: this });
    
    return this;
  }

  /**
   * Add an event listener
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event).push(listener);
    
    return this;
  }

  /**
   * Emit an event
   */
  emit(event, data = {}) {
    // Emit on engine
    if (this.eventListeners.has(event)) {
      for (const listener of this.eventListeners.get(event)) {
        listener(data);
      }
    }
    
    // Propagate to flow if available
    if (this.flow) {
      this.flow.emit(`engine.${event}`, { ...data, engine: this });
    }
    
    return this;
  }

  /**
   * Abstract method to be implemented by subclasses
   */
  async _init() {
    throw new Error('_init() method must be implemented by subclass');
  }

  /**
   * Abstract method to be implemented by subclasses
   */
  async _start() {
    throw new Error('_start() method must be implemented by subclass');
  }

  /**
   * Abstract method to be implemented by subclasses
   */
  async _stop() {
    throw new Error('_stop() method must be implemented by subclass');
  }
}

module.exports = Engine;
