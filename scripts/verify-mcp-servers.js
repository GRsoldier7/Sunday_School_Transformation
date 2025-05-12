#!/usr/bin/env node

/**
 * Verify MCP Servers
 * 
 * This script checks if all MCP servers are running correctly by making HTTP requests to their health endpoints.
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

// MCP Server configurations
const mcpServers = [
  {
    name: 'Heroku-MCP',
    port: process.env.HEROKU_MCP_PORT || 3001,
    requiresApiKey: false,
  },
  {
    name: 'Context7',
    port: process.env.CONTEXT7_PORT || 3002,
    requiresApiKey: false,
  },
  {
    name: 'Taskmaster (Claude)',
    port: process.env.TASKMASTER_PORT || 3003,
    requiresApiKey: true,
    apiKey: process.env.TASKMASTER_API_KEY,
  },
  {
    name: 'MagicUI',
    port: process.env.MAGICUI_PORT || 3004,
    requiresApiKey: true,
    apiKey: process.env.MAGICUI_API_KEY,
  },
  {
    name: 'Memory',
    port: process.env.MEMORY_PORT || 3005,
    requiresApiKey: false,
  },
  {
    name: 'Knowledge',
    port: process.env.KNOWLEDGE_PORT || 3006,
    requiresApiKey: false,
  },
  {
    name: 'GitHub MCP',
    port: process.env.GITHUB_MCP_PORT || 3007,
    requiresApiKey: true,
    apiKey: process.env.GITHUB_MCP_API_KEY,
  },
];

// Function to check if a server is running
function checkServer(server) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: server.port,
      path: '/health',
      method: 'GET',
      timeout: 2000,
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve({
              name: server.name,
              status: 'online',
              port: server.port,
              response,
            });
          } catch (error) {
            resolve({
              name: server.name,
              status: 'error',
              port: server.port,
              error: 'Invalid JSON response',
            });
          }
        } else {
          resolve({
            name: server.name,
            status: 'error',
            port: server.port,
            statusCode: res.statusCode,
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name: server.name,
        status: 'offline',
        port: server.port,
        error: error.message,
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: server.name,
        status: 'timeout',
        port: server.port,
        error: 'Request timed out',
      });
    });
    
    req.end();
  });
}

// Function to check if a server's API is working
function checkServerAPI(server) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: server.port,
      path: '/api/status',
      method: 'GET',
      timeout: 2000,
      headers: {},
    };
    
    // Add API key if required
    if (server.requiresApiKey && server.apiKey) {
      options.headers['Authorization'] = `Bearer ${server.apiKey}`;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve({
              name: server.name,
              status: 'online',
              port: server.port,
              apiStatus: 'working',
              response,
            });
          } catch (error) {
            resolve({
              name: server.name,
              status: 'online',
              port: server.port,
              apiStatus: 'error',
              error: 'Invalid JSON response',
            });
          }
        } else if (res.statusCode === 401) {
          resolve({
            name: server.name,
            status: 'online',
            port: server.port,
            apiStatus: 'unauthorized',
            statusCode: res.statusCode,
          });
        } else {
          resolve({
            name: server.name,
            status: 'online',
            port: server.port,
            apiStatus: 'error',
            statusCode: res.statusCode,
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name: server.name,
        status: 'offline',
        port: server.port,
        apiStatus: 'offline',
        error: error.message,
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: server.name,
        status: 'online',
        port: server.port,
        apiStatus: 'timeout',
        error: 'API request timed out',
      });
    });
    
    req.end();
  });
}

// Main function to verify all servers
async function verifyAllServers() {
  console.log('Verifying MCP servers...\n');
  
  // Check if servers are running
  const healthResults = await Promise.all(mcpServers.map(checkServer));
  
  // Check API endpoints for online servers
  const onlineServers = healthResults.filter(result => result.status === 'online');
  const apiResults = await Promise.all(
    onlineServers.map(result => {
      const server = mcpServers.find(s => s.name === result.name);
      return checkServerAPI(server);
    })
  );
  
  // Combine results
  const combinedResults = healthResults.map(healthResult => {
    const apiResult = apiResults.find(r => r.name === healthResult.name);
    return apiResult || healthResult;
  });
  
  // Print results
  console.log('MCP Server Status:');
  console.log('─'.repeat(80));
  console.log('| Server Name          | Status  | Port | API Status    | Notes                      |');
  console.log('|─'.repeat(40));
  
  combinedResults.forEach(result => {
    const name = result.name.padEnd(20);
    const status = result.status.padEnd(8);
    const port = result.port.toString().padEnd(5);
    const apiStatus = (result.apiStatus || 'N/A').padEnd(14);
    const notes = result.error ? `Error: ${result.error}`.substring(0, 25) : 'OK'.padEnd(25);
    
    console.log(`| ${name} | ${status} | ${port} | ${apiStatus} | ${notes} |`);
  });
  
  console.log('─'.repeat(80));
  
  // Summary
  const onlineCount = combinedResults.filter(r => r.status === 'online').length;
  const offlineCount = combinedResults.filter(r => r.status !== 'online').length;
  const apiWorkingCount = combinedResults.filter(r => r.apiStatus === 'working').length;
  
  console.log(`\nSummary: ${onlineCount} servers online, ${offlineCount} servers offline, ${apiWorkingCount} APIs working`);
  
  if (onlineCount === mcpServers.length) {
    console.log('\n✅ All MCP servers are running!');
  } else {
    console.log(`\n❌ ${offlineCount} MCP servers are not running. Please check the logs above.`);
  }
  
  return combinedResults;
}

// Run the verification
verifyAllServers().catch(error => {
  console.error('Error verifying MCP servers:', error);
  process.exit(1);
});
