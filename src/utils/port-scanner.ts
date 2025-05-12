/**
 * Port Scanner Utility
 * 
 * This utility helps check if ports are available before starting services.
 */

import { createServer } from 'net';

/**
 * Check if a port is available
 * @param port - The port to check
 * @returns Promise that resolves to true if the port is available, false otherwise
 */
export const isPortAvailable = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      // If the error is EADDRINUSE, the port is in use
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        // For other errors, we'll assume the port is available
        resolve(true);
      }
    });

    server.once('listening', () => {
      // Close the server if it starts listening successfully
      server.close(() => {
        resolve(true);
      });
    });

    // Try to listen on the port
    server.listen(port);
  });
};

/**
 * Find an available port starting from the provided port
 * @param startPort - The port to start checking from
 * @param endPort - Optional end port to stop checking at
 * @returns Promise that resolves to the first available port, or null if none found
 */
export const findAvailablePort = async (
  startPort: number,
  endPort?: number
): Promise<number | null> => {
  const maxPort = endPort || 65535; // Default to max port number if endPort not provided
  
  for (let port = startPort; port <= maxPort; port++) {
    const isAvailable = await isPortAvailable(port);
    if (isAvailable) {
      return port;
    }
  }
  
  return null; // No available ports found
};

/**
 * Scan a range of ports and return which ones are available
 * @param startPort - The port to start scanning from
 * @param endPort - The port to end scanning at
 * @returns Promise that resolves to an object with available and unavailable ports
 */
export const scanPortRange = async (
  startPort: number,
  endPort: number
): Promise<{
  available: number[];
  unavailable: number[];
}> => {
  const available: number[] = [];
  const unavailable: number[] = [];
  
  for (let port = startPort; port <= endPort; port++) {
    const isAvailable = await isPortAvailable(port);
    if (isAvailable) {
      available.push(port);
    } else {
      unavailable.push(port);
    }
  }
  
  return { available, unavailable };
};

/**
 * Get an available port for a service, with fallbacks
 * @param preferredPort - The preferred port for the service
 * @param serviceName - The name of the service (for logging)
 * @param fallbackRange - Optional range to look for fallback ports [start, end]
 * @returns Promise that resolves to an available port or throws an error if none found
 */
export const getServicePort = async (
  preferredPort: number,
  serviceName: string,
  fallbackRange?: [number, number]
): Promise<number> => {
  console.log(`Checking if preferred port ${preferredPort} is available for ${serviceName}...`);
  
  const isPreferredPortAvailable = await isPortAvailable(preferredPort);
  
  if (isPreferredPortAvailable) {
    console.log(`Using preferred port ${preferredPort} for ${serviceName}`);
    return preferredPort;
  }
  
  console.log(`Preferred port ${preferredPort} is not available for ${serviceName}`);
  
  if (fallbackRange) {
    console.log(`Looking for available port in range ${fallbackRange[0]}-${fallbackRange[1]} for ${serviceName}...`);
    const availablePort = await findAvailablePort(fallbackRange[0], fallbackRange[1]);
    
    if (availablePort) {
      console.log(`Using fallback port ${availablePort} for ${serviceName}`);
      return availablePort;
    }
    
    throw new Error(`No available ports found in range ${fallbackRange[0]}-${fallbackRange[1]} for ${serviceName}`);
  }
  
  throw new Error(`Preferred port ${preferredPort} is not available for ${serviceName} and no fallback range provided`);
};
