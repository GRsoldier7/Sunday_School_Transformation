/**
 * Taskmaster (Claude) Service
 * 
 * Service for interacting with the Taskmaster server for AI-powered task management.
 */

import { taskmasterConfig } from '@/config/mcp-servers';
import { BaseMCPService } from './base-mcp-service';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TaskCreateParams {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  assignedTo?: string;
  createdBy: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TaskUpdateParams {
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface TaskGenerationParams {
  context: string;
  count: number;
  assignTo?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
}

export class TaskmasterService extends BaseMCPService {
  constructor() {
    super(taskmasterConfig);
  }

  /**
   * Create a new task
   * @param params - Task creation parameters
   */
  async createTask(params: TaskCreateParams): Promise<Task> {
    return this.post<Task>('createTask', params);
  }

  /**
   * Get a task by ID
   * @param id - Task ID
   */
  async getTask(id: string): Promise<Task> {
    return this.get<Task>('getTask', { id });
  }

  /**
   * Update a task
   * @param id - Task ID
   * @param params - Task update parameters
   */
  async updateTask(id: string, params: TaskUpdateParams): Promise<Task> {
    return this.put<Task>('updateTask', params, { id });
  }

  /**
   * Delete a task
   * @param id - Task ID
   */
  async deleteTask(id: string): Promise<void> {
    return this.delete<void>('deleteTask', { id });
  }

  /**
   * Assign a task to a user
   * @param id - Task ID
   * @param userId - User ID
   */
  async assignTask(id: string, userId: string): Promise<Task> {
    return this.post<Task>('assignTask', { userId }, { id });
  }

  /**
   * Mark a task as completed
   * @param id - Task ID
   * @param completionNotes - Optional notes about the completion
   */
  async completeTask(id: string, completionNotes?: string): Promise<Task> {
    return this.post<Task>('completeTask', { completionNotes }, { id });
  }

  /**
   * Generate tasks using AI
   * @param params - Task generation parameters
   */
  async generateTasks(params: TaskGenerationParams): Promise<Task[]> {
    return this.post<Task[]>('generateTasks', params);
  }
}
