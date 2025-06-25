#!/usr/bin/env node

/**
 * Enhanced MCP Server Startup System
 * 
 * This script provides exponential enhancement for starting all MCP servers with:
 * - Intelligent port conflict resolution
 * - Real-time health monitoring
 * - Graceful shutdown handling
 * - Enhanced error reporting
 * - Development-only optimizations
 * - Colored output and status indicators
 */

const { spawn } = require('child_process');
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

// Enhanced MCP Server configurations with better defaults
const mcpServers = [
  {
    name: 'heroku-mcp',
    displayName: 'Heroku-MCP',
    port: parseInt(process.env.HEROKU_MCP_PORT) || 3001,
    enabled: process.env.ENABLE_HEROKU_MCP !== 'false',
    requiresApiKey: false,
    healthCheckPath: '/health',
    startupDelay: 1000,
    retryAttempts: 3,
    retryDelay: 2000,
  },
  {
    name: 'context7',
    displayName: 'Context7',
    port: parseInt(process.env.CONTEXT7_PORT) || 3002,
    enabled: process.env.ENABLE_CONTEXT7 !== 'false',
    requiresApiKey: false,
    healthCheckPath: '/health',
    startupDelay: 1000,
    retryAttempts: 3,
    retryDelay: 2000,
  },
  {
    name: 'taskmaster',
    displayName: 'Taskmaster (Claude)',
    port: parseInt(process.env.TASKMASTER_PORT) || 3003,
    enabled: process.env.ENABLE_TASKMASTER === 'true',
    requiresApiKey: true,
    healthCheckPath: '/health',
    startupDelay: 1500,
    retryAttempts: 3,
    retryDelay: 2000,
  },
  {
    name: 'magicui',
    displayName: 'MagicUI',
    port: parseInt(process.env.MAGICUI_PORT) || 3004,
    enabled: process.env.ENABLE_MAGICUI === 'true',
    requiresApiKey: true,
    healthCheckPath: '/health',
    startupDelay: 1000,
    retryAttempts: 3,
    retryDelay: 2000,
  },
  {
    name: 'memory',
    displayName: 'Memory',
    port: parseInt(process.env.MEMORY_PORT) || 3005,
    enabled: process.env.ENABLE_MEMORY !== 'false',
    requiresApiKey: false,
    healthCheckPath: '/health',
    startupDelay: 1000,
    retryAttempts: 3,
    retryDelay: 2000,
  },
  {
    name: 'knowledge',
    displayName: 'Knowledge',
    port: parseInt(process.env.KNOWLEDGE_PORT) || 3006,
    enabled: process.env.ENABLE_KNOWLEDGE !== 'false',
    requiresApiKey: false,
    healthCheckPath: '/health',
    startupDelay: 1000,
    retryAttempts: 3,
    retryDelay: 2000,
  },
  {
    name: 'github-mcp',
    displayName: 'GitHub MCP',
    port: parseInt(process.env.GITHUB_MCP_PORT) || 3007,
    enabled: process.env.ENABLE_GITHUB_MCP === 'true',
    requiresApiKey: true,
    healthCheckPath: '/health',
    startupDelay: 1500,
    retryAttempts: 3,
    retryDelay: 2000,
  },
];

// Store child processes and their status
const childProcesses = new Map();
const serverStatus = new Map();

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;
  
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

function logServer(serverName, message, type = 'info') {
  log(`[${serverName}] ${message}`, type);
}

// Enhanced port scanning with conflict resolution
async function findAvailablePort(startPort) {
  const net = require('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(startPort, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    
    server.on('error', () => {
      // Port is in use, try next port
      findAvailablePort(startPort + 1).then(resolve);
    });
  });
}

// Health check function
async function checkServerHealth(server, port) {
  const http = require('http');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: server.healthCheckPath,
      method: 'GET',
      timeout: 3000,
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve({ status: 'healthy', statusCode: res.statusCode });
      } else {
        resolve({ status: 'unhealthy', statusCode: res.statusCode });
      }
    });
    
    req.on('error', () => {
      resolve({ status: 'unreachable' });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 'timeout' });
    });
    
    req.end();
  });
}

