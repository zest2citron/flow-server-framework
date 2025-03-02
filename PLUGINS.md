# Flow Server Framework - Plugin System

## Overview

The Flow Server Framework uses a modular plugin system that follows the "pif paf hopla" philosophy:

- **Pif**: Auto-discovery - Plugins are automatically discovered in designated directories
- **Paf**: Auto-configuration - Plugins are automatically configured based on application settings
- **Hopla**: Auto-adaptation - Plugins adapt to different environments and configurations

## Plugin Architecture

### Directory Structure

```
{app_name}/
├── flow-server-framework/        # Core framework (Git independent)
│   └── plugins/                  # Framework plugins directory
├── flow-server-{app_name}/       # Application-specific repository
│   └── plugins/                  # Application-specific plugins
```

### Plugin Discovery Mechanism

The framework searches for plugins in multiple directories:

1. `{app_name}/flow-server-framework/plugins/`
2. `{app_name}/flow-server-{app_name}/plugins/`

If a plugin exists in both locations, the one in `flow-server-{app_name}/plugins/` takes precedence, allowing for application-specific overrides without modifying the core framework.

## Creating Plugins

A Flow Server Framework plugin is a Node.js module that exports a factory function returning a plugin instance. The plugin instance must implement an `init` method that receives the Flow instance.

### Basic Plugin Structure

```javascript
class MyPlugin {
  constructor(options = {}) {
    this.options = {
      // Default options
      ...options
    };
    this.flow = null;
  }

  init(flow) {
    this.flow = flow;
    
    // Register with service manager if needed
    if (flow.services && !flow.services.has('myPlugin')) {
      flow.services.set('myPlugin', this);
    }
    
    // Plugin initialization logic
    
    return this;
  }
}

module.exports = function createMyPlugin(options = {}) {
  return new MyPlugin(options);
};
```

### Plugin Lifecycle

1. **Discovery**: The framework discovers plugins in the designated directories
2. **Loading**: Plugins are loaded and their factory functions are called
3. **Initialization**: The `init` method of each plugin is called with the Flow instance
4. **Registration**: Plugins can register themselves with the service manager
5. **Configuration**: Plugins can be configured via the Flow configuration
6. **Execution**: Plugins perform their functionality during the application lifecycle

## Plugin Configuration

Plugins can be configured in the Flow configuration:

```javascript
const flow = createFlow({
  config: {
    plugins: {
      myPlugin: {
        // Plugin-specific configuration
        option1: 'value1',
        option2: 'value2'
      }
    }
  }
});
```

## Plugin Management with CLI

The Flow Server CLI provides commands for managing plugins:

```bash
# Create a new plugin from the starter template
flow-server plugin:create myPlugin

# Install a plugin from a source repository
flow-server plugin:install myPlugin --source=/path/to/repo.git --target=framework

# Deploy a plugin from plugins-dev to the framework or application
flow-server plugin:deploy myPlugin --target=framework|app_name

# List all available plugins
flow-server plugin:list
```

## Best Practices

1. **Git Independence**: Keep plugins in separate Git repositories
2. **Minimal Dependencies**: Minimize external dependencies
3. **Clear Documentation**: Document plugin functionality and configuration options
4. **Consistent Naming**: Use the `flow-server-plugin-{name}` naming convention
5. **Error Handling**: Implement robust error handling
6. **Testing**: Include tests for your plugin
7. **Examples**: Provide example usage

## Example Plugins

- **RouterClassMethod**: Provides dynamic routing for class-based service methods
- **TestPlugin**: A simple test plugin demonstrating the plugin system
