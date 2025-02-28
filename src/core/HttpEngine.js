/**
 * HttpEngine.js - Basic HTTP server implementation
 * Provides routing and middleware support
 */
const http = require('http');
const url = require('url');
const Engine = require('./Engine');

class HttpEngine extends Engine {
  constructor(options = {}) {
    super(options);
    this.server = null;
    this.routes = new Map();
    this.middlewares = [];
    this.port = options.port || 3000;
    this.host = options.host || 'localhost';
  }

  /**
   * Initialize the HTTP engine
   */
  async _init() {
    // Create HTTP server
    this.server = http.createServer(this._handleRequest.bind(this));
    
    return this;
  }

  /**
   * Start the HTTP server
   */
  async _start() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, this.host, () => {
        console.log(`HTTP server listening on ${this.host}:${this.port}`);
        resolve();
      });
      
      this.server.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Stop the HTTP server
   */
  async _stop() {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }
      
      this.server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log('HTTP server stopped');
        resolve();
      });
    });
  }

  /**
   * Add a route handler
   */
  addRoute(method, path, handler) {
    const routeKey = `${method.toUpperCase()}:${path}`;
    this.routes.set(routeKey, handler);
    return this;
  }

  /**
   * Add middleware
   */
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Handle HTTP requests
   */
  async _handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const method = req.method;
    const routeKey = `${method}:${path}`;
    
    // Create context object
    const ctx = {
      req,
      res,
      path,
      method,
      query: parsedUrl.query,
      params: {},
      body: null,
      engine: this,
      flow: this.flow
    };
    
    try {
      // Parse request body if needed
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        await this._parseBody(ctx);
      }
      
      // Run middlewares
      for (const middleware of this.middlewares) {
        const result = await middleware(ctx);
        if (result === false) {
          return; // Middleware chain stopped
        }
      }
      
      // Find and execute route handler
      if (this.routes.has(routeKey)) {
        const handler = this.routes.get(routeKey);
        await handler(ctx);
      } else {
        // No route found
        ctx.res.statusCode = 404;
        ctx.res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } catch (err) {
      // Handle errors
      console.error('Request error:', err);
      ctx.res.statusCode = 500;
      ctx.res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }

  /**
   * Parse request body
   */
  async _parseBody(ctx) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      
      ctx.req.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      ctx.req.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        
        if (body) {
          try {
            const contentType = ctx.req.headers['content-type'] || '';
            
            if (contentType.includes('application/json')) {
              ctx.body = JSON.parse(body);
            } else {
              ctx.body = body;
            }
          } catch (err) {
            ctx.body = body;
          }
        }
        
        resolve();
      });
      
      ctx.req.on('error', reject);
    });
  }

  /**
   * Convenience methods for common HTTP methods
   */
  get(path, handler) {
    return this.addRoute('GET', path, handler);
  }
  
  post(path, handler) {
    return this.addRoute('POST', path, handler);
  }
  
  put(path, handler) {
    return this.addRoute('PUT', path, handler);
  }
  
  delete(path, handler) {
    return this.addRoute('DELETE', path, handler);
  }
}

module.exports = HttpEngine;
