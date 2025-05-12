#!/usr/bin/env node

/**
 * Start All MCP Servers
 * 
 * This script starts all MCP servers in parallel using child processes.
 */

const { spawn } = require('child_process');
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

// MCP Server names
const mcpServerNames = [
  'heroku-mcp',
  'context7',
  'taskmaster',
  'magicui',
  'memory',
  'knowledge',
  'github-mcp'
];

// Store child processes
const childProcesses = [];

// Function to start a single MCP server
function startMCPServer(serverName) {
  console.log(`Starting ${serverName}...`);
  
  const serverProcess = spawn('node', [path.join(__dirname, 'mcp-server.js'), serverName], {
    stdio: 'pipe',
    detached: false
  });
  
  childProcesses.push({
    name: serverName,
    process: serverProcess
  });
  
  serverProcess.stdout.on('data', (data) => {
    console.log(`[${serverName}] ${data.toString().trim()}`);
  });
  
  serverProcess.stderr.on('data', (data) => {
    console.error(`[${serverName}] ERROR: ${data.toString().trim()}`);
  });
  
  serverProcess.on('close', (code) => {
    console.log(`[${serverName}] process exited with code ${code}`);
  });
  
  return serverProcess;
}

// Start all MCP servers
console.log('Starting all MCP servers...');
mcpServerNames.forEach(startMCPServer);

// Function to stop all MCP servers
function stopAllServers() {
  console.log('\nStopping all MCP servers...');
  
  childProcesses.forEach(({ name, process }) => {
    console.log(`Stopping ${name}...`);
    process.kill();
  });
  
  console.log('All MCP servers stopped');
  process.exit(0);
}

// Handle process termination
process.on('SIGINT', stopAllServers);
process.on('SIGTERM', stopAllServers);

console.log('\nAll MCP servers started. Press Ctrl+C to stop all servers.');
