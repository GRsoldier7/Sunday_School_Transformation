/**
 * Memory Service
 * 
 * Service for interacting with the Memory server for data storage and retrieval.
 */

import { memoryConfig } from '@/config/mcp-servers';
import { BaseMCPService } from './base-mcp-service';

export interface MemoryItem<T = any> {
  id: string;
  key: string;
  value: T;
  metadata: {
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
    tags?: string[];
    userId?: string;
    sessionId?: string;
  };
}

export interface StoreParams<T = any> {
  key: string;
  value: T;
  expiresAt?: string;
  tags?: string[];
  userId?: string;
  sessionId?: string;
}

export interface UpdateParams<T = any> {
  value: T;
  expiresAt?: string;
  tags?: string[];
}

export interface QueryParams {
  keys?: string[];
  tags?: string[];
  userId?: string;
  sessionId?: string;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  expiresAfter?: string;
  expiresBefore?: string;
  limit?: number;
  offset?: number;
}

export interface BatchOperation<T = any> {
  operation: 'store' | 'retrieve' | 'update' | 'delete';
  key: string;
  value?: T;
  expiresAt?: string;
  tags?: string[];
  userId?: string;
  sessionId?: string;
}

export interface BatchResult<T = any> {
  key: string;
  success: boolean;
  data?: MemoryItem<T>;
  error?: string;
}

export class MemoryService extends BaseMCPService {
  constructor() {
    super(memoryConfig);
  }

  /**
   * Store a value in memory
   * @param params - Store parameters
   */
  async store<T = any>(params: StoreParams<T>): Promise<MemoryItem<T>> {
    return this.post<MemoryItem<T>>('store', params);
  }

  /**
   * Retrieve a value from memory
   * @param key - The key to retrieve
   */
  async retrieve<T = any>(key: string): Promise<MemoryItem<T>> {
    return this.post<MemoryItem<T>>('retrieve', { key });
  }

  /**
   * Update a value in memory
   * @param key - The key to update
   * @param params - Update parameters
   */
  async update<T = any>(key: string, params: UpdateParams<T>): Promise<MemoryItem<T>> {
    return this.post<MemoryItem<T>>('update', { key, ...params });
  }

  /**
   * Delete a value from memory
   * @param key - The key to delete
   */
  async delete(key: string): Promise<void> {
    return this.post<void>('delete', { key });
  }

  /**
   * Query memory items based on various parameters
   * @param params - Query parameters
   */
  async query<T = any>(params: QueryParams): Promise<MemoryItem<T>[]> {
    return this.post<MemoryItem<T>[]>('query', params);
  }

  /**
   * Perform batch operations
   * @param operations - Batch operations
   */
  async batch<T = any>(operations: BatchOperation<T>[]): Promise<BatchResult<T>[]> {
    return this.post<BatchResult<T>[]>('batch', { operations });
  }
}
