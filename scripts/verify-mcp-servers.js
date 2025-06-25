#!/usr/bin/env node

/**
 * Enhanced MCP Server Verification
 * 
 * This script provides comprehensive verification of all MCP servers with:
 * - Real-time health monitoring
 * - API functionality testing
 * - OpenRouter integration testing
 * - Enhanced error reporting
 * - Colored output and status indicators
 * - Development-focused diagnostics
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(chalk.green('✓ Loaded environment variables from .env.local'));
} else {
  console.warn(chalk.yellow('⚠ Warning: .env.local file not found. Using default values.'));
}

// Enhanced MCP Server configurations
const mcpServers = [
  {
    name: 'Heroku-MCP',
    port: parseInt(process.env.HEROKU_MCP_PORT) || 3001,
    requiresApiKey: false,
    enabled: process.env.ENABLE_HEROKU_MCP !== 'false',
  },
  {
    name: 'Context7',
    port: parseInt(process.env.CONTEXT7_PORT) || 3002,
    requiresApiKey: false,
    enabled: process.env.ENABLE_CONTEXT7 !== 'false',
  },
  {
    name: 'Taskmaster (Claude)',
    port: parseInt(process.env.TASKMASTER_PORT) || 3003,
    requiresApiKey: true,
    apiKey: process.env.TASKMASTER_API_KEY,
    enabled: process.env.ENABLE_TASKMASTER === 'true',
    openRouterConfig: {
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'google/gemini-2.5-pro-exp-03-25',
      fallbackModel: process.env.OPENROUTER_FALLBACK_MODEL || 'mistralai/mistral-small-3.1-24b-instruct:free',
    },
  },
  {
    name: 'MagicUI',
    port: parseInt(process.env.MAGICUI_PORT) || 3004,
    requiresApiKey: true,
    apiKey: process.env.MAGICUI_API_KEY,
    enabled: process.env.ENABLE_MAGICUI === 'true',
  },
  {
    name: 'Memory',
    port: parseInt(process.env.MEMORY_PORT) || 3005,
    requiresApiKey: false,
    enabled: process.env.ENABLE_MEMORY !== 'false',
  },
  {
    name: 'Knowledge',
    port: parseInt(process.env.KNOWLEDGE_PORT) || 3006,
    requiresApiKey: false,
    enabled: process.env.ENABLE_KNOWLEDGE !== 'false',
  },
  {
    name: 'GitHub MCP',
    port: parseInt(process.env.GITHUB_MCP_PORT) || 3007,
    requiresApiKey: true,
    apiKey: process.env.GITHUB_MCP_API_KEY,
    enabled: process.env.ENABLE_GITHUB_MCP === 'true',
  },
];

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}]`;
  
  switch (type) {
    case 'success':
      console.log(chalk.green(`${prefix} ✓ ${message}`));
      break;
    case 'error':
      console.log(chalk.red(`${prefix} ✗ ${message}`));
      break;
    case 'warning':
      console.log(chalk.yellow(`${prefix} ⚠ ${message}`));
      break;
    case 'info':
      console.log(chalk.blue(`${prefix} ℹ ${message}`));
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

function logServer(serverName, message, type = 'info') {
  log(`[${serverName}] ${message}`, type);
}

// Enhanced health check function
async function checkServerHealth(server) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: server.port,
      path: '/health',
      method: 'GET',
      timeout: 5000,
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve({
              name: server.name,
              status: 'online',
              port: server.port,
              response,
              healthCheck: 'passed',
            });
          } catch (error) {
            resolve({
              name: server.name,
              status: 'online',
              port: server.port,
              healthCheck: 'failed',
              error: 'Invalid JSON response',
            });
          }
        } else {
          resolve({
            name: server.name,
            status: 'online',
            port: server.port,
            healthCheck: 'failed',
            statusCode: res.statusCode,
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name: server.name,
        status: 'offline',
        port: server.port,
        healthCheck: 'failed',
        error: error.message,
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: server.name,
        status: 'timeout',
        port: server.port,
        healthCheck: 'failed',
        error: 'Request timed out',
      });
    });
    
    req.end();
  });
}

// Enhanced API functionality test
async function checkServerAPI(server) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: server.port,
      path: '/api/status',
      method: 'GET',
      timeout: 5000,
      headers: {},
    };
    
    // Add API key if required
    if (server.requiresApiKey && server.apiKey) {
      options.headers['Authorization'] = `Bearer ${server.apiKey}`;
    }
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve({
              name: server.name,
              status: 'online',
              port: server.port,
              apiStatus: 'working',
              response,
            });
          } catch (error) {
            resolve({
              name: server.name,
              status: 'online',
              port: server.port,
              apiStatus: 'error',
              error: 'Invalid JSON response',
            });
          }
        } else if (res.statusCode === 401) {
          resolve({
            name: server.name,
            status: 'online',
            port: server.port,
            apiStatus: 'unauthorized',
            statusCode: res.statusCode,
            error: 'API key required or invalid',
          });
        } else {
          resolve({
            name: server.name,
            status: 'online',
            port: server.port,
            apiStatus: 'error',
            statusCode: res.statusCode,
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name: server.name,
        status: 'offline',
        port: server.port,
        apiStatus: 'failed',
        error: error.message,
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: server.name,
        status: 'timeout',
        port: server.port,
        apiStatus: 'failed',
        error: 'Request timed out',
      });
    });
    
    req.end();
  });
}

// OpenRouter AI integration test
async function testOpenRouterIntegration(server) {
  if (!server.openRouterConfig?.apiKey) {
    return {
      name: server.name,
      aiStatus: 'not_configured',
      error: 'OpenRouter API key not configured',
    };
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: server.port,
      path: '/api/ai/chat',
      method: 'POST',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        ...(server.requiresApiKey && server.apiKey ? { 'Authorization': `Bearer ${server.apiKey}` } : {}),
      },
    };
    
    const postData = JSON.stringify({
      prompt: 'Hello, this is a test message to verify AI integration.',
      model: server.openRouterConfig.defaultModel,
    });
    
    options.headers['Content-Length'] = Buffer.byteLength(postData);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve({
              name: server.name,
              aiStatus: 'working',
              response: response.response,
              model: response.model,
            });
          } catch (error) {
            resolve({
              name: server.name,
              aiStatus: 'error',
              error: 'Invalid JSON response from AI endpoint',
            });
          }
        } else if (res.statusCode === 401) {
          resolve({
            name: server.name,
            aiStatus: 'unauthorized',
            error: 'API key required for AI endpoint',
          });
        } else {
          resolve({
            name: server.name,
            aiStatus: 'error',
            statusCode: res.statusCode,
            error: `AI endpoint returned status ${res.statusCode}`,
          });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({
        name: server.name,
        aiStatus: 'failed',
        error: error.message,
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: server.name,
        aiStatus: 'timeout',
        error: 'AI request timed out',
      });
    });
    
    req.write(postData);
    req.end();
  });
}

// Enhanced verification function
async function verifyAllServers() {
  console.log(chalk.cyan('🔍 Enhanced MCP Server Verification'));
  console.log(chalk.cyan('='.repeat(60)));
  
  // Filter enabled servers
  const enabledServers = mcpServers.filter(server => server.enabled);
  
  if (enabledServers.length === 0) {
    log('No MCP servers are enabled. Check your .env.local configuration.', 'warning');
    return;
  }
  
  log(`Verifying ${enabledServers.length} MCP servers...`, 'info');
  console.log();
  
  const results = [];
  
  for (const server of enabledServers) {
    logServer(server.name, 'Starting verification...', 'info');
    
    // Health check
    const healthResult = await checkServerHealth(server);
    results.push(healthResult);
    
    // API check
    const apiResult = await checkServerAPI(server);
    results.push(apiResult);
    
    // AI integration check (if applicable)
    if (server.openRouterConfig) {
      const aiResult = await testOpenRouterIntegration(server);
      results.push(aiResult);
    }
    
    // Add delay between servers
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Generate comprehensive report
  console.log(chalk.cyan('\n' + '='.repeat(60)));
  console.log(chalk.cyan('📊 Verification Report'));
  console.log(chalk.cyan('='.repeat(60)));
  
  const serverReports = {};
  
  for (const result of results) {
    if (!serverReports[result.name]) {
      serverReports[result.name] = {};
    }
    
    if (result.healthCheck !== undefined) {
      serverReports[result.name].health = result;
    } else if (result.apiStatus !== undefined) {
      serverReports[result.name].api = result;
    } else if (result.aiStatus !== undefined) {
      serverReports[result.name].ai = result;
    }
  }
  
  let totalServers = 0;
  let healthyServers = 0;
  let apiWorkingServers = 0;
  let aiWorkingServers = 0;
  
  for (const [serverName, report] of Object.entries(serverReports)) {
    totalServers++;
    
    console.log(chalk.blue(`\n${serverName}:`));
    
    // Health status
    if (report.health) {
      const healthStatus = report.health.healthCheck === 'passed' ? chalk.green('✓ Healthy') : chalk.red('✗ Unhealthy');
      console.log(`  Health: ${healthStatus}`);
      if (report.health.healthCheck === 'passed') healthyServers++;
    }
    
    // API status
    if (report.api) {
      const apiStatus = report.api.apiStatus === 'working' ? chalk.green('✓ Working') : chalk.red('✗ Failed');
      console.log(`  API: ${apiStatus}`);
      if (report.api.apiStatus === 'working') apiWorkingServers++;
      
      if (report.api.apiStatus === 'unauthorized') {
        console.log(chalk.yellow(`    ⚠ API key required or invalid`));
      }
    }
    
    // AI status
    if (report.ai) {
      const aiStatus = report.ai.aiStatus === 'working' ? chalk.green('✓ Working') : chalk.red('✗ Failed');
      console.log(`  AI: ${aiStatus}`);
      if (report.ai.aiStatus === 'working') aiWorkingServers++;
      
      if (report.ai.aiStatus === 'not_configured') {
        console.log(chalk.yellow(`    ⚠ OpenRouter API key not configured`));
      }
    }
    
    // Port information
    const port = report.health?.port || report.api?.port || report.ai?.port;
    if (port) {
      console.log(`  Port: ${port}`);
    }
  }
  
  // Summary
  console.log(chalk.cyan('\n' + '='.repeat(60)));
  console.log(chalk.cyan('📈 Summary'));
  console.log(chalk.cyan('='.repeat(60)));
  
  console.log(`Total Servers: ${totalServers}`);
  console.log(`Healthy Servers: ${healthyServers}/${totalServers}`);
  console.log(`API Working: ${apiWorkingServers}/${totalServers}`);
  console.log(`AI Working: ${aiWorkingServers}/${totalServers}`);
  
  const overallHealth = healthyServers === totalServers;
  console.log(`\nOverall Status: ${overallHealth ? chalk.green('✓ All Good') : chalk.red('✗ Issues Found')}`);
  
  if (!overallHealth) {
    console.log(chalk.yellow('\n🔧 Troubleshooting Tips:'));
    console.log(chalk.yellow('  1. Check if all MCP servers are running: npm run start:mcp-servers'));
    console.log(chalk.yellow('  2. Verify API keys in .env.local file'));
    console.log(chalk.yellow('  3. Check for port conflicts: npm run scan-ports'));
    console.log(chalk.yellow('  4. Review server logs for specific errors'));
  } else {
    console.log(chalk.green('\n✨ All systems operational! Ready for development.'));
  }
  
  console.log(chalk.cyan('\n' + '='.repeat(60)));
}

// Continuous monitoring mode
async function startContinuousMonitoring() {
  console.log(chalk.cyan('🔄 Starting continuous monitoring mode...'));
  console.log(chalk.yellow('Press Ctrl+C to stop monitoring'));
  
  const monitorInterval = setInterval(async () => {
    console.log(chalk.cyan('\n' + '='.repeat(40)));
    console.log(chalk.cyan(`Monitoring Update - ${new Date().toLocaleTimeString()}`));
    console.log(chalk.cyan('='.repeat(40)));
    
    await verifyAllServers();
  }, 30000); // Check every 30 seconds
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(monitorInterval);
    console.log(chalk.yellow('\nMonitoring stopped.'));
    process.exit(0);
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const isContinuous = args.includes('--continuous') || args.includes('-c');
  
  if (isContinuous) {
    await startContinuousMonitoring();
  } else {
    await verifyAllServers();
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`, 'error');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'error');
  process.exit(1);
});

// Start verification
main().catch((error) => {
  log(`Verification failed: ${error.message}`, 'error');
  process.exit(1);
}); 