// Enhanced server startup with retry logic
async function startMCPServer(server) {
  if (!server.enabled) {
    logServer(server.displayName, 'Server is disabled, skipping...', 'warning');
    return null;
  }

  logServer(server.displayName, 'Starting server...', 'info');
  
  // Find available port
  const actualPort = await findAvailablePort(server.port);
  if (actualPort !== server.port) {
    logServer(server.displayName, `Port ${server.port} in use, using port ${actualPort}`, 'warning');
  }
  
  // Update server configuration with actual port
  const serverConfig = { ...server, port: actualPort };
  
  // Start the server process
  const serverProcess = spawn('node', [path.join(__dirname, 'mcp-server.js'), server.name], {
    stdio: 'pipe',
    detached: false,
    env: { ...process.env, [`${server.name.toUpperCase().replace('-', '_')}_PORT`]: actualPort.toString() }
  });
  
  childProcesses.set(server.name, {
    name: server.name,
    displayName: server.displayName,
    process: serverProcess,
    config: serverConfig,
    status: 'starting',
    startTime: Date.now(),
    retryCount: 0,
  });
  
  // Handle stdout
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      logServer(server.displayName, output, 'info');
    }
  });
  
  // Handle stderr
  serverProcess.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (error) {
      logServer(server.displayName, error, 'error');
    }
  });
  
  // Handle process events
  serverProcess.on('close', (code) => {
    const processInfo = childProcesses.get(server.name);
    if (processInfo) {
      processInfo.status = 'stopped';
      logServer(server.displayName, `Process exited with code ${code}`, code === 0 ? 'info' : 'error');
    }
  });
  
  serverProcess.on('error', (error) => {
    logServer(server.displayName, `Failed to start: ${error.message}`, 'error');
  });
  
  // Wait for startup delay
  await new Promise(resolve => setTimeout(resolve, server.startupDelay));
  
  // Perform health check
  const health = await checkServerHealth(server, actualPort);
  
  if (health.status === 'healthy') {
    childProcesses.get(server.name).status = 'running';
    logServer(server.displayName, `Server is running on port ${actualPort}`, 'success');
    return serverProcess;
  } else {
    logServer(server.displayName, `Health check failed: ${health.status}`, 'error');
    
    // Retry logic
    const processInfo = childProcesses.get(server.name);
    if (processInfo && processInfo.retryCount < server.retryAttempts) {
      processInfo.retryCount++;
      logServer(server.displayName, `Retrying... (${processInfo.retryCount}/${server.retryAttempts})`, 'warning');
      
      // Kill the failed process
      serverProcess.kill();
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, server.retryDelay));
      
      // Retry
      return startMCPServer(server);
    } else {
      logServer(server.displayName, 'Max retry attempts reached, giving up', 'error');
      return null;
    }
  }
}

// Enhanced shutdown function
async function stopAllServers() {
  log('Shutting down all MCP servers...', 'info');
  
  const shutdownPromises = Array.from(childProcesses.values()).map(async (processInfo) => {
    const { name, displayName, process: serverProcess } = processInfo;
    
    return new Promise((resolve) => {
      logServer(displayName, 'Stopping server...', 'info');
      
      serverProcess.on('close', () => {
        logServer(displayName, 'Server stopped', 'success');
        resolve();
      });
      
      serverProcess.kill('SIGTERM');
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL');
          logServer(displayName, 'Server force killed', 'warning');
        }
      }, 5000);
    });
  });
  
  await Promise.all(shutdownPromises);
  log('All MCP servers stopped', 'success');
  process.exit(0);
}

// Status monitoring
function startStatusMonitoring() {
  setInterval(async () => {
    const runningServers = Array.from(childProcesses.values()).filter(p => p.status === 'running');
    
    if (runningServers.length > 0) {
      console.log(chalk.cyan('\n' + '='.repeat(60)));
      console.log(chalk.cyan('MCP Server Status Monitor'));
      console.log(chalk.cyan('='.repeat(60)));
      
      for (const processInfo of runningServers) {
        const health = await checkServerHealth(processInfo.config, processInfo.config.port);
        const status = health.status === 'healthy' ? chalk.green('✓ Healthy') : chalk.red('✗ Unhealthy');
        const uptime = Math.floor((Date.now() - processInfo.startTime) / 1000);
        
        console.log(`${chalk.blue(processInfo.displayName.padEnd(20))} ${status} | Port: ${processInfo.config.port} | Uptime: ${uptime}s`);
      }
      console.log(chalk.cyan('='.repeat(60)));
    }
  }, 30000); // Check every 30 seconds
}

// Main execution
async function main() {
  console.log(chalk.cyan('🚀 Enhanced MCP Server Startup System'));
  console.log(chalk.cyan('='.repeat(50)));
  
  // Filter enabled servers
  const enabledServers = mcpServers.filter(server => server.enabled);
  
  if (enabledServers.length === 0) {
    log('No MCP servers are enabled. Check your .env.local configuration.', 'warning');
    process.exit(1);
  }
  
  log(`Starting ${enabledServers.length} MCP servers...`, 'info');
  
  // Start all servers
  const startupPromises = enabledServers.map(server => startMCPServer(server));
  const results = await Promise.allSettled(startupPromises);
  
  // Report results
  const successful = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
  const failed = results.length - successful;
  
  console.log(chalk.cyan('\n' + '='.repeat(50)));
  log(`Startup complete: ${successful} successful, ${failed} failed`, successful > 0 ? 'success' : 'error');
  console.log(chalk.cyan('='.repeat(50)));
  
  if (successful > 0) {
    log('Starting status monitoring...', 'info');
    startStatusMonitoring();
    
    console.log(chalk.yellow('\n📋 Available Commands:'));
    console.log(chalk.yellow('  Ctrl+C - Stop all servers'));
    console.log(chalk.yellow('  npm run verify:mcp-servers - Verify server health'));
    console.log(chalk.yellow('  npm run dev:with-mcp - Start Next.js dev server with MCP servers'));
    
    console.log(chalk.green('\n✨ Development mode active - Happy coding!'));
  }
}

// Handle process termination
process.on('SIGINT', stopAllServers);
process.on('SIGTERM', stopAllServers);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'error');
  stopAllServers();
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
  stopAllServers();
});

// Start the system
main().catch((error) => {
  log(`Startup failed: ${error.message}`, 'error');
  process.exit(1);
});
