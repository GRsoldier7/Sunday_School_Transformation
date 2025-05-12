/**
 * Services Index
 *
 * This file exports all MCP server services for easy importing.
 */

export * from './base-mcp-service';
export * from './heroku-mcp-service';
export * from './context7-service';
export * from './taskmaster-service';
export * from './magicui-service';
export * from './memory-service';
export * from './knowledge-service';
export * from './github-mcp-service';

import { HerokuMCPService } from './heroku-mcp-service';
import { Context7Service } from './context7-service';
import { TaskmasterService } from './taskmaster-service';
import { MagicUIService } from './magicui-service';
import { MemoryService } from './memory-service';
import { KnowledgeService } from './knowledge-service';
import { GitHubMCPService } from './github-mcp-service';

// Create singleton instances of each service
export const herokuMCPService = new HerokuMCPService();
export const context7Service = new Context7Service();
export const taskmasterService = new TaskmasterService();
export const magicUIService = new MagicUIService();
export const memoryService = new MemoryService();
export const knowledgeService = new KnowledgeService();
export const githubMCPService = new GitHubMCPService();

// Export all services as a single object
export const services = {
  herokuMCP: herokuMCPService,
  context7: context7Service,
  taskmaster: taskmasterService,
  magicUI: magicUIService,
  memory: memoryService,
  knowledge: knowledgeService,
  githubMCP: githubMCPService,
};
