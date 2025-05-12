#!/usr/bin/env node

/**
 * MCP Servers Startup Script
 * 
 * This script starts all MCP servers efficiently in parallel.
 * It checks for port availability before starting each server and provides
 * real-time status updates.
 */

const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn(chalk.yellow('Warning: .env.local file not found. Using default values.'));
}

// MCP Server configurations
const mcpServers = [
  {
    name: 'Heroku-MCP',
    command: 'npm',
    args: ['run', 'start:heroku-mcp'],
    port: process.env.HEROKU_MCP_PORT || 3001,
    enabled: process.env.ENABLE_HEROKU_MCP === 'true',
    process: null,
    status: 'idle',
  },
  {
    name: 'Context7',
    command: 'npm',
    args: ['run', 'start:context7'],
    port: process.env.CONTEXT7_PORT || 3002,
    enabled: process.env.ENABLE_CONTEXT7 === 'true',
    process: null,
    status: 'idle',
  },
  {
    name: 'Taskmaster (Claude)',
    command: 'npm',
    args: ['run', 'start:taskmaster'],
    port: process.env.TASKMASTER_PORT || 3003,
    enabled: process.env.ENABLE_TASKMASTER === 'true',
    process: null,
    status: 'idle',
  },
  {
    name: 'MagicUI',
    command: 'npm',
    args: ['run', 'start:magicui'],
    port: process.env.MAGICUI_PORT || 3004,
    enabled: process.env.ENABLE_MAGICUI === 'true',
    process: null,
    status: 'idle',
  },
  {
    name: 'Memory',
    command: 'npm',
    args: ['run', 'start:memory'],
    port: process.env.MEMORY_PORT || 3005,
    enabled: process.env.ENABLE_MEMORY === 'true',
    process: null,
    status: 'idle',
  },
  {
    name: 'Knowledge',
    command: 'npm',
    args: ['run', 'start:knowledge'],
    port: process.env.KNOWLEDGE_PORT || 3006,
    enabled: process.env.ENABLE_KNOWLEDGE === 'true',
    process: null,
    status: 'idle',
  },
  {
    name: 'GitHub MCP',
    command: 'npm',
    args: ['run', 'start:github-mcp'],
    port: process.env.GITHUB_MCP_PORT || 3007,
    enabled: process.env.ENABLE_GITHUB_MCP === 'true',
    process: null,
    status: 'idle',
  },
];

// Check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });
    
    server.listen(port);
  });
}

// Find an available port starting from the provided port
async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 100; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  return null;
}

// Print the current status of all servers
function printStatus() {
  console.clear();
  console.log(chalk.bold('MCP Servers Status:'));
  console.log('─'.repeat(50));
  
  mcpServers.forEach((server) => {
    let statusColor;
    let statusText = server.status;
    
    switch (server.status) {
      case 'running':
        statusColor = chalk.green;
        break;
      case 'starting':
        statusColor = chalk.yellow;
        break;
      case 'error':
        statusColor = chalk.red;
        break;
      case 'disabled':
        statusColor = chalk.gray;
        break;
      default:
        statusColor = chalk.blue;
    }
    
    const portInfo = server.actualPort 
      ? `(port: ${server.actualPort})` 
      : server.port 
        ? `(port: ${server.port})` 
        : '';
    
    console.log(`${chalk.bold(server.name)} ${portInfo}: ${statusColor(statusText)}`);
  });
  
  console.log('─'.repeat(50));
  console.log(chalk.italic('Press Ctrl+C to stop all servers'));
}

// Start a single MCP server
async function startServer(server) {
  if (!server.enabled) {
    server.status = 'disabled';
    printStatus();
    return;
  }
  
  // Check if the port is available
  const isAvailable = await isPortAvailable(server.port);
  
  if (!isAvailable) {
    console.log(chalk.yellow(`Port ${server.port} for ${server.name} is already in use. Finding an alternative port...`));
    const availablePort = await findAvailablePort(server.port + 1);
    
    if (availablePort) {
      console.log(chalk.green(`Using alternative port ${availablePort} for ${server.name}`));
      server.actualPort = availablePort;
      // Add the port to the environment variables for the child process
      process.env[`${server.name.replace(/[^A-Z0-9]/gi, '').toUpperCase()}_PORT`] = availablePort;
    } else {
      console.error(chalk.red(`Could not find an available port for ${server.name}`));
      server.status = 'error';
      printStatus();
      return;
    }
  } else {
    server.actualPort = server.port;
  }
  
  server.status = 'starting';
  printStatus();
  
  // Start the server process
  server.process = spawn(server.command, server.args, {
    stdio: 'pipe',
    env: process.env,
  });
  
  // Handle process output
  server.process.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output.includes('started') || output.includes('listening') || output.includes('ready')) {
      server.status = 'running';
      printStatus();
    }
    // Uncomment to see server output
    // console.log(`${chalk.bold(server.name)}: ${output}`);
  });
  
  server.process.stderr.on('data', (data) => {
    const output = data.toString().trim();
    // Uncomment to see server errors
    // console.error(`${chalk.bold.red(server.name)} ERROR: ${output}`);
  });
  
  server.process.on('error', (error) => {
    console.error(chalk.red(`Error starting ${server.name}: ${error.message}`));
    server.status = 'error';
    printStatus();
  });
  
  server.process.on('close', (code) => {
    if (code !== 0) {
      console.log(chalk.yellow(`${server.name} process exited with code ${code}`));
      server.status = 'stopped';
    } else {
      server.status = 'stopped';
    }
    printStatus();
  });
  
  // Set a timeout to check if the server is running
  setTimeout(() => {
    if (server.status === 'starting') {
      server.status = 'running'; // Assume it's running if we haven't detected it yet
      printStatus();
    }
  }, 5000);
}

// Start all MCP servers
async function startAllServers() {
  console.log(chalk.bold('Starting MCP Servers...'));
  
  // Start all servers in parallel
  await Promise.all(mcpServers.map(startServer));
  
  console.log(chalk.green.bold('All MCP servers started!'));
}

// Stop all MCP servers
function stopAllServers() {
  console.log(chalk.bold('Stopping MCP Servers...'));
  
  mcpServers.forEach((server) => {
    if (server.process) {
      server.process.kill();
      server.status = 'stopping';
    }
  });
  
  printStatus();
  
  // Give processes a moment to shut down gracefully
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

// Handle process termination
process.on('SIGINT', stopAllServers);
process.on('SIGTERM', stopAllServers);

// Start the servers
startAllServers().catch((error) => {
  console.error(chalk.red(`Error starting MCP servers: ${error.message}`));
  process.exit(1);
});
