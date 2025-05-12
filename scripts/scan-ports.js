#!/usr/bin/env node

/**
 * Port Scanner Script
 * 
 * This script scans ports to check which ones are available before starting the application.
 * It helps prevent port conflicts with existing services.
 */

const net = require('net');

// Default ports to check
const DEFAULT_PORTS = [
  3000, // Main application
  3001, // Heroku-MCP
  3002, // Context7
  3003, // Taskmaster
  3004, // MagicUI
  3005, // Memory
  3006, // Knowledge
  5173, // Dev server
  8000, // API mock
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

// Main function
async function main() {
  // Get ports to scan from command line arguments or use defaults
  const portsToScan = process.argv.length > 2 
    ? process.argv.slice(2).map(Number) 
    : DEFAULT_PORTS;
  
  console.log('Scanning ports...');
  
  // Check each port
  const results = await Promise.all(
    portsToScan.map(async (port) => {
      const isAvailable = await isPortAvailable(port);
      return { port, isAvailable };
    })
  );
  
  // Display results
  console.log('\nPort Scan Results:');
  console.log('------------------');
  
  const availablePorts = results.filter(r => r.isAvailable).map(r => r.port);
  const unavailablePorts = results.filter(r => !r.isAvailable).map(r => r.port);
  
  console.log('Available ports:', availablePorts.join(', ') || 'None');
  console.log('Unavailable ports:', unavailablePorts.join(', ') || 'None');
  
  // If any required ports are unavailable, suggest alternatives
  if (unavailablePorts.length > 0) {
    console.log('\nSuggested alternatives for unavailable ports:');
    
    // Find alternative ports
    for (const port of unavailablePorts) {
      // Look for an available port in a range of 100 ports starting from the original port
      const startRange = Math.floor(port / 100) * 100;
      const endRange = startRange + 99;
      
      const { available } = await scanPortRange(startRange, endRange);
      
      // Filter out ports that are already in our list of ports to scan
      const alternatives = available.filter(p => !portsToScan.includes(p)).slice(0, 3);
      
      console.log(`Port ${port}: ${alternatives.join(', ') || 'No alternatives found in range ' + startRange + '-' + endRange}`);
    }
  }
  
  // Exit with error code if any required ports are unavailable
  if (unavailablePorts.length > 0) {
    console.log('\nWarning: Some ports are already in use. Please update your configuration accordingly.');
    process.exit(1);
  } else {
    console.log('\nAll ports are available!');
    process.exit(0);
  }
}

// Run the script
main().catch(error => {
  console.error('Error scanning ports:', error);
  process.exit(1);
});
