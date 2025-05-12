/**
 * Port Configuration
 * 
 * This file manages port configuration for all services in the application.
 * It ensures that ports are available before they are used.
 */

import { getServicePort } from '@/utils/port-scanner';

// Default ports for each service
export const DEFAULT_PORTS = {
  // Main application
  APP: 3000,
  
  // MCP Servers
  HEROKU_MCP: 3001,
  CONTEXT7: 3002,
  TASKMASTER: 3003,
  MAGICUI: 3004,
  MEMORY: 3005,
  KNOWLEDGE: 3006,
  
  // Development services
  DEV_SERVER: 5173,
  API_MOCK: 8000,
};

// Port ranges for fallback
export const PORT_RANGES = {
  APP: [3000, 3100],
  MCP_SERVERS: [3001, 3100],
  DEV: [5000, 5200],
  API: [8000, 8100],
};

// Cache for resolved ports
const resolvedPorts: Record<string, number> = {};

/**
 * Get an available port for a service
 * @param serviceName - The name of the service
 * @param preferredPort - The preferred port (defaults to the port in DEFAULT_PORTS)
 * @param fallbackRange - Optional custom fallback range
 */
export const getPort = async (
  serviceName: keyof typeof DEFAULT_PORTS,
  preferredPort?: number,
  fallbackRange?: [number, number]
): Promise<number> => {
  // Return cached port if already resolved
  if (resolvedPorts[serviceName]) {
    return resolvedPorts[serviceName];
  }
  
  const defaultPort = DEFAULT_PORTS[serviceName];
  const port = preferredPort || defaultPort;
  
  // Determine appropriate fallback range based on service type
  let range = fallbackRange;
  if (!range) {
    if (serviceName === 'APP') {
      range = PORT_RANGES.APP;
    } else if (
      serviceName === 'HEROKU_MCP' ||
      serviceName === 'CONTEXT7' ||
      serviceName === 'TASKMASTER' ||
      serviceName === 'MAGICUI' ||
      serviceName === 'MEMORY' ||
      serviceName === 'KNOWLEDGE'
    ) {
      range = PORT_RANGES.MCP_SERVERS;
    } else if (serviceName === 'DEV_SERVER') {
      range = PORT_RANGES.DEV;
    } else if (serviceName === 'API_MOCK') {
      range = PORT_RANGES.API;
    }
  }
  
  try {
    const availablePort = await getServicePort(port, serviceName, range);
    // Cache the resolved port
    resolvedPorts[serviceName] = availablePort;
    return availablePort;
  } catch (error) {
    console.error(`Failed to get available port for ${serviceName}:`, error);
    throw error;
  }
};

/**
 * Initialize all ports for the application
 * This should be called during application startup
 */
export const initializePorts = async (): Promise<Record<keyof typeof DEFAULT_PORTS, number>> => {
  const ports: Partial<Record<keyof typeof DEFAULT_PORTS, number>> = {};
  
  // Initialize ports for all services
  for (const serviceName of Object.keys(DEFAULT_PORTS) as Array<keyof typeof DEFAULT_PORTS>) {
    try {
      ports[serviceName] = await getPort(serviceName);
    } catch (error) {
      console.error(`Failed to initialize port for ${serviceName}:`, error);
      throw error;
    }
  }
  
  console.log('All ports initialized:', ports);
  return ports as Record<keyof typeof DEFAULT_PORTS, number>;
};
