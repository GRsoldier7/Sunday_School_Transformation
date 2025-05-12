/**
 * MCP Services Integration
 * 
 * This file provides integration with the MCP servers for enhanced functionality.
 */

import api from './api';
import { Session } from './api';

// Context7 Service - For managing user preferences and session context
export const context7Service = {
  /**
   * Store user preferences
   */
  async storePreferences(userId: string, preferences: Record<string, any>): Promise<void> {
    try {
      await fetch('http://localhost:3002/api/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          data: preferences,
          tags: ['preferences']
        }),
      });
    } catch (error) {
      console.error('Error storing preferences in Context7:', error);
      throw error;
    }
  },

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<Record<string, any>> {
    try {
      const response = await fetch(`http://localhost:3002/api/context?userId=${userId}&tags=preferences`);
      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error getting preferences from Context7:', error);
      return {};
    }
  },

  /**
   * Store session context
   */
  async storeSessionContext(sessionId: number, context: Record<string, any>): Promise<void> {
    try {
      await fetch('http://localhost:3002/api/context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId.toString(),
          data: context,
          tags: ['session']
        }),
      });
    } catch (error) {
      console.error('Error storing session context in Context7:', error);
      throw error;
    }
  },

  /**
   * Get session context
   */
  async getSessionContext(sessionId: number): Promise<Record<string, any>> {
    try {
      const response = await fetch(`http://localhost:3002/api/context?sessionId=${sessionId}&tags=session`);
      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error getting session context from Context7:', error);
      return {};
    }
  }
};

