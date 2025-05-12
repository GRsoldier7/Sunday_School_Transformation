#!/usr/bin/env node

/**
 * Script to start all MCP servers
 * 
 * This script starts all MCP servers in separate processes and monitors their status.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Configuration
const MCP_SERVERS = [
  {
    name: 'Context7',
    command: 'node',
    args: ['server.js'],
    cwd: path.join(__dirname, '../mcp-servers/context7'),
    port: 3002,
    color: '\x1b[36m', // Cyan
    ready: (output) => output.includes('Context7 server listening')
  },
  {
    name: 'Taskmaster',
    command: 'node',
    args: ['server.js'],
    cwd: path.join(__dirname, '../mcp-servers/taskmaster'),
    port: 3003,
    color: '\x1b[35m', // Magenta
    ready: (output) => output.includes('Taskmaster server listening')
  },
  {
    name: 'MagicUI',
    command: 'node',
    args: ['server.js'],
    cwd: path.join(__dirname, '../mcp-servers/magicui'),
    port: 3004,
    color: '\x1b[32m', // Green
    ready: (output) => output.includes('MagicUI server listening')
  },
  {
    name: 'Memory',
    command: 'node',
    args: ['server.js'],
    cwd: path.join(__dirname, '../mcp-servers/memory'),
    port: 3005,
    color: '\x1b[33m', // Yellow
    ready: (output) => output.includes('Memory server listening')
  },
  {
    name: 'Knowledge',
    command: 'node',
    args: ['server.js'],
    cwd: path.join(__dirname, '../mcp-servers/knowledge'),
    port: 3006,
    color: '\x1b[34m', // Blue
    ready: (output) => output.includes('Knowledge server listening')
  },
  {
    name: 'GitHub MCP',
    command: 'node',
    args: ['server.js'],
    cwd: path.join(__dirname, '../mcp-servers/github-mcp'),
    port: 3007,
    color: '\x1b[31m', // Red
    ready: (output) => output.includes('GitHub MCP server listening')
  }
];

// Reset color code
const RESET_COLOR = '\x1b[0m';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Function to check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

// Function to start a server
async function startServer(server) {
  // Check if the port is already in use
  const portInUse = await isPortInUse(server.port);
  if (portInUse) {
    console.log(`${server.color}[${server.name}]${RESET_COLOR} Port ${server.port} is already in use. Skipping...`);
    return null;
  }
  
  // Check if the server directory exists
  if (!fs.existsSync(server.cwd)) {
    console.log(`${server.color}[${server.name}]${RESET_COLOR} Directory ${server.cwd} does not exist. Skipping...`);
    return null;
  }
  
  // Check if the server file exists
  const serverFile = path.join(server.cwd, server.args[0]);
  if (!fs.existsSync(serverFile)) {
    console.log(`${server.color}[${server.name}]${RESET_COLOR} Server file ${serverFile} does not exist. Skipping...`);
    return null;
  }
  
  console.log(`${server.color}[${server.name}]${RESET_COLOR} Starting on port ${server.port}...`);
  
  // Create log file stream
  const logFile = path.join(logsDir, `${server.name.toLowerCase().replace(/\s+/g, '-')}.log`);
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });
  
  // Start the server process
  const process = spawn(server.command, server.args, {
    cwd: server.cwd,
    env: { ...process.env, PORT: server.port },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  // Set up output handling
  let buffer = '';
  let isReady = false;
  
  process.stdout.on('data', (data) => {
    const output = data.toString();
    buffer += output;
    logStream.write(output);
    
    // Check if the server is ready
    if (!isReady && server.ready(buffer)) {
      isReady = true;
      console.log(`${server.color}[${server.name}]${RESET_COLOR} Ready on port ${server.port}`);
    }
    
    // Log to console with server name and color
    output.split('\n').forEach(line => {
      if (line.trim()) {
        console.log(`${server.color}[${server.name}]${RESET_COLOR} ${line}`);
      }
    });
  });
  
  process.stderr.on('data', (data) => {
    const output = data.toString();
    logStream.write(output);
    
    // Log to console with server name and color
    output.split('\n').forEach(line => {
      if (line.trim()) {
        console.log(`${server.color}[${server.name}]${RESET_COLOR} ERROR: ${line}`);
      }
    });
  });
  
  process.on('close', (code) => {
    console.log(`${server.color}[${server.name}]${RESET_COLOR} Exited with code ${code}`);
    logStream.end();
  });
  
  return process;
}

// Function to start all servers
async function startAllServers() {
  console.log('Starting MCP servers...');
  
  const processes = [];
  
  for (const server of MCP_SERVERS) {
    const process = await startServer(server);
    if (process) {
      processes.push({ server, process });
    }
  }
  
  console.log('\nAll MCP servers started. Press Ctrl+C to stop all servers.\n');
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\nStopping all MCP servers...');
    
    processes.forEach(({ server, process }) => {
      console.log(`${server.color}[${server.name}]${RESET_COLOR} Stopping...`);
      process.kill();
    });
    
    console.log('All MCP servers stopped.');
    process.exit(0);
  });
  
  // Set up command interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'mcp> '
  });
  
  rl.prompt();
  
  rl.on('line', (line) => {
    const command = line.trim();
    
    if (command === 'help') {
      console.log('Available commands:');
      console.log('  help     - Show this help message');
      console.log('  status   - Show status of all MCP servers');
      console.log('  restart  - Restart all MCP servers');
      console.log('  exit     - Stop all MCP servers and exit');
    } else if (command === 'status') {
      console.log('MCP server status:');
      processes.forEach(({ server, process }) => {
        const status = process.killed ? 'Stopped' : 'Running';
        console.log(`  ${server.color}${server.name}${RESET_COLOR}: ${status} (Port ${server.port})`);
      });
    } else if (command === 'restart') {
      console.log('Restarting all MCP servers...');
      
      processes.forEach(({ server, process }) => {
        console.log(`${server.color}[${server.name}]${RESET_COLOR} Stopping...`);
        process.kill();
      });
      
      setTimeout(() => {
        startAllServers();
      }, 2000);
      
      rl.close();
    } else if (command === 'exit') {
      console.log('Stopping all MCP servers...');
      
      processes.forEach(({ server, process }) => {
        console.log(`${server.color}[${server.name}]${RESET_COLOR} Stopping...`);
        process.kill();
      });
      
      console.log('All MCP servers stopped.');
      process.exit(0);
    } else if (command) {
      console.log(`Unknown command: ${command}`);
      console.log('Type "help" for available commands');
    }
    
    rl.prompt();
  });
}

// Start all servers
startAllServers().catch(error => {
  console.error('Error starting MCP servers:', error);
  process.exit(1);
});
