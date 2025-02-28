/**
 * Config.js - Configuration management system
 * Handles loading, merging and accessing configuration
 */
class Config {
  constructor(initialConfig = {}) {
    this.config = initialConfig;
  }

  /**
   * Set a configuration value
   */
  set(path, value) {
    const parts = path.split('.');
    let current = this.config;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
    
    return this;
  }

  /**
   * Get a configuration value
   */
  get(path, defaultValue = null) {
    const parts = path.split('.');
    let current = this.config;
    
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return defaultValue;
      }
      
      current = current[part];
    }
    
    return current !== undefined ? current : defaultValue;
  }

  /**
   * Check if a configuration path exists
   */
  has(path) {
    return this.get(path) !== null;
  }

  /**
   * Merge another configuration object
   */
  merge(config) {
    this.config = this._mergeObjects(this.config, config);
    return this;
  }

  /**
   * Load configuration from a file
   */
  loadFromFile(filePath) {
    try {
      const config = require(filePath);
      this.merge(config);
      return true;
    } catch (err) {
      console.error(`Failed to load config from ${filePath}:`, err);
      return false;
    }
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Helper method to deeply merge objects
   */
  _mergeObjects(target, source) {
    const output = { ...target };
    
    if (this._isObject(target) && this._isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this._isObject(source[key])) {
          if (!(key in target)) {
            output[key] = source[key];
          } else {
            output[key] = this._mergeObjects(target[key], source[key]);
          }
        } else {
          output[key] = source[key];
        }
      });
    }
    
    return output;
  }

  /**
   * Helper method to check if a value is an object
   */
  _isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

module.exports = Config;
