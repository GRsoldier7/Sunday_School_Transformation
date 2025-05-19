# Sunday School Transformation

A modern platform for transforming Sunday School experiences using cutting-edge technology and MCP servers.

## MCP Servers

This project integrates with the following MCP servers:

1. **Heroku-MCP**: Cloud platform for hosting applications
2. **Context7**: Context management system
3. **Taskmaster (Claude)**: AI-powered task management system
4. **MagicUI**: UI component library and design system
5. **Memory**: Data storage and retrieval system
6. **Knowledge**: Knowledge base and information management system
7. **GitHub MCP**: GitHub integration and CI/CD management

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sunday-school-transformation
   ```

2. Run the setup script to configure your environment:
   ```bash
   npm run setup
   ```

   This script will:
   - Create `.env` and `.env.local` files if they don't exist
   - Install dependencies if needed
   - Check for required API keys
   - Verify port availability
   - Create necessary directories

3. Update the `.env.local` file with your API keys and other sensitive information.

### Environment Configuration

This project uses two environment files:

1. `.env` - Contains default configuration values that are safe to commit to GitHub
2. `.env.local` - Contains sensitive values (API keys, etc.) that should never be committed

#### Setting Up Environment Variables

1. The `.env` file is already included in the repository with safe default values
2. Create a `.env.local` file for your sensitive values:
   ```bash
   cp .env.example .env.local
   ```
3. Edit `.env.local` to add your API keys and other sensitive information

#### Required API Keys

Some MCP servers require API keys to function properly:

- **OpenRouter/Claude**: Required for AI functionality
- **GitHub**: Required for GitHub integration

### Port Configuration

Before starting the application, the system will automatically scan ports to ensure there are no conflicts. If a preferred port is already in use, the application will suggest and use an alternative port.

You can manually scan ports using:

```bash
npm run scan-ports
```

To automatically fix port conflicts:

```bash
npm run scan-ports:fix
```

### MCP Servers

This project integrates with several MCP (Master Control Program) servers:

1. **Heroku-MCP**: Cloud platform for hosting applications
2. **Context7**: Context management system
3. **Taskmaster (Claude)**: AI-powered task management system
4. **MagicUI**: UI component library and design system
5. **Memory**: Data storage and retrieval system
6. **Knowledge**: Knowledge base and information management system
7. **GitHub MCP**: GitHub integration and CI/CD management

#### Starting MCP Servers

To start all MCP servers at once:

```bash
npm run start:mcp-servers
```

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

#### Verifying MCP Servers

To verify that all MCP servers are running correctly:

```bash
npm run verify:mcp-servers
```

This will check if all servers are accessible and their APIs are working properly.

#### API Key Requirements

Not all MCP servers require API keys:

| MCP Server | API Key Required |
|------------|------------------|
| OpenRouter | ✅ Yes |
| Heroku-MCP | ❌ No |
| Context7 | ❌ No |
| Taskmaster (Claude) | ✅ Yes |
| MagicUI | ✅ Yes |
| Memory | ❌ No |
| Knowledge | ❌ No |
| GitHub MCP | ✅ Yes |

For more detailed information about MCP servers, see [MCP_SERVERS.md](MCP_SERVERS.md).

### Development

Start the development server:

```bash
npm run dev
```

This will:
1. Scan ports to avoid conflicts
2. Start the Next.js development server

To start the development server along with all MCP servers:

```bash
npm run dev:with-mcp
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

Build the application for production:

```bash
npm run build
```

### Running in Production

Start the production server:

```bash
npm start
```

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
├── scripts/                 # Helper scripts
│   ├── scan-ports.js        # Port scanning script
│   ├── mcp-server.js        # Individual MCP server implementation
│   ├── start-all-mcp-servers.js # Script to start all MCP servers
│   ├── verify-mcp-servers.js # Script to verify MCP servers are running
├── public/                  # Static assets
├── .env.local.example       # Example environment variables
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Development Process

This project follows the development process outlined in the Vibe Coding Rulebook:

1. **Planning Phase**: Define requirements, create user stories, design architecture
2. **Setup Phase**: Initialize project, set up environment, configure MCP servers
3. **Development Phase**: Implement features, conduct code reviews, maintain documentation
4. **Testing Phase**: Unit testing, integration testing, system testing, user acceptance testing
5. **Deployment Phase**: Prepare environment, deploy to staging, conduct final tests, deploy to production
6. **Maintenance Phase**: Monitor performance, address issues, implement improvements, gather feedback

## OpenRouter Integration

This project integrates with OpenRouter for AI capabilities. Configure OpenRouter in the `.env.local` file:

```
# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_API_URL=https://openrouter.ai/api/v1
OPENROUTER_DEFAULT_MODEL=anthropic/claude-3-opus-20240229
OPENROUTER_FALLBACK_MODEL=anthropic/claude-3-sonnet-20240229
```

## Learn More

This project is built with [Next.js](https://nextjs.org). To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

[MIT](LICENSE)
