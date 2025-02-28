/**
 * Flow.js - Core class of the Flow Framework
 * Manages application lifecycle and event system
 */
class Flow {
  constructor(options = {}) {
    this.options = options;
    this.engines = new Map();
    this.services = null;
    this.config = null;
    this.eventListeners = new Map();
    this.initialized = false;
    this.started = false;
  }

  /**
   * Initialize the Flow instance and all registered engines
   */
  async init() {
    if (this.initialized) {
      return this;
    }

    // Load configuration if provided
    if (this.options.config) {
      this.config = this.options.config;
    }

    // Create service manager if not provided
    if (!this.services && this.options.serviceManager) {
      this.services = this.options.serviceManager;
    }

    // Emit before init event
    this.emit('flow.before_init', { flow: this });

    // Initialize all engines
    for (const [name, engine] of this.engines.entries()) {
      await engine.init();
    }

    this.initialized = true;
    
    // Emit after init event
    this.emit('flow.after_init', { flow: this });
    
    return this;
  }

  /**
   * Start all registered engines
   */
  async start() {
    if (!this.initialized) {
      await this.init();
    }

    if (this.started) {
      return this;
    }

    // Emit before start event
    this.emit('flow.before_start', { flow: this });

    // Start all engines
    for (const [name, engine] of this.engines.entries()) {
      await engine.start();
    }

    this.started = true;
    
    // Emit after start event
    this.emit('flow.after_start', { flow: this });
    
    return this;
  }

  /**
   * Stop all registered engines
   */
  async stop() {
    if (!this.started) {
      return this;
    }

    // Emit before stop event
    this.emit('flow.before_stop', { flow: this });

    // Stop all engines in reverse order
    const engineEntries = [...this.engines.entries()].reverse();
    for (const [name, engine] of engineEntries) {
      await engine.stop();
    }

    this.started = false;
    
    // Emit after stop event
    this.emit('flow.after_stop', { flow: this });
    
    return this;
  }

  /**
   * Register an engine with the Flow instance
   */
  registerEngine(name, engine) {
    if (this.engines.has(name)) {
      throw new Error(`Engine with name "${name}" is already registered`);
    }
    
    engine.setFlow(this);
    this.engines.set(name, engine);
    
    return this;
  }

  /**
   * Get a registered engine by name
   */
  getEngine(name) {
    if (!this.engines.has(name)) {
      throw new Error(`Engine with name "${name}" is not registered`);
    }
    
    return this.engines.get(name);
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
    if (!this.eventListeners.has(event)) {
      return this;
    }
    
    for (const listener of this.eventListeners.get(event)) {
      listener(data);
    }
    
    return this;
  }
}

module.exports = Flow;
