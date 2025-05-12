/**
 * Base MCP Service
 * 
 * This abstract class provides common functionality for all MCP server services.
 * It handles API requests, error handling, and authentication.
 */

import { MCPServerConfig } from '@/config/mcp-servers';

export abstract class BaseMCPService {
  protected config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  /**
   * Check if the service is enabled
   */
  public isEnabled(): boolean {
    return this.config.isEnabled;
  }

  /**
   * Get the base URL for the service
   */
  protected getBaseUrl(): string {
    return this.config.baseUrl;
  }

  /**
   * Get the full URL for an endpoint
   * @param endpointKey - The key of the endpoint in the config
   * @param params - Parameters to replace in the URL (e.g., :id)
   */
  protected getEndpointUrl(endpointKey: string, params?: Record<string, string>): string {
    let endpoint = this.config.endpoints[endpointKey];
    
    if (!endpoint) {
      throw new Error(`Endpoint ${endpointKey} not found in ${this.config.name} configuration`);
    }

    // Replace parameters in the URL
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        endpoint = endpoint.replace(`:${key}`, value);
      });
    }

    return `${this.getBaseUrl()}${endpoint}`;
  }

  /**
   * Make an API request to the MCP server
   * @param method - HTTP method
   * @param endpointKey - The key of the endpoint in the config
   * @param params - Parameters to replace in the URL (e.g., :id)
   * @param data - Request body data
   */
  protected async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpointKey: string,
    params?: Record<string, string>,
    data?: any
  ): Promise<T> {
    if (!this.isEnabled()) {
      throw new Error(`${this.config.name} service is not enabled`);
    }

    const url = this.getEndpointUrl(endpointKey, params);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add API key if available
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${this.config.name} API error (${response.status}): ${errorText}`);
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`Error in ${this.config.name} service:`, error);
      throw error;
    }
  }

  /**
   * Make a GET request
   */
  protected async get<T>(
    endpointKey: string,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>('GET', endpointKey, params);
  }

  /**
   * Make a POST request
   */
  protected async post<T>(
    endpointKey: string,
    data: any,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>('POST', endpointKey, params, data);
  }

  /**
   * Make a PUT request
   */
  protected async put<T>(
    endpointKey: string,
    data: any,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>('PUT', endpointKey, params, data);
  }

  /**
   * Make a DELETE request
   */
  protected async delete<T>(
    endpointKey: string,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>('DELETE', endpointKey, params);
  }
}
