# Sunday School Transformation

A modern platform for transforming Sunday School experiences using cutting-edge technology and MCP servers with **exponential enhancements** for development productivity.

## 🚀 Exponential Enhancements

This project has been exponentially enhanced with:

- **🎯 Intelligent Port Management**: Automatic port conflict resolution and dynamic port allocation
- **🔍 Real-time Health Monitoring**: Continuous server health checks with status indicators
- **🤖 OpenRouter AI Integration**: Seamless AI capabilities with fallback model support
- **🎨 Enhanced Developer UX**: Colored output, status indicators, and comprehensive logging
- **⚡ Retry Logic & Error Recovery**: Automatic retry mechanisms with graceful degradation
- **🛡️ Robust Error Handling**: Comprehensive error catching and graceful shutdown
- **📊 Advanced Verification**: Multi-layered server verification with detailed reporting
- **🔄 Continuous Monitoring**: Real-time monitoring mode for development
- **🔧 Development-First Design**: Optimized for development workflow and productivity

## MCP Servers

This project integrates with the following MCP servers:

1. **Heroku-MCP**: Cloud platform for hosting applications
2. **Context7**: Context management system
3. **Taskmaster (Claude)**: AI-powered task management system with OpenRouter integration
4. **MagicUI**: UI component library and design system
5. **Memory**: Data storage and retrieval system
6. **Knowledge**: Knowledge base and information management system
7. **GitHub MCP**: GitHub integration and CI/CD management

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Quick Setup

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd sunday-school-transformation
   npm run setup:dev
   ```

2. **Configure environment**:
   ```bash
   # Edit .env.local with your API keys
   nano .env.local
   ```

3. **Start development**:
   ```bash
   npm run dev:with-mcp
   ```

### Manual Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sunday-school-transformation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   npm run setup:env
   ```

4. Update the `.env.local` file with your MCP server API keys and configuration.

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# OpenRouter Configuration (Required for AI features)
OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
OPENROUTER_API_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=google/gemini-2.5-pro-exp-03-25
OPENROUTER_FALLBACK_MODEL=mistralai/mistral-small-3.1-24b-instruct:free

# Taskmaster (Claude) - AI-powered task management
TASKMASTER_BASE_URL=https://api.taskmaster.example.com
TASKMASTER_API_KEY=your_taskmaster_api_key
TASKMASTER_MODEL=anthropic/claude-3-opus-20240229
ENABLE_TASKMASTER=true

# MagicUI - UI component library
MAGICUI_BASE_URL=https://api.magicui.example.com
MAGICUI_API_KEY=your_magicui_api_key
ENABLE_MAGICUI=true

# GitHub MCP - GitHub integration
GITHUB_MCP_BASE_URL=https://api.github-mcp.example.com
GITHUB_MCP_API_KEY=your_github_mcp_api_key
ENABLE_GITHUB_MCP=true

# Other MCP Servers (No API keys required)
HEROKU_MCP_BASE_URL=https://api.heroku-mcp.example.com
ENABLE_HEROKU_MCP=true

CONTEXT7_BASE_URL=https://api.context7.example.com
ENABLE_CONTEXT7=true

MEMORY_BASE_URL=https://api.memory.example.com
ENABLE_MEMORY=true

KNOWLEDGE_BASE_URL=https://api.knowledge.example.com
ENABLE_KNOWLEDGE=true
```

## Enhanced Development Workflow

### 🎯 One-Command Development

Start everything with a single command:
```bash
npm run dev:with-mcp
```

This will:
- ✅ Scan ports for conflicts
- ✅ Start all enabled MCP servers with intelligent port management
- ✅ Launch Next.js development server
- ✅ Provide real-time status monitoring
- ✅ Enable graceful shutdown with Ctrl+C

### 🔍 Advanced Verification

Verify all servers with comprehensive health checks:
```bash
npm run verify:mcp-servers
```

**Enhanced verification includes:**
- ✅ Server health status
- ✅ API functionality testing
- ✅ OpenRouter AI integration testing
- ✅ Port availability checks
- ✅ API key validation
- ✅ Detailed error reporting

### 📊 Continuous Monitoring

Monitor servers in real-time:
```bash
npm run verify:mcp-servers --continuous
```

### 🛠️ Individual Server Management

Start individual servers:
```bash
npm run start:heroku-mcp
npm run start:context7
npm run start:taskmaster
npm run start:magicui
npm run start:memory
npm run start:knowledge
npm run start:github-mcp
```

### 🔧 Utility Commands

```bash
# Port scanning
npm run scan-ports

# Environment setup
npm run setup:env

# Clean and reset
npm run clean
npm run reset

