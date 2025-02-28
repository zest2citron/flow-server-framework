# Flow Server Framework (Minimalist Version)

A lightweight, modular framework for building Node.js applications with a clean architecture.

## Features

- **Modular Design**: Core components are designed to be independent and reusable
- **Lifecycle Management**: Consistent initialization, startup, and shutdown processes
- **Service Container**: Simple dependency injection system
- **Event System**: Built-in event emission and subscription
- **HTTP Support**: Basic HTTP server with routing and middleware
- **Configuration**: Flexible configuration management

## Core Components

- **Flow**: The main application container that manages the lifecycle
- **Engine**: Abstract base class for all engines (like HTTP, WebSocket, etc.)
- **HttpEngine**: HTTP server implementation with routing and middleware
- **ServiceManager**: Dependency injection container
- **Config**: Configuration management system

## Installation

```bash
npm install flow-server-framework
```

## Quick Start

```javascript
const { createFlow, HttpEngine } = require('flow-server-framework');

// Create a new Flow instance
const flow = createFlow({
  config: {
    app: {
      name: 'My App',
      version: '1.0.0'
    },
    http: {
      port: 3000
    }
  }
});

// Create and register HTTP engine
const httpEngine = new HttpEngine({
  port: flow.config.get('http.port')
});

// Add routes
httpEngine.get('/', (ctx) => {
  ctx.res.setHeader('Content-Type', 'application/json');
  ctx.res.end(JSON.stringify({
    app: flow.config.get('app.name'),
    version: flow.config.get('app.version'),
    message: 'Hello from Flow Server Framework!'
  }));
});

// Register engine with Flow
flow.registerEngine('http', httpEngine);

// Start the application
flow.start()
  .then(() => {
    console.log('Application started successfully');
  })
  .catch((err) => {
    console.error('Failed to start application:', err);
  });
```

## Extending the Framework

Flow Server Framework is designed to be extended. You can create custom engines, services, and middleware to enhance its functionality.

### Creating a Custom Engine

```javascript
const { Engine } = require('flow-server-framework');

class MyCustomEngine extends Engine {
  async _init() {
    // Initialization logic
    console.log('Custom engine initialized');
  }

  async _start() {
    // Start logic
    console.log('Custom engine started');
  }

  async _stop() {
    // Stop logic
    console.log('Custom engine stopped');
  }
}
```

### Plugin System

Flow Server Framework includes a powerful plugin system that follows the "pif paf hopla" philosophy:

- **Pif**: Auto-discovery of plugins in designated directories
- **Paf**: Auto-configuration of plugins based on application settings
- **Hopla**: Auto-adaptation to different environments and configurations

Plugins can extend the framework's functionality without modifying its core code. For detailed information about the plugin system, see [PLUGINS.md](./PLUGINS.md).

#### Basic Plugin Example

```javascript
// flow-server-plugin-example/src/index.js
class ExamplePlugin {
  constructor(options = {}) {
    this.options = {
      greeting: 'Hello from Example Plugin!',
      ...options
    };
  }

  init(flow) {
    // Register with service manager
    flow.services.set('examplePlugin', this);
    
    // Add a route if HTTP engine is available
    const httpEngine = flow.getEngine('http');
    if (httpEngine) {
      httpEngine.get('/example', (ctx) => {
        ctx.res.setHeader('Content-Type', 'application/json');
        ctx.res.end(JSON.stringify({
          message: this.options.greeting
        }));
      });
    }
    
    return this;
  }
}

module.exports = function createExamplePlugin(options = {}) {
  return new ExamplePlugin(options);
};
```

## License

MIT