// Taskmaster Service - For AI task orchestration
export const taskmasterService = {
  /**
   * Generate AI content for a session
   */
  async generateAIContent(session: Session): Promise<{
    summary: string;
    commentary: string;
    nextSessionPreview: string;
  }> {
    try {
      const response = await fetch('http://localhost:3003/api/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer your_taskmaster_api_key`
        },
        body: JSON.stringify({
          session,
          task: 'generate_ai_content'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Taskmaster API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error generating AI content with Taskmaster:', error);
      
      // Fallback to direct API call if Taskmaster fails
      try {
        const response = await api.post('/generate-ai-content', { session });
        return response.data;
      } catch (fallbackError) {
        console.error('Fallback API call also failed:', fallbackError);
        throw fallbackError;
      }
    }
  },

  /**
   * Schedule email digest generation
   */
  async scheduleEmailDigest(sessionId: number, scheduledTime?: Date): Promise<void> {
    try {
      await fetch('http://localhost:3003/api/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer your_taskmaster_api_key`
        },
        body: JSON.stringify({
          sessionId,
          task: 'schedule_email_digest',
          scheduledTime: scheduledTime?.toISOString() || new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Error scheduling email digest with Taskmaster:', error);
      throw error;
    }
  }
};

// MagicUI Service - For UI components and design system
export const magicUIService = {
  /**
   * Get UI components for a specific page
   */
  async getComponents(page: string): Promise<any[]> {
    try {
      const response = await fetch(`http://localhost:3004/api/status?page=${page}`, {
        headers: {
          'Authorization': `Bearer your_magicui_api_key`
        }
      });
      
      if (!response.ok) {
        throw new Error(`MagicUI API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting UI components from MagicUI:', error);
      return [];
    }
  },

  /**
   * Get theme configuration
   */
  async getTheme(): Promise<Record<string, any>> {
    try {
      const response = await fetch('http://localhost:3004/api/status', {
        headers: {
          'Authorization': `Bearer your_magicui_api_key`
        }
      });
      
      if (!response.ok) {
        throw new Error(`MagicUI API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting theme from MagicUI:', error);
      return {};
    }
  }
};

// Memory Service - For caching and data storage
export const memoryService = {
  /**
   * Store data in memory
   */
  async store<T>(key: string, value: T, expiresIn?: number): Promise<void> {
    try {
      await fetch('http://localhost:3005/api/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          value,
          expiresIn
        }),
      });
    } catch (error) {
      console.error('Error storing data in Memory service:', error);
      
      // Fallback to localStorage for client-side caching
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (fallbackError) {
        console.error('Fallback to localStorage also failed:', fallbackError);
      }
    }
  },

  /**
   * Retrieve data from memory
   */
  async retrieve<T>(key: string): Promise<T | null> {
    try {
      const response = await fetch(`http://localhost:3005/api/status?key=${key}`);
      
      if (!response.ok) {
        throw new Error(`Memory API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.value as T;
    } catch (error) {
      console.error('Error retrieving data from Memory service:', error);
      
      // Fallback to localStorage for client-side caching
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) as T : null;
      } catch (fallbackError) {
        console.error('Fallback to localStorage also failed:', fallbackError);
        return null;
      }
    }
  },

  /**
   * Cache API response
   */
  async cacheApiResponse<T>(endpoint: string, data: T, expiresIn: number = 3600): Promise<void> {
    return this.store(`api_cache_${endpoint}`, {
      data,
      timestamp: Date.now()
    }, expiresIn);
  },

  /**
   * Get cached API response
   */
  async getCachedApiResponse<T>(endpoint: string): Promise<T | null> {
    const cached = await this.retrieve<{data: T, timestamp: number}>(`api_cache_${endpoint}`);
    
    if (!cached) {
      return null;
    }
    
    return cached.data;
  }
};

// Knowledge Service - For Bible reference information
export const knowledgeService = {
  /**
   * Get Bible reference information
   */
  async getBibleReference(reference: string): Promise<any> {
    try {
      const response = await fetch(`http://localhost:3006/api/status?reference=${encodeURIComponent(reference)}`);
      
      if (!response.ok) {
        throw new Error(`Knowledge API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting Bible reference from Knowledge service:', error);
      return null;
    }
  },

  /**
   * Get cross-references for a Bible passage
   */
  async getCrossReferences(reference: string): Promise<string[]> {
    try {
      const response = await fetch(`http://localhost:3006/api/status?reference=${encodeURIComponent(reference)}&type=cross-references`);
      
      if (!response.ok) {
        throw new Error(`Knowledge API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.crossReferences || [];
    } catch (error) {
      console.error('Error getting cross-references from Knowledge service:', error);
      return [];
    }
  },

  /**
   * Get resource links for a Bible passage
   */
  async getResourceLinks(reference: string): Promise<any[]> {
    try {
      const response = await fetch(`http://localhost:3006/api/status?reference=${encodeURIComponent(reference)}&type=resources`);
      
      if (!response.ok) {
        throw new Error(`Knowledge API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.resources || [];
    } catch (error) {
      console.error('Error getting resource links from Knowledge service:', error);
      return [];
    }
  }
};

// GitHub MCP Service - For repository management
export const githubMCPService = {
  /**
   * Get repository information
   */
  async getRepositoryInfo(owner: string, repo: string): Promise<any> {
    try {
      const response = await fetch(`http://localhost:3007/api/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer your_github_mcp_api_key`
        }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub MCP API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting repository info from GitHub MCP:', error);
      return null;
    }
  },

  /**
   * Push changes to repository
   */
  async pushChanges(owner: string, repo: string, branch: string, message: string, files: {path: string, content: string}[]): Promise<any> {
    try {
      const response = await fetch(`http://localhost:3007/api/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer your_github_mcp_api_key`
        },
        body: JSON.stringify({
          owner,
          repo,
          branch,
          message,
          files
        }),
      });
      
      if (!response.ok) {
        throw new Error(`GitHub MCP API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error pushing changes with GitHub MCP:', error);
      throw error;
    }
  }
};

// Export all services
export const mcpServices = {
  context7: context7Service,
  taskmaster: taskmasterService,
  magicUI: magicUIService,
  memory: memoryService,
  knowledge: knowledgeService,
  githubMCP: githubMCPService
};
