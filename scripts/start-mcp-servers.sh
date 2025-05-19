#!/bin/bash

# Start MCP Servers Script
# This script provides a convenient way to start all MCP servers with proper logging

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p logs

# Print header
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}       Starting All MCP Servers       ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo

# Check environment variables
echo -e "${YELLOW}Checking environment variables...${NC}"
npm run check-env
if [ $? -ne 0 ]; then
  echo -e "${RED}Environment check failed. Please fix the issues above.${NC}"
  exit 1
fi
echo -e "${GREEN}Environment check passed!${NC}"
echo

# Check port availability - THIS IS CRITICAL!
echo -e "${YELLOW}Checking port availability...${NC}"
echo -e "${BLUE}This step is CRITICAL to ensure we only use available ports!${NC}"
npm run scan-ports

# If ports are not available, offer to automatically fix
if [ $? -ne 0 ]; then
  echo -e "${RED}Port scan failed. Some ports are already in use.${NC}"
  echo -e "${YELLOW}Would you like to automatically use alternative ports? (y/n)${NC}"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${BLUE}Automatically fixing port conflicts...${NC}"
    npm run scan-ports:fix
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to find alternative ports. Please resolve port conflicts manually.${NC}"
      exit 1
    fi
    # Run scan again to verify
    npm run scan-ports
    if [ $? -ne 0 ]; then
      echo -e "${RED}Port conflicts still exist. Please resolve manually.${NC}"
      exit 1
    fi
  else
    echo -e "${RED}Please resolve port conflicts manually before starting servers.${NC}"
    exit 1
  fi
fi

echo -e "${GREEN}✅ All ports are available and ready for use!${NC}"
echo

# Start all MCP servers
echo -e "${YELLOW}Starting all MCP servers...${NC}"
echo -e "${BLUE}Logs will be saved to logs/mcp-servers.log${NC}"
echo

# Set debug mode if requested
if [ "$1" == "--debug" ]; then
  echo -e "${YELLOW}Debug mode enabled${NC}"
  DEBUG_MODE="true"
else
  DEBUG_MODE="false"
fi

# Start the servers with logging
DEBUG_MCP_SERVERS=$DEBUG_MODE node scripts/start-all-mcp-servers.js | tee logs/mcp-servers.log

# Exit with the status of the last command
exit ${PIPESTATUS[0]}
