# MCP Servers Documentation

This document provides detailed information about the MCP (Microservice Communication Protocol) servers used in the Sunday School Transformation project.

## Overview

The project uses 7 MCP servers, each responsible for a specific functionality:

1. **Heroku-MCP**: Manages Heroku deployments and cloud resources
2. **Context7**: Provides context-aware information and document retrieval
3. **Taskmaster (Claude)**: AI-powered task management using Claude models
4. **MagicUI**: UI generation and management
5. **Memory**: Persistent storage and retrieval of information
6. **Knowledge**: Knowledge base and information retrieval
7. **GitHub MCP**: GitHub integration for version control and CI/CD

## Server Details

### 1. Heroku-MCP

**Port**: 3001 (default)  
**API Key Required**: No  
**Description**: Manages Heroku deployments, app configurations, and resource scaling.

**Key Endpoints**:
- `GET /health`: Health check endpoint
- `POST /deploy`: Deploy an application to Heroku
- `GET /apps`: List all Heroku applications
- `GET /apps/:id`: Get details of a specific application
- `PUT /apps/:id/scale`: Scale an application's resources

### 2. Context7

**Port**: 3002 (default)  
**API Key Required**: No  
**Description**: Provides context-aware information retrieval and document management.

**Key Endpoints**:
- `GET /health`: Health check endpoint
- `POST /context`: Create a new context
- `GET /context/:id`: Get a specific context
- `PUT /context/:id`: Update a context
- `DELETE /context/:id`: Delete a context
- `POST /search`: Search for information within contexts

### 3. Taskmaster (Claude)

**Port**: 3003 (default)  
**API Key Required**: Yes (Anthropic/Claude API key)  
**Description**: AI-powered task management system using Claude models.

**Key Endpoints**:
- `GET /health`: Health check endpoint
- `POST /tasks`: Create a new task
- `GET /tasks`: List all tasks
- `GET /tasks/:id`: Get a specific task
- `PUT /tasks/:id`: Update a task
- `DELETE /tasks/:id`: Delete a task
- `POST /tasks/:id/complete`: Mark a task as complete
- `POST /generate`: Generate task suggestions using AI

### 4. MagicUI

**Port**: 3004 (default)  
**API Key Required**: Yes (OpenAI API key)  
**Description**: UI generation and management system.

**Key Endpoints**:
- `GET /health`: Health check endpoint
- `POST /generate`: Generate UI components
- `GET /components`: List available components
- `GET /components/:id`: Get a specific component
- `POST /preview`: Generate a preview of a UI design

### 5. Memory

**Port**: 3005 (default)  
**API Key Required**: No  
**Description**: Persistent storage and retrieval of information.

**Key Endpoints**:
- `GET /health`: Health check endpoint
- `POST /memories`: Store a new memory
- `GET /memories`: Retrieve all memories
- `GET /memories/:id`: Retrieve a specific memory
- `PUT /memories/:id`: Update a memory
- `DELETE /memories/:id`: Delete a memory
- `POST /memories/search`: Search memories

### 6. Knowledge

**Port**: 3006 (default)  
**API Key Required**: No  
**Description**: Knowledge base and information retrieval system.

**Key Endpoints**:
- `GET /health`: Health check endpoint
- `POST /knowledge`: Add new knowledge
- `GET /knowledge`: Retrieve all knowledge entries
- `GET /knowledge/:id`: Retrieve a specific knowledge entry
- `PUT /knowledge/:id`: Update a knowledge entry
- `DELETE /knowledge/:id`: Delete a knowledge entry
- `POST /knowledge/search`: Search knowledge base

### 7. GitHub MCP

**Port**: 3007 (default)  
**API Key Required**: Yes (GitHub API key)  
**Description**: GitHub integration for version control and CI/CD.

**Key Endpoints**:
- `GET /health`: Health check endpoint
- `POST /repos`: Create a new repository
- `GET /repos`: List repositories
- `GET /repos/:owner/:repo`: Get repository details
- `POST /repos/:owner/:repo/pull`: Create a pull request
- `GET /repos/:owner/:repo/pulls`: List pull requests
- `POST /repos/:owner/:repo/issues`: Create an issue
- `GET /repos/:owner/:repo/issues`: List issues

## Starting MCP Servers

### Starting All Servers

To start all MCP servers at once:

```bash
npm run start:mcp-servers
```

This will:
1. Check port availability
2. Start all servers in parallel
3. Verify that all servers are running correctly

### Starting Individual Servers

To start individual MCP servers:

```bash
npm run start:heroku-mcp
npm run start:context7
npm run start:taskmaster
npm run start:magicui
npm run start:memory
npm run start:knowledge
npm run start:github-mcp
```

### Verifying Server Status

To verify that all MCP servers are running correctly:

```bash
npm run verify:mcp-servers
```

## Configuration

MCP servers can be configured using environment variables in the `.env.local` file. See the `.env.example` file for available configuration options.

## Troubleshooting

### Common Issues

1. **Port already in use**: If a port is already in use, the server will automatically try to use an alternative port.

2. **API key not provided**: If an API key is required but not provided, the server will start but certain functionality may be limited.

3. **Connection refused**: Ensure that the server is running and the port is correct.

4. **Server crashes**: Check the logs for error messages. Logs are stored in the `logs` directory.

### Debugging

To enable debug mode for more detailed logging:

```bash
DEBUG_MCP_SERVERS=true npm run start:mcp-servers
```

## API Documentation

For detailed API documentation, see the [API Documentation](./API.md) file.
