/**
 * MCP Servers Configuration
 *
 * This file contains the configuration for all MCP servers used in the Sunday School Transformation project.
 * Each server has its own configuration section with endpoints, API keys, and other relevant settings.
 */

export interface MCPServerConfig {
  name: string;
  description: string;
  baseUrl: string;
  apiKey?: string;
  endpoints: Record<string, string>;
  isEnabled: boolean;
}

/**
 * Heroku-MCP Server Configuration
 * Used for application hosting and deployment
 */
export const herokuMCPConfig: MCPServerConfig = {
  name: 'Heroku-MCP',
  description: 'Cloud platform for hosting applications',
  baseUrl: process.env.HEROKU_MCP_BASE_URL || 'https://api.heroku-mcp.example.com',
  apiKey: process.env.HEROKU_MCP_API_KEY,
  endpoints: {
    deploy: '/deploy',
    status: '/status',
    logs: '/logs',
    scale: '/scale',
  },
  isEnabled: process.env.ENABLE_HEROKU_MCP === 'true',
};

/**
 * Context7 Server Configuration
 * Used for context management and personalization
 */
export const context7Config: MCPServerConfig = {
  name: 'Context7',
  description: 'Context management system',
  baseUrl: process.env.CONTEXT7_BASE_URL || 'https://api.context7.example.com',
  apiKey: process.env.CONTEXT7_API_KEY,
  endpoints: {
    createContext: '/contexts',
    getContext: '/contexts/:id',
    updateContext: '/contexts/:id',
    deleteContext: '/contexts/:id',
    queryContext: '/contexts/query',
  },
  isEnabled: process.env.ENABLE_CONTEXT7 === 'true',
};

/**
 * Taskmaster (Claude) Server Configuration
 * Used for AI-powered task management
 */
export const taskmasterConfig: MCPServerConfig = {
  name: 'Taskmaster (Claude)',
  description: 'AI-powered task management system',
  baseUrl: process.env.TASKMASTER_BASE_URL || 'https://api.taskmaster.example.com',
  apiKey: process.env.TASKMASTER_API_KEY,
  endpoints: {
    createTask: '/tasks',
    getTask: '/tasks/:id',
    updateTask: '/tasks/:id',
    deleteTask: '/tasks/:id',
    assignTask: '/tasks/:id/assign',
    completeTask: '/tasks/:id/complete',
    generateTasks: '/generate',
  },
  isEnabled: process.env.ENABLE_TASKMASTER === 'true',
};

/**
 * MagicUI Server Configuration
 * Used for UI components and design system
 */
export const magicUIConfig: MCPServerConfig = {
  name: 'MagicUI',
  description: 'UI component library and design system',
  baseUrl: process.env.MAGICUI_BASE_URL || 'https://api.magicui.example.com',
  apiKey: process.env.MAGICUI_API_KEY,
  endpoints: {
    getComponents: '/components',
    getComponent: '/components/:id',
    getTheme: '/theme',
    updateTheme: '/theme',
    getAssets: '/assets',
  },
  isEnabled: process.env.ENABLE_MAGICUI === 'true',
};

/**
 * Memory Server Configuration
 * Used for data storage and retrieval
 */
export const memoryConfig: MCPServerConfig = {
  name: 'Memory',
  description: 'Data storage and retrieval system',
  baseUrl: process.env.MEMORY_BASE_URL || 'https://api.memory.example.com',
  apiKey: process.env.MEMORY_API_KEY,
  endpoints: {
    store: '/store',
    retrieve: '/retrieve',
    update: '/update',
    delete: '/delete',
    query: '/query',
    batch: '/batch',
  },
  isEnabled: process.env.ENABLE_MEMORY === 'true',
};

/**
 * Knowledge Server Configuration
 * Used for knowledge base and information management
 */
export const knowledgeConfig: MCPServerConfig = {
  name: 'Knowledge',
  description: 'Knowledge base and information management system',
  baseUrl: process.env.KNOWLEDGE_BASE_URL || 'https://api.knowledge.example.com',
  apiKey: process.env.KNOWLEDGE_API_KEY,
  endpoints: {
    search: '/search',
    getArticle: '/articles/:id',
    createArticle: '/articles',
    updateArticle: '/articles/:id',
    deleteArticle: '/articles/:id',
    categorize: '/categorize',
    recommend: '/recommend',
  },
  isEnabled: process.env.ENABLE_KNOWLEDGE === 'true',
};

/**
 * GitHub MCP Server Configuration
 * Used for GitHub integration and CI/CD management
 */
export const githubMCPConfig: MCPServerConfig = {
  name: 'GitHub MCP',
  description: 'GitHub integration and CI/CD management',
  baseUrl: process.env.GITHUB_MCP_BASE_URL || 'https://api.github-mcp.example.com',
  apiKey: process.env.GITHUB_MCP_API_KEY,
  endpoints: {
    repositories: '/repositories',
    repository: '/repositories/:id',
    branches: '/repositories/:id/branches',
    branch: '/repositories/:id/branches/:branch',
    commits: '/repositories/:id/commits',
    commit: '/repositories/:id/commits/:sha',
    pullRequests: '/repositories/:id/pull-requests',
    pullRequest: '/repositories/:id/pull-requests/:number',
    workflows: '/repositories/:id/workflows',
    workflow: '/repositories/:id/workflows/:workflow_id',
    workflowRuns: '/repositories/:id/workflow-runs',
    workflowRun: '/repositories/:id/workflow-runs/:run_id',
  },
  isEnabled: process.env.ENABLE_GITHUB_MCP === 'true',
};

/**
 * All MCP server configurations
 */
export const mcpServers: Record<string, MCPServerConfig> = {
  herokuMCP: herokuMCPConfig,
  context7: context7Config,
  taskmaster: taskmasterConfig,
  magicUI: magicUIConfig,
  memory: memoryConfig,
  knowledge: knowledgeConfig,
  githubMCP: githubMCPConfig,
};

export default mcpServers;
