#!/usr/bin/env node

/**
 * MCP Server
 * 
 * This script starts a specific MCP server based on the provided name.
 * It handles configuration, port management, and server startup.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('Loaded environment variables from .env.local');
} else {
  console.warn('Warning: .env.local file not found. Using default values.');
}

// Get the server name from command line arguments
const serverName = process.argv[2];
if (!serverName) {
  console.error('Error: Server name is required. Usage: node mcp-server.js <server-name>');
  process.exit(1);
}

// MCP Server configurations
const mcpServers = {
  'heroku-mcp': {
    name: 'Heroku-MCP',
    port: process.env.HEROKU_MCP_PORT || 3001,
    enabled: process.env.ENABLE_HEROKU_MCP === 'true',
    requiresApiKey: false,
    apiKey: process.env.HEROKU_MCP_API_KEY,
  },
  'context7': {
    name: 'Context7',
    port: process.env.CONTEXT7_PORT || 3002,
    enabled: process.env.ENABLE_CONTEXT7 === 'true',
    requiresApiKey: false,
    apiKey: process.env.CONTEXT7_API_KEY,
  },
  'taskmaster': {
    name: 'Taskmaster (Claude)',
    port: process.env.TASKMASTER_PORT || 3003,
    enabled: process.env.ENABLE_TASKMASTER === 'true',
    requiresApiKey: true,
    apiKey: process.env.TASKMASTER_API_KEY,
  },
  'magicui': {
    name: 'MagicUI',
    port: process.env.MAGICUI_PORT || 3004,
    enabled: process.env.ENABLE_MAGICUI === 'true',
    requiresApiKey: true,
    apiKey: process.env.MAGICUI_API_KEY,
  },
  'memory': {
    name: 'Memory',
    port: process.env.MEMORY_PORT || 3005,
    enabled: process.env.ENABLE_MEMORY === 'true',
    requiresApiKey: false,
    apiKey: process.env.MEMORY_API_KEY,
  },
  'knowledge': {
    name: 'Knowledge',
    port: process.env.KNOWLEDGE_PORT || 3006,
    enabled: process.env.ENABLE_KNOWLEDGE === 'true',
    requiresApiKey: false,
    apiKey: process.env.KNOWLEDGE_API_KEY,
  },
  'github-mcp': {
    name: 'GitHub MCP',
    port: process.env.GITHUB_MCP_PORT || 3007,
    enabled: process.env.ENABLE_GITHUB_MCP === 'true',
    requiresApiKey: true,
    apiKey: process.env.GITHUB_MCP_API_KEY,
  },
};

// Get the server configuration
const serverConfig = mcpServers[serverName];
if (!serverConfig) {
  console.error(`Error: Unknown server name '${serverName}'. Available servers: ${Object.keys(mcpServers).join(', ')}`);
  process.exit(1);
}

// Check if the server is enabled
if (!serverConfig.enabled) {
  console.warn(`Warning: ${serverConfig.name} is disabled in configuration. Starting anyway for testing.`);
}

// Check if API key is required but not provided
if (serverConfig.requiresApiKey && !serverConfig.apiKey) {
  console.warn(`Warning: ${serverConfig.name} requires an API key, but none is provided.`);
}

// Create a simple HTTP server to simulate the MCP server
const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Handle health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', server: serverConfig.name }));
    return;
  }
  
  // Handle API endpoints
  if (req.url.startsWith('/api/')) {
    // Check for API key if required
    if (serverConfig.requiresApiKey) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.substring(7) !== serverConfig.apiKey) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized. Invalid or missing API key.' }));
        return;
      }
    }
    
    // Process the API request
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      server: serverConfig.name,
      message: `${serverConfig.name} API is working!`,
      endpoint: req.url,
      method: req.method,
    }));
    return;
  }
  
  // Handle root endpoint
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${serverConfig.name} Server</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #333; }
            .status { padding: 10px; background-color: #e6f7e6; border-radius: 5px; }
            .endpoints { margin-top: 20px; }
            .endpoint { margin-bottom: 10px; padding: 10px; background-color: #f5f5f5; border-radius: 5px; }
            .method { font-weight: bold; display: inline-block; width: 60px; }
          </style>
        </head>
        <body>
          <h1>${serverConfig.name} Server</h1>
          <div class="status">
            <p><strong>Status:</strong> Running</p>
            <p><strong>Port:</strong> ${serverConfig.port}</p>
            <p><strong>API Key Required:</strong> ${serverConfig.requiresApiKey ? 'Yes' : 'No'}</p>
          </div>
          <div class="endpoints">
            <h2>Available Endpoints:</h2>
            <div class="endpoint">
              <div><span class="method">GET</span> /health</div>
              <div>Health check endpoint</div>
            </div>
            <div class="endpoint">
              <div><span class="method">GET</span> /api/status</div>
              <div>Get server status</div>
            </div>
            <div class="endpoint">
              <div><span class="method">POST</span> /api/data</div>
              <div>Submit data to the server</div>
            </div>
          </div>
        </body>
      </html>
    `);
    return;
  }
  
  // Handle 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start the server
server.listen(serverConfig.port, () => {
  console.log(`${serverConfig.name} server is running on port ${serverConfig.port}`);
  console.log(`Server URL: http://localhost:${serverConfig.port}`);
  console.log(`Health check: http://localhost:${serverConfig.port}/health`);
  console.log(`API endpoint: http://localhost:${serverConfig.port}/api/status`);
  console.log(`API key required: ${serverConfig.requiresApiKey ? 'Yes' : 'No'}`);
  
  if (serverConfig.requiresApiKey) {
    if (serverConfig.apiKey) {
      console.log('API key is configured');
    } else {
      console.warn('Warning: API key is required but not configured');
    }
  }
  
  console.log('\nPress Ctrl+C to stop the server');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\nStopping ${serverConfig.name} server...`);
  server.close(() => {
    console.log(`${serverConfig.name} server stopped`);
    process.exit(0);
  });
});
