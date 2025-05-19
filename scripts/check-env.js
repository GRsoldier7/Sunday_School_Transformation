#!/usr/bin/env node

/**
 * Check Environment Variables
 * 
 * This script checks if all required environment variables are set.
 * It's useful to run before starting the application to ensure everything is configured correctly.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(chalk.blue('Loaded environment variables from .env.local'));
} else {
  console.warn(chalk.yellow('Warning: .env.local file not found. Using default values.'));
}

// Define required environment variables for each MCP server
const requiredEnvVars = {
  'Heroku-MCP': [
    'HEROKU_MCP_PORT'
  ],
  'Context7': [
    'CONTEXT7_PORT'
  ],
  'Taskmaster (Claude)': [
    'TASKMASTER_PORT',
    'ANTHROPIC_API_KEY',
    'CLAUDE_API_KEY'
  ],
  'MagicUI': [
    'MAGICUI_PORT',
    'OPENAI_API_KEY'
  ],
  'Memory': [
    'MEMORY_PORT',
    'SUPABASE_CONNECTION_STRING'
  ],
  'Knowledge': [
    'KNOWLEDGE_PORT',
    'SUPABASE_CONNECTION_STRING'
  ],
  'GitHub MCP': [
    'GITHUB_MCP_PORT',
    'GITHUB_API_KEY'
  ],
  'OpenRouter': [
    'OPENROUTER_API_KEY',
    'OPENROUTER_API_URL',
    'OPENROUTER_DEFAULT_MODEL'
  ]
};

// Check if all required environment variables are set
let allSet = true;
const missingVars = {};

console.log(chalk.blue('\nChecking environment variables...\n'));

for (const [server, vars] of Object.entries(requiredEnvVars)) {
  const missing = vars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    allSet = false;
    missingVars[server] = missing;
  }
}

// Display results
if (allSet) {
  console.log(chalk.green('✅ All required environment variables are set!\n'));
} else {
  console.log(chalk.red('❌ Some required environment variables are missing:\n'));
  
  for (const [server, missing] of Object.entries(missingVars)) {
    console.log(chalk.yellow(`${server}:`));
    missing.forEach(varName => {
      console.log(chalk.red(`  - ${varName}`));
    });
    console.log('');
  }
  
  console.log(chalk.blue('Please set these variables in your .env.local file.'));
  console.log(chalk.blue('You can copy .env.example to .env.local and fill in the values.'));
}

// Check for optional but recommended variables
const recommendedVars = [
  'LOG_LEVEL',
  'DEBUG_MCP_SERVERS',
  'ENABLE_FILE_LOGGING',
  'LOG_FILE_PATH'
];

const missingRecommended = recommendedVars.filter(varName => !process.env[varName]);

if (missingRecommended.length > 0) {
  console.log(chalk.yellow('\nSome recommended variables are not set:'));
  missingRecommended.forEach(varName => {
    console.log(chalk.yellow(`  - ${varName}`));
  });
  console.log(chalk.blue('\nThese variables are optional but recommended for better functionality.'));
}

// Exit with appropriate code
if (!allSet) {
  process.exit(1);
} else {
  process.exit(0);
}
