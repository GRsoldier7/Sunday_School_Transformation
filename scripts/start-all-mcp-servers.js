#!/usr/bin/env node

/**
 * Start All MCP Servers
 *
 * This script starts all MCP servers in parallel using child processes.
 * It includes port checking, error handling, and verification to ensure
 * all servers start successfully.
 *
 * Enhanced with Supabase logging and improved debugging capabilities.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const net = require('net');
const http = require('http');
const { Client } = require('pg');
const chalk = require('chalk');
const os = require('os');

// Script version
const SCRIPT_VERSION = '1.1.0';

// Debug mode (can be enabled via environment variable)
const DEBUG_MODE = process.env.DEBUG_MCP_SERVERS === 'true';

// Hostname for logging
const HOSTNAME = os.hostname();

// Initialize timestamp for run ID
const RUN_ID = Date.now();

// PostgreSQL connection for logging
const PG_CONNECTION_STRING = process.env.SUPABASE_CONNECTION_STRING || 'postgresql://postgres:4blwmtOBds@192.168.1.213:31432/postgres';

// Create PostgreSQL client
const pgClient = new Client({
  connectionString: PG_CONNECTION_STRING
});

// Log levels
const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};

// Initialize logging system
async function initLogging() {
  try {
    await pgClient.connect();
    logDebug('Connected to PostgreSQL database');

    // Create logs table if it doesn't exist
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS mcp_server_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        run_id BIGINT,
        hostname TEXT,
        server_name TEXT,
        level TEXT,
        message TEXT,
        metadata JSONB
      )
    `);

    logDebug('Logging system initialized');
    return true;
  } catch (error) {
    console.error(chalk.red(`Failed to initialize logging system: ${error.message}`));
    if (DEBUG_MODE) {
      console.error(error);
    }
    return false;
  }
}

// Log a message to both console and database
async function log(level, message, serverName = 'system', metadata = {}) {
  const timestamp = new Date();
  const formattedTimestamp = timestamp.toISOString();

  // Determine color based on log level
  let colorFn;
  switch (level) {
    case LOG_LEVELS.DEBUG:
      colorFn = chalk.gray;
      break;
    case LOG_LEVELS.INFO:
      colorFn = chalk.blue;
      break;
    case LOG_LEVELS.WARN:
      colorFn = chalk.yellow;
      break;
    case LOG_LEVELS.ERROR:
    case LOG_LEVELS.FATAL:
      colorFn = chalk.red;
      break;
    default:
      colorFn = chalk.white;
  }

  // Log to console
  const prefix = serverName === 'system' ? '' : `[${serverName}] `;
  console.log(`${chalk.gray(formattedTimestamp)} ${colorFn(level)} ${prefix}${message}`);

  // Log to database if connected
  try {
    if (pgClient && pgClient._connected) {
      await pgClient.query(
        'INSERT INTO mcp_server_logs(timestamp, run_id, hostname, server_name, level, message, metadata) VALUES($1, $2, $3, $4, $5, $6, $7)',
        [timestamp, RUN_ID, HOSTNAME, serverName, level, message, JSON.stringify(metadata)]
      );
    }
  } catch (error) {
    console.error(chalk.red(`Failed to write log to database: ${error.message}`));
    if (DEBUG_MODE) {
      console.error(error);
    }
  }
}

// Convenience logging functions
function logDebug(message, serverName = 'system', metadata = {}) {
  if (DEBUG_MODE) {
    log(LOG_LEVELS.DEBUG, message, serverName, metadata);
  }
}

function logInfo(message, serverName = 'system', metadata = {}) {
  log(LOG_LEVELS.INFO, message, serverName, metadata);
}

function logWarn(message, serverName = 'system', metadata = {}) {
  log(LOG_LEVELS.WARN, message, serverName, metadata);
}

function logError(message, serverName = 'system', metadata = {}) {
  log(LOG_LEVELS.ERROR, message, serverName, metadata);
}

function logFatal(message, serverName = 'system', metadata = {}) {
  log(LOG_LEVELS.FATAL, message, serverName, metadata);
}

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  logInfo('Loaded environment variables from .env.local');
} else {
  logWarn('Warning: .env.local file not found. Using default values.');
}

// MCP Server configurations with default ports
const mcpServers = [
  {
    name: 'heroku-mcp',
    displayName: 'Heroku-MCP',
    defaultPort: process.env.HEROKU_MCP_PORT || 3001,
    port: null, // Will be set after port checking
    process: null,
    status: 'pending',
    startTime: null,
    retries: 0,
    maxRetries: 3,
    logs: []
  },
  {
    name: 'context7',
    displayName: 'Context7',
    defaultPort: process.env.CONTEXT7_PORT || 3002,
    port: null,
    process: null,
    status: 'pending',
    startTime: null,
    retries: 0,
    maxRetries: 3,
    logs: []
  },
  {
    name: 'taskmaster',
    displayName: 'Taskmaster (Claude)',
    defaultPort: process.env.TASKMASTER_PORT || 3003,
    port: null,
    process: null,
    status: 'pending',
    startTime: null,
    retries: 0,
    maxRetries: 3,
    logs: []
  },
  {
    name: 'magicui',
    displayName: 'MagicUI',
    defaultPort: process.env.MAGICUI_PORT || 3004,
    port: null,
    process: null,
    status: 'pending',
    startTime: null,
    retries: 0,
    maxRetries: 3,
    logs: []
  },
  {
    name: 'memory',
    displayName: 'Memory',
    defaultPort: process.env.MEMORY_PORT || 3005,
    port: null,
    process: null,
    status: 'pending',
    startTime: null,
    retries: 0,
    maxRetries: 3,
    logs: []
  },
  {
    name: 'knowledge',
    displayName: 'Knowledge',
    defaultPort: process.env.KNOWLEDGE_PORT || 3006,
    port: null,
    process: null,
    status: 'pending',
    startTime: null,
    retries: 0,
    maxRetries: 3,
    logs: []
  },
  {
    name: 'github-mcp',
    displayName: 'GitHub MCP',
    defaultPort: process.env.GITHUB_MCP_PORT || 3007,
    port: null,
    process: null,
    status: 'pending',
    startTime: null,
    retries: 0,
    maxRetries: 3,
    logs: []
  }
];

// Check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    logDebug(`Checking if port ${port} is available...`);

    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logDebug(`Port ${port} is in use`);
        resolve(false);
      } else {
        logDebug(`Error checking port ${port}: ${err.message}`);
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => {
        logDebug(`Port ${port} is available`);
        resolve(true);
      });
    });

    server.listen(port);
  });
}

// Find an available port starting from the given port
async function findAvailablePort(startPort) {
  logDebug(`Finding available port starting from ${startPort}...`);

  let port = startPort;
  const maxPort = startPort + 100; // Look for ports in a range of 100

  while (port < maxPort) {
    if (await isPortAvailable(port)) {
      logDebug(`Found available port: ${port}`);
      return port;
    }
    port++;
  }

  const errorMsg = `Could not find an available port in range ${startPort}-${maxPort}`;
  logError(errorMsg);
  throw new Error(errorMsg);
}

// Verify all ports are available before starting servers
async function verifyPortsAvailability() {
  logInfo('Performing critical port availability check...');

  const portCheckResults = [];
  let allPortsAvailable = true;

  // Check each server's port
  for (const server of mcpServers) {
    const isAvailable = await isPortAvailable(server.port);

    portCheckResults.push({
      name: server.displayName,
      port: server.port,
      isAvailable
    });

    if (!isAvailable) {
      allPortsAvailable = false;
    }
  }

  // If any ports are unavailable, log error and exit
  if (!allPortsAvailable) {
    logError('CRITICAL ERROR: Some ports are already in use!');
    logError('Cannot start servers on ports that are already in use.');

    // Display table of port status
    console.log('\nPort Availability:');
    console.log('─'.repeat(50));
    console.log('| Server Name          | Port | Status    |');
    console.log('|─'.repeat(25));

    for (const result of portCheckResults) {
      const name = result.name.padEnd(20);
      const port = result.port.toString().padEnd(5);
      const status = result.isAvailable
        ? chalk.green('Available')
        : chalk.red('In Use');

      console.log(`| ${name} | ${port} | ${status.padEnd(10)} |`);
    }

    console.log('─'.repeat(50));

    logError('Please run "npm run scan-ports" to find available ports');
    logError('Or run "npm run scan-ports:fix" to automatically use alternative ports');

    // Exit with error
    process.exit(1);
  }

  logInfo('✅ All ports are available and ready for use!');
  return true;
}

// Check server health
function checkServerHealth(server) {
  return new Promise((resolve) => {
    logDebug(`Checking health of ${server.displayName} on port ${server.port}...`, server.displayName);

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
            logDebug(`Health check successful for ${server.displayName}`, server.displayName, { response });
            resolve(true);
          } catch (error) {
            logDebug(`Invalid JSON response from ${server.displayName} health check`, server.displayName, { data });
            resolve(false);
          }
        } else {
          logDebug(`Health check failed for ${server.displayName}: status code ${res.statusCode}`, server.displayName);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      logDebug(`Health check error for ${server.displayName}: ${error.message}`, server.displayName);
      resolve(false);
    });

    req.on('timeout', () => {
      logDebug(`Health check timeout for ${server.displayName}`, server.displayName);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Function to start a single MCP server
function startMCPServer(server) {
  logInfo(`Starting ${server.displayName} on port ${server.port}...`, server.displayName);

  server.startTime = Date.now();
  server.status = 'starting';

  // Store server start in logs
  server.logs.push({
    timestamp: new Date().toISOString(),
    level: LOG_LEVELS.INFO,
    message: `Starting server on port ${server.port}`
  });

  const serverProcess = spawn('node', [path.join(__dirname, 'mcp-server.js'), server.name, server.port.toString()], {
    stdio: 'pipe',
    detached: false,
    env: {
      ...process.env,
      MCP_SERVER_PORT: server.port.toString(),
      DEBUG_MODE: DEBUG_MODE ? 'true' : 'false'
    }
  });

  server.process = serverProcess;

  serverProcess.stdout.on('data', (data) => {
    const output = data.toString().trim();
    logInfo(output, server.displayName);

    // Store output in server logs
    server.logs.push({
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.INFO,
      message: output
    });

    // Check for successful startup message
    if (output.includes('server is running on port')) {
      server.status = 'running';
      logInfo(`${server.displayName} is now running`, server.displayName);

      // Log to database
      log(LOG_LEVELS.INFO, `Server started successfully on port ${server.port}`, server.displayName, {
        port: server.port,
        startTime: server.startTime,
        startupTime: Date.now() - server.startTime
      });
    }
  });

  serverProcess.stderr.on('data', (data) => {
    const errorOutput = data.toString().trim();
    logError(errorOutput, server.displayName);

    // Store error in server logs
    server.logs.push({
      timestamp: new Date().toISOString(),
      level: LOG_LEVELS.ERROR,
      message: errorOutput
    });

    // If we get an error, mark the server as failed
    if (server.status === 'starting') {
      server.status = 'error';

      // Log to database
      log(LOG_LEVELS.ERROR, `Server failed to start: ${errorOutput}`, server.displayName, {
        port: server.port,
        startTime: server.startTime,
        failureTime: Date.now() - server.startTime
      });
    }
  });

  serverProcess.on('close', (code) => {
    if (code === 0) {
      logInfo(`${server.displayName} process exited normally with code ${code}`, server.displayName);
    } else {
      logWarn(`${server.displayName} process exited with code ${code}`, server.displayName);
    }

    // Store exit in server logs
    server.logs.push({
      timestamp: new Date().toISOString(),
      level: code === 0 ? LOG_LEVELS.INFO : LOG_LEVELS.WARN,
      message: `Process exited with code ${code}`
    });

    // If the server exits unexpectedly and we haven't reached max retries, try to restart it
    if (code !== 0 && server.status !== 'stopping' && server.retries < server.maxRetries) {
      server.retries++;
      logInfo(`Retrying startup of ${server.displayName} (${server.retries}/${server.maxRetries})...`, server.displayName);
      server.process = null;
      server.status = 'pending';

      // Log to database
      log(LOG_LEVELS.WARN, `Server exited unexpectedly, retrying (${server.retries}/${server.maxRetries})`, server.displayName, {
        port: server.port,
        exitCode: code,
        retryCount: server.retries
      });

      // Wait a moment before retrying
      setTimeout(() => {
        startMCPServer(server);
      }, 1000);
    } else if (code !== 0 && server.status !== 'stopping') {
      server.status = 'failed';
      logError(`${server.displayName} failed to start after ${server.retries} retries`, server.displayName);

      // Log to database
      log(LOG_LEVELS.ERROR, `Server failed permanently after ${server.retries} retries`, server.displayName, {
        port: server.port,
        exitCode: code,
        retryCount: server.retries
      });
    }
  });

  return serverProcess;
}

// Function to stop all MCP servers
async function stopAllServers() {
  logInfo('\nStopping all MCP servers...');

  for (const server of mcpServers) {
    if (server.process) {
      logInfo(`Stopping ${server.displayName}...`, server.displayName);
      server.status = 'stopping';

      // Log to database
      await log(LOG_LEVELS.INFO, `Stopping server`, server.displayName, {
        port: server.port,
        uptime: server.startTime ? Date.now() - server.startTime : null,
        logCount: server.logs.length
      });

      // Store stop in server logs
      server.logs.push({
        timestamp: new Date().toISOString(),
        level: LOG_LEVELS.INFO,
        message: 'Server stopping'
      });

      server.process.kill();
    }
  }

  // Wait for all processes to exit
  await new Promise(resolve => setTimeout(resolve, 2000));

  logInfo('All MCP servers stopped');

  // Close database connection
  if (pgClient && pgClient._connected) {
    try {
      await pgClient.end();
      logDebug('Database connection closed');
    } catch (error) {
      console.error(chalk.red(`Error closing database connection: ${error.message}`));
    }
  }

  process.exit(0);
}

// Handle process termination
process.on('SIGINT', stopAllServers);
process.on('SIGTERM', stopAllServers);

// Verify all servers are running
async function verifyAllServers() {
  logInfo('\nVerifying MCP servers...');

  const results = await Promise.all(
    mcpServers.map(async (server) => {
      if (server.status === 'running') {
        const isHealthy = await checkServerHealth(server);
        return {
          name: server.displayName,
          port: server.port,
          status: isHealthy ? 'healthy' : 'unhealthy'
        };
      } else {
        return {
          name: server.displayName,
          port: server.port,
          status: server.status
        };
      }
    })
  );

  // Log results to database
  for (const result of results) {
    await log(LOG_LEVELS.INFO, `Server status: ${result.status}`, result.name, { port: result.port });
  }

  // Print status table
  console.log('\n' + chalk.bold('MCP Server Status:'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.bold('| Server Name          | Port | Status    |'));
  console.log(chalk.gray('|─'.repeat(30)));

  results.forEach(result => {
    const name = result.name.padEnd(20);
    const port = result.port.toString().padEnd(5);

    let statusColor;
    switch (result.status) {
      case 'healthy':
        statusColor = chalk.green;
        break;
      case 'running':
        statusColor = chalk.blue;
        break;
      case 'unhealthy':
        statusColor = chalk.yellow;
        break;
      case 'failed':
      case 'error':
        statusColor = chalk.red;
        break;
      default:
        statusColor = chalk.gray;
    }

    const status = statusColor(result.status.padEnd(10));

    console.log(`| ${name} | ${port} | ${status} |`);
  });

  console.log(chalk.gray('─'.repeat(60)));

  const healthyCount = results.filter(r => r.status === 'healthy').length;
  const unhealthyCount = results.filter(r => r.status === 'unhealthy').length;
  const failedCount = results.filter(r => ['failed', 'error'].includes(r.status)).length;

  console.log(`\nSummary: ${chalk.green(healthyCount)} healthy, ${chalk.yellow(unhealthyCount)} unhealthy, ${chalk.red(failedCount)} failed`);

  if (healthyCount === mcpServers.length) {
    logInfo('\n✅ All MCP servers are running successfully!');
  } else {
    logWarn(`\n⚠️ ${mcpServers.length - healthyCount} MCP servers are not running properly.`);
  }

  // Save final status to database
  await log(LOG_LEVELS.INFO, `Final status: ${healthyCount}/${mcpServers.length} servers healthy`, 'system', {
    healthy: healthyCount,
    unhealthy: unhealthyCount,
    failed: failedCount,
    total: mcpServers.length
  });
}

// Main function to start all servers
async function startAllServers() {
  logInfo(`Starting MCP servers (version ${SCRIPT_VERSION})...`);
  logInfo(`Run ID: ${RUN_ID}`);
  logInfo(`Debug mode: ${DEBUG_MODE ? 'enabled' : 'disabled'}`);

  // Initialize logging system
  const loggingInitialized = await initLogging();
  if (!loggingInitialized) {
    logWarn('Continuing without database logging');
  }

  logInfo('Checking port availability...');

  // Check port availability and assign ports
  for (const server of mcpServers) {
    try {
      // Get port from environment variables or use default
      const envVarName = `${server.name.toUpperCase().replace(/-/g, '_')}_PORT`;
      const envPort = process.env[envVarName];
      const defaultPort = envPort ? parseInt(envPort, 10) : server.defaultPort;

      if (await isPortAvailable(defaultPort)) {
        server.port = defaultPort;
        logInfo(`Port ${server.port} is available for ${server.displayName}`, server.displayName);
      } else {
        logWarn(`Port ${defaultPort} is in use for ${server.displayName}, finding alternative...`, server.displayName);
        server.port = await findAvailablePort(defaultPort + 1);
        logInfo(`Using alternative port ${server.port} for ${server.displayName}`, server.displayName);

        // Log warning about port change
        logWarn(`⚠️ Using alternative port ${server.port} instead of ${defaultPort} for ${server.displayName}`, server.displayName);
        logWarn(`Consider updating your .env.local file with ${envVarName}=${server.port}`, server.displayName);
      }
    } catch (error) {
      logError(`Error checking port for ${server.displayName}: ${error.message}`, server.displayName);
      server.status = 'error';
    }
  }

  // Perform final verification of port availability
  // This is a critical step to ensure we don't start servers on ports that are in use
  await verifyPortsAvailability();

  // Start all servers with assigned ports
  logInfo('\nStarting all MCP servers...');

  for (const server of mcpServers) {
    if (server.status !== 'error') {
      startMCPServer(server);
      // Add a small delay between server starts to avoid resource contention
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Wait for all servers to start or fail
  logInfo('\nWaiting for servers to start...');

  // Check status every second for up to 30 seconds
  let attempts = 0;
  const maxAttempts = 30;

  const checkStatus = () => {
    attempts++;

    const allSettled = mcpServers.every(server =>
      ['running', 'failed', 'error'].includes(server.status)
    );

    const runningCount = mcpServers.filter(server => server.status === 'running').length;
    const failedCount = mcpServers.filter(server => ['failed', 'error'].includes(server.status)).length;

    logDebug(`Status check: ${runningCount} running, ${failedCount} failed, attempt ${attempts}/${maxAttempts}`);

    if (allSettled || attempts >= maxAttempts) {
      // Verify all servers after they've started
      setTimeout(verifyAllServers, 2000);
    } else {
      setTimeout(checkStatus, 1000);
    }
  };

  // Start checking status
  setTimeout(checkStatus, 1000);

  logInfo('\nMCP servers starting. Press Ctrl+C to stop all servers.');
}

// Run the main function
startAllServers().catch(error => {
  logFatal(`Error starting MCP servers: ${error.message}`);
  if (DEBUG_MODE) {
    console.error(error);
  }
  process.exit(1);
});
