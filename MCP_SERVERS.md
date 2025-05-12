# MCP Servers Documentation

This document provides detailed information about the MCP (Master Control Program) servers used in the Bible Study Tracker application.

## Overview

MCP servers are specialized microservices that provide enhanced functionality for the application. Each server has a specific purpose and can be used independently or in combination with other servers.

## Server List

| Server | Port | Purpose | API Key Required |
|--------|------|---------|------------------|
| Context7 | 3002 | Context management | No |
| Taskmaster | 3003 | AI task orchestration | Yes |
| MagicUI | 3004 | UI components and design | Yes |
| Memory | 3005 | Caching and data storage | No |
| Knowledge | 3006 | Bible reference information | No |
| GitHub MCP | 3007 | Repository management | Yes |

## Starting MCP Servers

To start all MCP servers at once:

```bash
npm run start:mcp-servers
```

This will start all servers in separate processes and monitor their status.

## Verifying MCP Servers

To verify that all MCP servers are running correctly:

```bash
npm run verify:mcp-servers
```

This will check if all servers are accessible and their APIs are working properly.

## Server Details

### Context7

**Purpose**: Manages user preferences and session context.

**Endpoints**:
- `GET /api/health`: Health check
- `POST /api/context`: Store context data
- `GET /api/context`: Retrieve context data
- `DELETE /api/context/:key`: Delete context data

**Example Usage**:
```javascript
// Store context
await fetch('http://localhost:3002/api/context', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'session_1',
    data: { preference: 'dark_mode' },
    tags: ['session', 'preferences']
  })
});

// Retrieve context
const response = await fetch('http://localhost:3002/api/context?key=session_1');
const data = await response.json();
```

### Taskmaster

**Purpose**: Orchestrates AI processing tasks and manages fallback processing.

**Endpoints**:
- `GET /api/health`: Health check
- `POST /api/tasks`: Create a new task
- `GET /api/tasks/:id`: Get task status
- `GET /api/tasks`: List all tasks

**Example Usage**:
```javascript
// Create a task
const response = await fetch('http://localhost:3003/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_taskmaster_api_key'
  },
  body: JSON.stringify({
    task_type: 'generate_ai_content',
    inputs: {
      scripture: 'John 3:16',
      transcription: '...',
      plaud_synopsis: '...'
    }
  })
});
```

### MagicUI

**Purpose**: Provides UI component templates and design system.

**Endpoints**:
- `GET /api/health`: Health check
- `GET /api/components`: Get UI components
- `GET /api/theme`: Get theme configuration

**Example Usage**:
```javascript
// Get UI components
const response = await fetch('http://localhost:3004/api/components?page=dashboard', {
  headers: {
    'Authorization': 'Bearer your_magicui_api_key'
  }
});
const data = await response.json();
```

### Memory

**Purpose**: Caches API responses and stores session data for quick retrieval.

**Endpoints**:
- `GET /api/health`: Health check
- `POST /api/memory`: Store data
- `GET /api/memory`: Retrieve data
- `DELETE /api/memory/:key`: Delete data

**Example Usage**:
```javascript
// Store data
await fetch('http://localhost:3005/api/memory', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'sessions',
    value: [...],
    expires_in: 300 // 5 minutes
  })
});

// Retrieve data
const response = await fetch('http://localhost:3005/api/memory?key=sessions');
const data = await response.json();
```

### Knowledge

**Purpose**: Provides Bible reference information and resources.

**Endpoints**:
- `GET /api/health`: Health check
- `GET /api/bible`: Get Bible reference
- `GET /api/bible/cross-references`: Get cross-references
- `GET /api/resources`: Get resources

**Example Usage**:
```javascript
// Get Bible reference
const response = await fetch('http://localhost:3006/api/bible?reference=John%203:16');
const data = await response.json();

// Get cross-references
const response = await fetch('http://localhost:3006/api/bible/cross-references?reference=John%203:16');
const data = await response.json();
```

### GitHub MCP

**Purpose**: Manages repository and version control.

**Endpoints**:
- `GET /api/health`: Health check
- `GET /api/repos`: Get repository information
- `POST /api/repos/push`: Push changes to repository

**Example Usage**:
```javascript
// Push changes to repository
await fetch('http://localhost:3007/api/repos/push', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_github_mcp_api_key'
  },
  body: JSON.stringify({
    owner: 'username',
    repo: 'repo-name',
    branch: 'main',
    message: 'Update README',
    files: [
      {
        path: 'README.md',
        content: '# Updated README'
      }
    ]
  })
});
```

## Integration in the Application

The MCP servers are integrated into the application through service modules:

- **Frontend**: `src/lib/mcp-services.ts`
- **Backend**: `services/mcp_services.py`

These modules provide a unified interface for interacting with the MCP servers and handle fallback logic when a server is unavailable.

## Configuration

MCP servers can be configured through environment variables:

- **Frontend**: `.env.local`
- **Backend**: `.env`

Each server can be enabled or disabled individually, and API keys can be provided for servers that require authentication.

## Logging

All MCP server interactions are logged for debugging purposes:

- **Frontend**: Console logs
- **Backend**: Structured JSON logs in the `logs` directory

## Error Handling

The application includes comprehensive error handling for MCP server interactions:

- **Fallback Logic**: When a server is unavailable, the application falls back to alternative implementations
- **Retry Logic**: For critical operations, the application retries failed requests
- **Graceful Degradation**: The application continues to function even when some MCP servers are unavailable
