/**
 * Flow Framework - Minimalist version
 * Main entry point that exports all core components
 */

const Flow = require('./core/Flow');
const Engine = require('./core/Engine');
const HttpEngine = require('./core/HttpEngine');
const ServiceManager = require('./core/ServiceManager');
const Config = require('./core/Config');

module.exports = {
  Flow,
  Engine,
  HttpEngine,
  ServiceManager,
  Config,
  
  // Factory method to create a new Flow instance with common defaults
  createFlow: (options = {}) => {
    const serviceManager = new ServiceManager();
    serviceManager.init();
    
    const config = new Config(options.config || {});
    
    const flow = new Flow({
      serviceManager,
      config
    });
    
    // Register core services
    serviceManager.set('flow', flow);
    serviceManager.set('config', config);
    
    return flow;
  }
};
