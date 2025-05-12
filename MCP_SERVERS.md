# MCP Servers

This document provides information about the MCP (Master Control Program) servers used in the Sunday School Transformation project.

## Overview

The project integrates with the following MCP servers:

1. **Heroku-MCP**: Cloud platform for hosting applications
2. **Context7**: Context management system
3. **Taskmaster (Claude)**: AI-powered task management system
4. **MagicUI**: UI component library and design system
5. **Memory**: Data storage and retrieval system
6. **Knowledge**: Knowledge base and information management system
7. **GitHub MCP**: GitHub integration and CI/CD management

## Configuration

All MCP servers are configured through environment variables in the `.env.local` file. Each server has its own set of configuration variables, including:

- Base URL
- API Key
- Secret
- Authentication Token
- Port
- Enable/Disable flag

Example configuration for Heroku-MCP:

```
# Heroku-MCP
HEROKU_MCP_BASE_URL=https://api.heroku-mcp.example.com
HEROKU_MCP_API_KEY=your_heroku_mcp_api_key
HEROKU_MCP_SECRET=your_heroku_mcp_secret
HEROKU_MCP_AUTH_TOKEN=your_heroku_mcp_auth_token
HEROKU_MCP_PORT=3001
ENABLE_HEROKU_MCP=true
```

## Starting MCP Servers

### Starting All Servers

To start all MCP servers at once, run:

```bash
npm run start:mcp-servers
```

This command will:
1. Check for port availability
2. Find alternative ports if needed
3. Start all enabled MCP servers in parallel
4. Provide real-time status updates

### Starting Individual Servers

You can also start individual MCP servers:

```bash
npm run start:heroku-mcp
npm run start:context7
npm run start:taskmaster
npm run start:magicui
npm run start:memory
npm run start:knowledge
npm run start:github-mcp
```

### Development with MCP Servers

To start the Next.js development server along with all MCP servers:

```bash
npm run dev:with-mcp
```

## Port Management

The system automatically scans ports before starting servers to avoid conflicts. If a preferred port is already in use, the system will find an available port.

Default ports:
- Heroku-MCP: 3001
- Context7: 3002
- Taskmaster: 3003
- MagicUI: 3004
- Memory: 3005
- Knowledge: 3006
- GitHub MCP: 3007

You can manually scan ports using:

```bash
npm run scan-ports
```

## OpenRouter Integration

The project integrates with OpenRouter for AI capabilities. Configure OpenRouter in the `.env.local` file:

```
# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_API_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3-opus-20240229
OPENROUTER_FALLBACK_MODEL=anthropic/claude-3-sonnet-20240229
```

## Service Architecture

Each MCP server has a corresponding service class that handles API communication:

- `HerokuMCPService`: Manages application hosting and deployment
- `Context7Service`: Handles context management and personalization
- `TaskmasterService`: Provides AI-powered task management
- `MagicUIService`: Manages UI components and design system
- `MemoryService`: Handles data storage and retrieval
- `KnowledgeService`: Manages knowledge base and information
- `GitHubMCPService`: Handles GitHub integration and CI/CD

These services are available through the unified `services` object:

```typescript
import { services } from '@/services';

// Example: Using the Taskmaster service
const tasks = await services.taskmaster.generateTasks({
  context: 'Sunday School lesson planning',
  count: 5,
});
```

## Troubleshooting

If you encounter issues with MCP servers:

1. Check the server status using the MCP Server Status component
2. Verify that the correct environment variables are set in `.env.local`
3. Check for port conflicts using `npm run scan-ports`
4. Review the server logs (available in the terminal when running `start:mcp-servers`)
5. Ensure that the server is enabled in the configuration
