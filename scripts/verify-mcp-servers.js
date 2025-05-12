#!/usr/bin/env node

/**
 * Script to verify MCP servers
 * 
 * This script checks if all MCP servers are running and accessible.
 */

const http = require('http');
const https = require('https');

// Configuration
const MCP_SERVERS = [
  {
    name: 'Context7',
    url: 'http://localhost:3002/api/health',
    expectedStatus: 200,
    expectedResponse: { status: 'ok' },
    color: '\x1b[36m' // Cyan
  },
  {
    name: 'Taskmaster',
    url: 'http://localhost:3003/api/health',
    expectedStatus: 200,
    expectedResponse: { status: 'ok' },
    color: '\x1b[35m' // Magenta
  },
  {
    name: 'MagicUI',
    url: 'http://localhost:3004/api/health',
    expectedStatus: 200,
    expectedResponse: { status: 'ok' },
    color: '\x1b[32m' // Green
  },
  {
    name: 'Memory',
    url: 'http://localhost:3005/api/health',
    expectedStatus: 200,
    expectedResponse: { status: 'ok' },
    color: '\x1b[33m' // Yellow
  },
  {
    name: 'Knowledge',
    url: 'http://localhost:3006/api/health',
    expectedStatus: 200,
    expectedResponse: { status: 'ok' },
    color: '\x1b[34m' // Blue
  },
  {
    name: 'GitHub MCP',
    url: 'http://localhost:3007/api/health',
    expectedStatus: 200,
    expectedResponse: { status: 'ok' },
    color: '\x1b[31m' // Red
  }
];

// Reset color code
const RESET_COLOR = '\x1b[0m';

// Function to make an HTTP request
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.abort();
      reject(new Error('Request timed out'));
    });
  });
}

// Function to verify a server
async function verifyServer(server) {
  console.log(`${server.color}[${server.name}]${RESET_COLOR} Verifying...`);
  
  try {
    const response = await makeRequest(server.url);
    
    if (response.status === server.expectedStatus) {
      if (server.expectedResponse) {
        // Check if the response contains the expected properties
        const allPropertiesMatch = Object.entries(server.expectedResponse).every(([key, value]) => {
          return response.data[key] === value;
        });
        
        if (allPropertiesMatch) {
          console.log(`${server.color}[${server.name}]${RESET_COLOR} ✅ Healthy`);
          return true;
        } else {
          console.log(`${server.color}[${server.name}]${RESET_COLOR} ❌ Unexpected response: ${JSON.stringify(response.data)}`);
          return false;
        }
      } else {
        console.log(`${server.color}[${server.name}]${RESET_COLOR} ✅ Healthy`);
        return true;
      }
    } else {
      console.log(`${server.color}[${server.name}]${RESET_COLOR} ❌ Unexpected status code: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`${server.color}[${server.name}]${RESET_COLOR} ❌ Error: ${error.message}`);
    return false;
  }
}

// Function to verify all servers
async function verifyAllServers() {
  console.log('Verifying MCP servers...\n');
  
  const results = [];
  
  for (const server of MCP_SERVERS) {
    const isHealthy = await verifyServer(server);
    results.push({ server, isHealthy });
  }
  
  console.log('\nVerification summary:');
  
  const healthyServers = results.filter(result => result.isHealthy);
  const unhealthyServers = results.filter(result => !result.isHealthy);
  
  console.log(`✅ Healthy: ${healthyServers.length}/${MCP_SERVERS.length}`);
  console.log(`❌ Unhealthy: ${unhealthyServers.length}/${MCP_SERVERS.length}`);
  
  if (unhealthyServers.length > 0) {
    console.log('\nUnhealthy servers:');
    unhealthyServers.forEach(result => {
      console.log(`  ${result.server.color}${result.server.name}${RESET_COLOR}`);
    });
    
    process.exit(1);
  } else {
    console.log('\nAll MCP servers are healthy!');
    process.exit(0);
  }
}

// Verify all servers
verifyAllServers().catch(error => {
  console.error('Error verifying MCP servers:', error);
  process.exit(1);
});
