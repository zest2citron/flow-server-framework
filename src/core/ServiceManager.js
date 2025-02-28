/**
 * ServiceManager.js - Simple dependency injection container
 * Manages service registration, retrieval and dependency resolution
 */
class ServiceManager {
  constructor(options = {}) {
    this.options = options;
    this.services = new Map();
    this.factories = new Map();
    this.aliases = new Map();
    this.tags = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the service manager
   */
  init() {
    if (this.initialized) {
      return this;
    }
    
    // Register self as a service
    this.set('serviceManager', this);
    
    this.initialized = true;
    return this;
  }

  /**
   * Register a service instance
   */
  set(name, service, tags = []) {
    if (this.services.has(name)) {
      throw new Error(`Service "${name}" is already registered`);
    }
    
    this.services.set(name, service);
    
    // Register tags if provided
    if (tags && tags.length > 0) {
      this._registerTags(name, tags);
    }
    
    return this;
  }

  /**
   * Register a service factory
   */
  setFactory(name, factory, tags = []) {
    if (this.factories.has(name) || this.services.has(name)) {
      throw new Error(`Service or factory "${name}" is already registered`);
    }
    
    this.factories.set(name, factory);
    
    // Register tags if provided
    if (tags && tags.length > 0) {
      this._registerTags(name, tags);
    }
    
    return this;
  }

  /**
   * Register a service alias
   */
  setAlias(alias, target) {
    if (this.aliases.has(alias)) {
      throw new Error(`Alias "${alias}" is already registered`);
    }
    
    this.aliases.set(alias, target);
    return this;
  }

  /**
   * Get a service by name or alias
   */
  get(name) {
    // Check if it's an alias
    if (this.aliases.has(name)) {
      return this.get(this.aliases.get(name));
    }
    
    // Return existing service if available
    if (this.services.has(name)) {
      return this.services.get(name);
    }
    
    // Create service from factory if available
    if (this.factories.has(name)) {
      const factory = this.factories.get(name);
      const service = factory(this);
      
      // Cache the created service
      this.services.set(name, service);
      
      return service;
    }
    
    throw new Error(`Service "${name}" not found`);
  }

  /**
   * Check if a service exists
   */
  has(name) {
    return this.services.has(name) || 
           this.factories.has(name) || 
           this.aliases.has(name);
  }

  /**
   * Get all services with a specific tag
   */
  getByTag(tag) {
    if (!this.tags.has(tag)) {
      return [];
    }
    
    return this.tags.get(tag).map(name => this.get(name));
  }

  /**
   * Register tags for a service
   */
  _registerTags(serviceName, tags) {
    for (const tag of tags) {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, []);
      }
      
      this.tags.get(tag).push(serviceName);
    }
  }
}

module.exports = ServiceManager;