# Full development with verification
npm run dev:full
```

## Enhanced MCP Server Features

### 🤖 OpenRouter AI Integration

Servers with AI capabilities (like Taskmaster) include:
- **Default Model**: `google/gemini-2.5-pro-exp-03-25`
- **Fallback Model**: `mistralai/mistral-small-3.1-24b-instruct:free`
- **AI Endpoint**: `POST /api/ai/chat`
- **Automatic Fallback**: Seamless model switching on errors

### 🎨 Enhanced Server UI

Each MCP server provides:
- **Modern Web Interface**: Beautiful, responsive dashboard
- **Real-time Status**: Live health and configuration status
- **API Documentation**: Interactive endpoint documentation
- **Configuration Status**: Visual indicators for API keys and settings

### ⚡ Performance Optimizations

- **Intelligent Port Management**: Automatic conflict resolution
- **Retry Logic**: 3 retry attempts with exponential backoff
- **Health Monitoring**: Real-time status updates every 30 seconds
- **Graceful Shutdown**: Proper cleanup and resource management

## Port Configuration

The enhanced system automatically handles port management:

- **Default Ports**: 3001-3007 for MCP servers
- **Conflict Resolution**: Automatic port finding if defaults are busy
- **Dynamic Allocation**: Servers adapt to available ports
- **Status Reporting**: Clear indication of actual ports in use

## API Key Requirements

| MCP Server | API Key Required | OpenRouter AI | Description |
|------------|------------------|---------------|-------------|
| OpenRouter | ✅ Yes | ✅ Yes | AI model access |
| Heroku-MCP | ❌ No | ❌ No | Cloud hosting |
| Context7 | ❌ No | ❌ No | Context management |
| Taskmaster (Claude) | ✅ Yes | ✅ Yes | AI task management |
| MagicUI | ✅ Yes | ❌ No | UI components |
| Memory | ❌ No | ❌ No | Data storage |
| Knowledge | ❌ No | ❌ No | Knowledge base |
| GitHub MCP | ✅ Yes | ❌ No | GitHub integration |

## Project Structure

```
sunday-school-transformation/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── config/              # Configuration files
│   │   ├── mcp-servers.ts   # MCP server configuration
│   │   └── ports.ts         # Port configuration
│   ├── services/            # MCP server services
│   │   ├── base-mcp-service.ts
│   │   ├── heroku-mcp-service.ts
│   │   ├── context7-service.ts
│   │   ├── taskmaster-service.ts
│   │   ├── magicui-service.ts
│   │   ├── memory-service.ts
│   │   ├── knowledge-service.ts
│   │   └── index.ts
│   └── utils/               # Utility functions
│       └── port-scanner.ts  # Port scanning utility
├── scripts/                 # Enhanced helper scripts
│   ├── scan-ports.js        # Port scanning script
│   ├── mcp-server.js        # Enhanced individual MCP server
│   ├── start-all-mcp-servers.js # Enhanced startup system
│   ├── verify-mcp-servers.js # Enhanced verification
├── public/                  # Static assets
├── .env.local               # Environment variables (create this)
├── .env.local.example       # Example environment variables
├── next.config.js           # Next.js configuration
├── package.json             # Enhanced project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This documentation
```

## Development Process

This project follows an enhanced development process:

1. **🚀 Quick Setup**: One-command environment setup
2. **🔍 Intelligent Verification**: Comprehensive health checks
3. **⚡ Fast Development**: Hot reload with MCP server integration
4. **🛡️ Robust Testing**: Multi-layer verification and monitoring
5. **🎯 Production Ready**: Optimized for deployment and scaling

## Troubleshooting

### Common Issues

**Port Conflicts:**
```bash
npm run scan-ports
npm run start:mcp-servers
```

**API Key Issues:**
```bash
# Check .env.local configuration
npm run verify:mcp-servers
```

**Server Startup Problems:**
```bash
# Clean and reset
npm run reset
npm run dev:with-mcp
```

### Enhanced Error Reporting

The system provides detailed error information:
- ✅ Colored output for different message types
- ✅ Timestamped logs with server identification
- ✅ Specific error messages with troubleshooting tips
- ✅ Health check results with status indicators

## OpenRouter Integration

This project integrates with OpenRouter for AI capabilities:

- **API Endpoint**: `https://openrouter.ai/api/v1`
- **Default Model**: `google/gemini-2.5-pro-exp-03-25`
- **Fallback Model**: `mistralai/mistral-small-3.1-24b-instruct:free`
- **Features**: Automatic fallback, error handling, model switching

### AI Usage Example

```bash
# Test AI integration
curl -X POST http://localhost:3003/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-taskmaster-api-key" \
  -d '{"prompt": "Hello, how can you help with Sunday School?"}'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run verify:mcp-servers`
5. Submit a pull request

## License

This project is licensed under the MIT License.
