/**
 * Simple HTTP server example using Flow Server Framework
 */
const { createFlow, HttpEngine } = require('../src');

// Create a new Flow instance with configuration
const flow = createFlow({
  config: {
    app: {
      name: 'Flow Example Server',
      version: '1.0.0'
    },
    http: {
      port: 3000,
      host: 'localhost'
    }
  }
});

// Create HTTP engine
const httpEngine = new HttpEngine({
  port: flow.config.get('http.port'),
  host: flow.config.get('http.host')
});

// Add middleware for request logging
httpEngine.use(async (ctx, next) => {
  const start = Date.now();
  console.log(`${ctx.method} ${ctx.path} - Request received`);
  
  // Add JSON response helper
  ctx.json = (data, status = 200) => {
    ctx.res.statusCode = status;
    ctx.res.setHeader('Content-Type', 'application/json');
    ctx.res.end(JSON.stringify(data));
  };
  
  await next();
  
  const duration = Date.now() - start;
  console.log(`${ctx.method} ${ctx.path} - Response sent in ${duration}ms`);
});

// Define routes
httpEngine.get('/', (ctx) => {
  ctx.json({
    app: flow.config.get('app.name'),
    version: flow.config.get('app.version'),
    message: 'Welcome to Flow Server Framework!',
    endpoints: [
      { path: '/', method: 'GET', description: 'This information' },
      { path: '/echo', method: 'POST', description: 'Echo back request body' },
      { path: '/config', method: 'GET', description: 'View application configuration' }
    ]
  });
});

httpEngine.get('/config', (ctx) => {
  ctx.json(flow.config.getAll());
});

httpEngine.post('/echo', (ctx) => {
  ctx.json({
    echo: ctx.body,
    headers: ctx.req.headers,
    timestamp: new Date().toISOString()
  });
});

// Register HTTP engine with Flow
flow.registerEngine('http', httpEngine);

// Add event listeners
flow.on('flow.after_start', () => {
  console.log(`Server running at http://${flow.config.get('http.host')}:${flow.config.get('http.port')}/`);
  console.log('Press Ctrl+C to stop');
});

// Start the application
flow.start()
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  
  try {
    await flow.stop();
    console.log('Server stopped gracefully');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});
