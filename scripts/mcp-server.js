#!/usr/bin/env node

/**
 * Enhanced MCP Server
 * 
 * This script starts a specific MCP server with exponential enhancements:
 * - OpenRouter integration for AI capabilities
 * - Enhanced error handling and logging
 * - Better port management
 * - Development-optimized features
 * - Colored output and status indicators
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(chalk.green('✓ Loaded environment variables from .env.local'));
} else {
  console.warn(chalk.yellow('⚠ Warning: .env.local file not found. Using default values.'));
}

// Get the server name from command line arguments
const serverName = process.argv[2];
if (!serverName) {
  console.error(chalk.red('✗ Error: Server name is required. Usage: node mcp-server.js <server-name>'));
  process.exit(1);
}

// Enhanced MCP Server configurations with OpenRouter integration
const mcpServers = {
  'heroku-mcp': {
    name: 'Heroku-MCP',
    port: parseInt(process.env.HEROKU_MCP_PORT) || 3001,
    enabled: process.env.ENABLE_HEROKU_MCP !== 'false',
    requiresApiKey: false,
    apiKey: process.env.HEROKU_MCP_API_KEY,
    description: 'Cloud platform for hosting applications',
    endpoints: ['/deploy', '/apps', '/logs'],
  },
  'context7': {
    name: 'Context7',
    port: parseInt(process.env.CONTEXT7_PORT) || 3002,
    enabled: process.env.ENABLE_CONTEXT7 !== 'false',
    requiresApiKey: false,
    apiKey: process.env.CONTEXT7_API_KEY,
    description: 'Context management system',
    endpoints: ['/context', '/memory', '/search'],
  },
  'taskmaster': {
    name: 'Taskmaster (Claude)',
    port: parseInt(process.env.TASKMASTER_PORT) || 3003,
    enabled: process.env.ENABLE_TASKMASTER === 'true',
    requiresApiKey: true,
    apiKey: process.env.TASKMASTER_API_KEY,
    description: 'AI-powered task management system',
    endpoints: ['/tasks', '/generate', '/analyze'],
    openRouterConfig: {
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'google/gemini-2.5-pro-exp-03-25',
      fallbackModel: process.env.OPENROUTER_FALLBACK_MODEL || 'mistralai/mistral-small-3.1-24b-instruct:free',
    },
  },
  'magicui': {
    name: 'MagicUI',
    port: parseInt(process.env.MAGICUI_PORT) || 3004,
    enabled: process.env.ENABLE_MAGICUI === 'true',
    requiresApiKey: true,
    apiKey: process.env.MAGICUI_API_KEY,
    description: 'UI component library and design system',
    endpoints: ['/components', '/themes', '/preview'],
  },
  'memory': {
    name: 'Memory',
    port: parseInt(process.env.MEMORY_PORT) || 3005,
    enabled: process.env.ENABLE_MEMORY !== 'false',
    requiresApiKey: false,
    apiKey: process.env.MEMORY_API_KEY,
    description: 'Data storage and retrieval system',
    endpoints: ['/store', '/retrieve', '/search'],
  },
  'knowledge': {
    name: 'Knowledge',
    port: parseInt(process.env.KNOWLEDGE_PORT) || 3006,
    enabled: process.env.ENABLE_KNOWLEDGE !== 'false',
    requiresApiKey: false,
    apiKey: process.env.KNOWLEDGE_API_KEY,
    description: 'Knowledge base and information management system',
    endpoints: ['/query', '/index', '/learn'],
  },
  'github-mcp': {
    name: 'GitHub MCP',
    port: parseInt(process.env.GITHUB_MCP_PORT) || 3007,
    enabled: process.env.ENABLE_GITHUB_MCP === 'true',
    requiresApiKey: true,
    apiKey: process.env.GITHUB_MCP_API_KEY,
    description: 'GitHub integration and CI/CD management',
    endpoints: ['/repos', '/workflows', '/issues'],
  },
};

// Get the server configuration
const serverConfig = mcpServers[serverName];
if (!serverConfig) {
  console.error(chalk.red(`✗ Error: Unknown server name '${serverName}'. Available servers: ${Object.keys(mcpServers).join(', ')}`));
  process.exit(1);
}

// Check if the server is enabled
if (!serverConfig.enabled) {
  console.warn(chalk.yellow(`⚠ Warning: ${serverConfig.name} is disabled in configuration. Starting anyway for development.`));
}

// Check if API key is required but not provided
if (serverConfig.requiresApiKey && !serverConfig.apiKey) {
  console.warn(chalk.yellow(`⚠ Warning: ${serverConfig.name} requires an API key, but none is provided.`));
}

// OpenRouter integration for AI capabilities
async function callOpenRouter(prompt, model = null) {
  if (!serverConfig.openRouterConfig?.apiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const openRouterApiKey = serverConfig.openRouterConfig.apiKey;
  const selectedModel = model || serverConfig.openRouterConfig.defaultModel;
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Sunday School Transformation',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response from AI';
  } catch (error) {
    console.error(chalk.red(`OpenRouter API error: ${error.message}`));
    
    // Try fallback model if available
    if (selectedModel !== serverConfig.openRouterConfig.fallbackModel) {
      console.log(chalk.yellow(`Trying fallback model: ${serverConfig.openRouterConfig.fallbackModel}`));
      return callOpenRouter(prompt, serverConfig.openRouterConfig.fallbackModel);
    }
    
    throw error;
  }
}

// Enhanced logging function
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}] [${serverConfig.name}]`;
  
  switch (type) {
    case 'success':
      console.log(chalk.green(`${prefix} ✓ ${message}`));
      break;
    case 'error':
      console.log(chalk.red(`${prefix} ✗ ${message}`));
      break;
    case 'warning':
      console.log(chalk.yellow(`${prefix} ⚠ ${message}`));
      break;
    case 'info':
      console.log(chalk.blue(`${prefix} ℹ ${message}`));
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

// Create an enhanced HTTP server
const server = http.createServer(async (req, res) => {
  // Add CORS headers for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Log incoming requests
  log(`${req.method} ${req.url}`, 'info');
  
  // Handle health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      server: serverConfig.name,
      port: serverConfig.port,
      description: serverConfig.description,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }));
    return;
  }
  
  // Handle AI endpoints for servers with OpenRouter integration
  if (req.url.startsWith('/api/ai/') && serverConfig.openRouterConfig) {
    try {
      // Check for API key if required
      if (serverConfig.requiresApiKey) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.substring(7) !== serverConfig.apiKey) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Unauthorized. Invalid or missing API key.' }));
          return;
        }
      }
      
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { prompt, model } = JSON.parse(body);
            if (!prompt) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Prompt is required' }));
              return;
            }
            
            const aiResponse = await callOpenRouter(prompt, model);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'success',
              server: serverConfig.name,
              response: aiResponse,
              model: model || serverConfig.openRouterConfig.defaultModel,
            }));
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
          }
        });
        return;
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
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
      description: serverConfig.description,
      availableEndpoints: serverConfig.endpoints,
      openRouterAvailable: !!serverConfig.openRouterConfig,
    }));
    return;
  }
  
  // Handle root endpoint with enhanced UI
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${serverConfig.name} Server</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              max-width: 900px; 
              margin: 0 auto; 
              padding: 20px; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #333;
              min-height: 100vh;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 30px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            h1 { 
              color: #4a5568; 
              margin-bottom: 10px;
              font-size: 2.5em;
            }
            .description {
              color: #718096;
              font-size: 1.1em;
              margin-bottom: 30px;
            }
            .status { 
              padding: 20px; 
              background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
              border-radius: 8px;
              color: white;
              margin-bottom: 30px;
            }
            .endpoints { 
              margin-top: 30px; 
            }
            .endpoint { 
              margin-bottom: 15px; 
              padding: 15px; 
              background: #f7fafc; 
              border-radius: 8px;
              border-left: 4px solid #4299e1;
            }
            .method { 
              font-weight: bold; 
              display: inline-block; 
              width: 80px;
              color: #2b6cb0;
            }
            .ai-section {
              background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 0.8em;
              font-weight: bold;
              margin-left: 10px;
            }
            .badge.success { background: #48bb78; color: white; }
            .badge.warning { background: #ed8936; color: white; }
            .badge.error { background: #f56565; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${serverConfig.name}</h1>
            <div class="description">${serverConfig.description}</div>
            
            <div class="status">
              <p><strong>Status:</strong> Running <span class="badge success">✓</span></p>
              <p><strong>Port:</strong> ${serverConfig.port}</p>
              <p><strong>API Key Required:</strong> ${serverConfig.requiresApiKey ? 'Yes' : 'No'} 
                <span class="badge ${serverConfig.requiresApiKey && serverConfig.apiKey ? 'success' : serverConfig.requiresApiKey ? 'error' : 'warning'}">
                  ${serverConfig.requiresApiKey && serverConfig.apiKey ? '✓ Configured' : serverConfig.requiresApiKey ? '✗ Missing' : 'Not Required'}
                </span>
              </p>
              ${serverConfig.openRouterConfig ? `
                <p><strong>OpenRouter AI:</strong> Available 
                  <span class="badge ${serverConfig.openRouterConfig.apiKey ? 'success' : 'error'}">
                    ${serverConfig.openRouterConfig.apiKey ? '✓ Configured' : '✗ Missing API Key'}
                  </span>
                </p>
              ` : ''}
            </div>
            
            ${serverConfig.openRouterConfig ? `
              <div class="ai-section">
                <h3>🤖 AI Capabilities</h3>
                <p>This server has OpenRouter AI integration for enhanced functionality.</p>
                <p><strong>Default Model:</strong> ${serverConfig.openRouterConfig.defaultModel}</p>
                <p><strong>Fallback Model:</strong> ${serverConfig.openRouterConfig.fallbackModel}</p>
                <p><strong>AI Endpoint:</strong> POST /api/ai/chat</p>
              </div>
            ` : ''}
            
            <div class="endpoints">
              <h2>Available Endpoints:</h2>
              <div class="endpoint">
                <div><span class="method">GET</span> /health</div>
                <div>Health check endpoint</div>
              </div>
              <div class="endpoint">
                <div><span class="method">GET</span> /api/status</div>
                <div>Get server status and capabilities</div>
              </div>
              ${serverConfig.openRouterConfig ? `
                <div class="endpoint">
                  <div><span class="method">POST</span> /api/ai/chat</div>
                  <div>AI chat endpoint (requires prompt in JSON body)</div>
                </div>
              ` : ''}
              ${serverConfig.endpoints.map(endpoint => `
                <div class="endpoint">
                  <div><span class="method">GET</span> ${endpoint}</div>
                  <div>${endpoint.charAt(1).toUpperCase() + endpoint.slice(2)} functionality</div>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
      </html>
    `);
    return;
  }
  
  // Handle 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found', server: serverConfig.name }));
});

// Enhanced server startup with better error handling
server.listen(serverConfig.port, () => {
  log(`Server is running on port ${serverConfig.port}`, 'success');
  log(`Server URL: http://localhost:${serverConfig.port}`, 'info');
  log(`Health check: http://localhost:${serverConfig.port}/health`, 'info');
  log(`API endpoint: http://localhost:${serverConfig.port}/api/status`, 'info');
  log(`API key required: ${serverConfig.requiresApiKey ? 'Yes' : 'No'}`, 'info');
  
  if (serverConfig.requiresApiKey) {
    if (serverConfig.apiKey) {
      log('API key is configured', 'success');
    } else {
      log('Warning: API key is required but not configured', 'warning');
    }
  }
  
  if (serverConfig.openRouterConfig) {
    if (serverConfig.openRouterConfig.apiKey) {
      log('OpenRouter AI integration is configured', 'success');
      log(`Default model: ${serverConfig.openRouterConfig.defaultModel}`, 'info');
      log(`Fallback model: ${serverConfig.openRouterConfig.fallbackModel}`, 'info');
    } else {
      log('Warning: OpenRouter API key is not configured', 'warning');
    }
  }
  
  log('Press Ctrl+C to stop the server', 'info');
});

// Enhanced error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    log(`Port ${serverConfig.port} is already in use. Please try a different port.`, 'error');
  } else {
    log(`Server error: ${error.message}`, 'error');
  }
  process.exit(1);
});

// Enhanced process termination
process.on('SIGINT', () => {
  log('Stopping server...', 'info');
  server.close(() => {
    log('Server stopped gracefully', 'success');
    process.exit(0);
  });
  
  // Force exit after 5 seconds
  setTimeout(() => {
    log('Force stopping server...', 'warning');
    process.exit(1);
  }, 5000);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, stopping server...', 'info');
  server.close(() => {
    log('Server stopped', 'success');
    process.exit(0);
  });
}); 