#!/usr/bin/env node

/**
 * Port Scanner Script
 *
 * This script scans ports to check which ones are available before starting the application.
 * It helps prevent port conflicts with existing services.
 *
 * IMPORTANT: Always run this script before starting any servers to ensure ports are available!
 */

const net = require('net');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(chalk.blue('Loaded environment variables from .env.local'));
} else {
  console.warn(chalk.yellow('Warning: .env.local file not found. Using default values.'));
}

// Get ports from environment variables or use defaults
const PORT_CONFIG = {
  'Next.js App': parseInt(process.env.NEXT_PORT || '3000', 10),
  'Heroku-MCP': parseInt(process.env.HEROKU_MCP_PORT || '3001', 10),
  'Context7': parseInt(process.env.CONTEXT7_PORT || '3002', 10),
  'Taskmaster': parseInt(process.env.TASKMASTER_PORT || '3003', 10),
  'MagicUI': parseInt(process.env.MAGICUI_PORT || '3004', 10),
  'Memory': parseInt(process.env.MEMORY_PORT || '3005', 10),
  'Knowledge': parseInt(process.env.KNOWLEDGE_PORT || '3006', 10),
  'GitHub MCP': parseInt(process.env.GITHUB_MCP_PORT || '3007', 10)
};

// Default ports to check (extract unique values from PORT_CONFIG)
const DEFAULT_PORTS = [...new Set(Object.values(PORT_CONFIG))];

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

// Scan a range of ports
async function scanPortRange(startPort, endPort) {
  const available = [];
  const unavailable = [];

  for (let port = startPort; port <= endPort; port++) {
    const isAvailable = await isPortAvailable(port);
    if (isAvailable) {
      available.push(port);
    } else {
      unavailable.push(port);
    }
  }

  return { available, unavailable };
}

// Find an available port starting from a given port
async function findAvailablePort(startPort) {
  let port = startPort;
  const maxPort = startPort + 100; // Look for ports in a range of 100

  while (port < maxPort) {
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }

  throw new Error(`Could not find an available port in range ${startPort}-${maxPort}`);
}

// Generate a port availability report
async function generatePortReport() {
  const report = {
    services: {},
    availablePorts: [],
    unavailablePorts: [],
    alternativePorts: {},
    allAvailable: true
  };

  // Check each service port
  for (const [service, port] of Object.entries(PORT_CONFIG)) {
    const isAvailable = await isPortAvailable(port);

    report.services[service] = {
      port,
      isAvailable,
      alternativePort: null
    };

    if (isAvailable) {
      report.availablePorts.push(port);
    } else {
      report.unavailablePorts.push(port);
      report.allAvailable = false;

      // Find alternative port
      try {
        const alternativePort = await findAvailablePort(port + 1);
        report.services[service].alternativePort = alternativePort;
        report.alternativePorts[port] = alternativePort;
      } catch (error) {
        report.services[service].error = error.message;
      }
    }
  }

  return report;
}

// Save alternative ports to .env.local
function saveAlternativePorts(report) {
  if (!fs.existsSync(envPath)) {
    console.log(chalk.yellow('No .env.local file found. Creating one...'));
    fs.writeFileSync(envPath, '# Environment variables for Sunday School Transformation\n\n');
  }

  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update each port in the .env.local file
  for (const [service, info] of Object.entries(report.services)) {
    if (!info.isAvailable && info.alternativePort) {
      const envVarName = Object.keys(process.env).find(key =>
        process.env[key] === info.port.toString() && key.includes('PORT')
      );

      if (envVarName) {
        // If the variable exists in the file, update it
        const regex = new RegExp(`${envVarName}=\\d+`, 'g');
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, `${envVarName}=${info.alternativePort}`);
        } else {
          // If the variable doesn't exist, add it
          envContent += `\n${envVarName}=${info.alternativePort}`;
        }
      }
    }
  }

  // Write the updated content back to the file
  fs.writeFileSync(envPath, envContent);
  console.log(chalk.green('Updated .env.local with alternative ports'));
}

// Main function
async function main() {
  // Get ports to scan from command line arguments or use defaults
  const portsToScan = process.argv.length > 2
    ? process.argv.slice(2).map(Number)
    : DEFAULT_PORTS;

  console.log(chalk.blue('\n=== PORT AVAILABILITY SCAN ==='));
  console.log(chalk.blue('Scanning ports for availability...'));

  // Generate port report
  const report = await generatePortReport();

  // Display results in a table format
  console.log(chalk.blue('\nPort Scan Results:'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.bold('| Service          | Port | Status    | Alternative |'));
  console.log(chalk.gray('|─'.repeat(30)));

  for (const [service, info] of Object.entries(report.services)) {
    const name = service.padEnd(16);
    const port = info.port.toString().padEnd(5);
    const status = info.isAvailable
      ? chalk.green('Available'.padEnd(10))
      : chalk.red('In Use'.padEnd(10));
    const alternative = !info.isAvailable && info.alternativePort
      ? chalk.yellow(info.alternativePort.toString())
      : info.isAvailable ? chalk.gray('N/A') : chalk.red('None');

    console.log(`| ${name} | ${port} | ${status} | ${alternative.padEnd(11)} |`);
  }

  console.log(chalk.gray('─'.repeat(60)));

  // If any required ports are unavailable, suggest using alternatives
  if (report.unavailablePorts.length > 0) {
    console.log(chalk.yellow('\n⚠️ Some ports are already in use!'));

    // Ask if user wants to update .env.local with alternative ports
    if (process.argv.includes('--auto-fix')) {
      saveAlternativePorts(report);
    } else {
      console.log(chalk.yellow('\nRecommendation:'));
      console.log('1. Use the alternative ports shown above');
      console.log('2. Update your .env.local file with these alternative ports');
      console.log('3. Run this script again to verify port availability');
      console.log('\nYou can also run with --auto-fix to automatically update .env.local:');
      console.log('  npm run scan-ports -- --auto-fix');
    }

    // Exit with error code
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All ports are available!'));
    console.log(chalk.green('You can safely start all MCP servers.'));
    process.exit(0);
  }
}

// Run the script
main().catch(error => {
  console.error('Error scanning ports:', error);
  process.exit(1);
});
