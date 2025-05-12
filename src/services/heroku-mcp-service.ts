/**
 * Heroku-MCP Service
 * 
 * Service for interacting with the Heroku-MCP server for application hosting and deployment.
 */

import { herokuMCPConfig } from '@/config/mcp-servers';
import { BaseMCPService } from './base-mcp-service';

export interface DeploymentOptions {
  branch: string;
  environment: 'development' | 'staging' | 'production';
  buildOptions?: Record<string, any>;
}

export interface DeploymentResult {
  id: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  url?: string;
  logs?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StatusResult {
  status: 'online' | 'offline' | 'degraded';
  instances: number;
  memory: number;
  cpu: number;
  uptime: number;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  source: string;
}

export interface ScaleOptions {
  instances: number;
  memory?: number;
  cpu?: number;
}

export class HerokuMCPService extends BaseMCPService {
  constructor() {
    super(herokuMCPConfig);
  }

  /**
   * Deploy the application
   * @param options - Deployment options
   */
  async deploy(options: DeploymentOptions): Promise<DeploymentResult> {
    return this.post<DeploymentResult>('deploy', options);
  }

  /**
   * Get the status of the application
   */
  async getStatus(): Promise<StatusResult> {
    return this.get<StatusResult>('status');
  }

  /**
   * Get logs for the application
   * @param limit - Maximum number of log entries to retrieve
   * @param startTime - Start time for log entries (ISO string)
   * @param endTime - End time for log entries (ISO string)
   */
  async getLogs(
    limit?: number,
    startTime?: string,
    endTime?: string
  ): Promise<LogEntry[]> {
    const queryParams = new URLSearchParams();
    
    if (limit) {
      queryParams.append('limit', limit.toString());
    }
    
    if (startTime) {
      queryParams.append('startTime', startTime);
    }
    
    if (endTime) {
      queryParams.append('endTime', endTime);
    }
    
    const url = `${this.getEndpointUrl('logs')}?${queryParams.toString()}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Heroku-MCP API error (${response.status}): ${errorText}`);
    }
    
    return await response.json() as LogEntry[];
  }

  /**
   * Scale the application
   * @param options - Scale options
   */
  async scale(options: ScaleOptions): Promise<StatusResult> {
    return this.post<StatusResult>('scale', options);
  }
}
