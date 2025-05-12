/**
 * Context7 Service
 * 
 * Service for interacting with the Context7 server for context management and personalization.
 */

import { context7Config } from '@/config/mcp-servers';
import { BaseMCPService } from './base-mcp-service';

export interface Context {
  id: string;
  userId: string;
  sessionId?: string;
  data: Record<string, any>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    source: string;
    tags?: string[];
  };
}

export interface ContextCreateParams {
  userId: string;
  sessionId?: string;
  data: Record<string, any>;
  tags?: string[];
}

export interface ContextUpdateParams {
  data: Record<string, any>;
  tags?: string[];
}

export interface ContextQueryParams {
  userId?: string;
  sessionId?: string;
  tags?: string[];
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  limit?: number;
  offset?: number;
}

export class Context7Service extends BaseMCPService {
  constructor() {
    super(context7Config);
  }

  /**
   * Create a new context
   * @param params - Context creation parameters
   */
  async createContext(params: ContextCreateParams): Promise<Context> {
    return this.post<Context>('createContext', params);
  }

  /**
   * Get a context by ID
   * @param id - Context ID
   */
  async getContext(id: string): Promise<Context> {
    return this.get<Context>('getContext', { id });
  }

  /**
   * Update a context
   * @param id - Context ID
   * @param params - Context update parameters
   */
  async updateContext(id: string, params: ContextUpdateParams): Promise<Context> {
    return this.put<Context>('updateContext', params, { id });
  }

  /**
   * Delete a context
   * @param id - Context ID
   */
  async deleteContext(id: string): Promise<void> {
    return this.delete<void>('deleteContext', { id });
  }

  /**
   * Query contexts based on various parameters
   * @param params - Query parameters
   */
  async queryContexts(params: ContextQueryParams): Promise<Context[]> {
    return this.post<Context[]>('queryContext', params);
  }
}
