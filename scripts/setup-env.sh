#!/bin/bash

# Setup Environment Script
# This script helps users set up their environment for the Sunday School Transformation project

# Set colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}    Sunday School Transformation      ${NC}"
echo -e "${BLUE}      Environment Setup Script        ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo

# Check if .env file exists
if [ -f .env ]; then
  echo -e "${GREEN}✅ .env file exists${NC}"
else
  echo -e "${YELLOW}⚠️ .env file not found. Creating from template...${NC}"
  cp .env.example .env
  echo -e "${GREEN}✅ Created .env file${NC}"
fi

# Check if .env.local file exists
if [ -f .env.local ]; then
  echo -e "${GREEN}✅ .env.local file exists${NC}"
else
  echo -e "${YELLOW}⚠️ .env.local file not found. Creating from template...${NC}"
  cp .env.example .env.local
  echo -e "${GREEN}✅ Created .env.local file${NC}"
  echo -e "${YELLOW}⚠️ Please edit .env.local to add your API keys${NC}"
fi

# Create logs directory if it doesn't exist
if [ -d logs ]; then
  echo -e "${GREEN}✅ logs directory exists${NC}"
else
  echo -e "${YELLOW}⚠️ logs directory not found. Creating...${NC}"
  mkdir -p logs
  echo -e "${GREEN}✅ Created logs directory${NC}"
fi

# Check if node_modules exists
if [ -d node_modules ]; then
  echo -e "${GREEN}✅ node_modules directory exists${NC}"
else
  echo -e "${YELLOW}⚠️ node_modules not found. Installing dependencies...${NC}"
  npm install
  echo -e "${GREEN}✅ Installed dependencies${NC}"
fi

# Check for required API keys in .env.local
echo -e "\n${BLUE}Checking for required API keys...${NC}"
MISSING_KEYS=0

# Function to check if a key exists and is not empty
check_key() {
  KEY=$1
  DESCRIPTION=$2
  
  if grep -q "^$KEY=" .env.local; then
    VALUE=$(grep "^$KEY=" .env.local | cut -d '=' -f2)
    if [ -z "$VALUE" ] || [[ "$VALUE" == *"your_"* ]]; then
      echo -e "${RED}❌ $KEY is not set properly${NC}"
      echo -e "   $DESCRIPTION"
      MISSING_KEYS=$((MISSING_KEYS+1))
    else
      echo -e "${GREEN}✅ $KEY is set${NC}"
    fi
  else
    echo -e "${RED}❌ $KEY is missing${NC}"
    echo -e "   $DESCRIPTION"
    MISSING_KEYS=$((MISSING_KEYS+1))
  fi
}

# Check required keys
check_key "OPENROUTER_API_KEY" "Required for AI functionality. Get from: https://openrouter.ai/keys"
check_key "ANTHROPIC_API_KEY" "Required for Claude AI. Get from: https://console.anthropic.com/"
check_key "GITHUB_API_KEY" "Required for GitHub integration. Generate at: https://github.com/settings/tokens"

# Check port availability
echo -e "\n${BLUE}Checking port availability...${NC}"
npm run scan-ports

# If ports are not available, offer to fix
if [ $? -ne 0 ]; then
  echo -e "${YELLOW}Would you like to automatically fix port conflicts? (y/n)${NC}"
  read -r response
  if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    npm run scan-ports:fix
  fi
fi

# Final summary
echo -e "\n${BLUE}=======================================${NC}"
echo -e "${BLUE}          Setup Summary              ${NC}"
echo -e "${BLUE}=======================================${NC}"

if [ $MISSING_KEYS -gt 0 ]; then
  echo -e "${YELLOW}⚠️ $MISSING_KEYS API keys need to be configured${NC}"
  echo -e "${YELLOW}Please edit .env.local to add the missing keys${NC}"
else
  echo -e "${GREEN}✅ All required API keys are configured${NC}"
fi

echo -e "\n${GREEN}Environment setup complete!${NC}"
echo -e "You can now start the application with:"
echo -e "${BLUE}npm run start:mcp-servers${NC} - Start all MCP servers"
echo -e "${BLUE}npm run dev${NC} - Start the Next.js development server"
echo -e "${BLUE}npm run dev:with-mcp${NC} - Start both MCP servers and Next.js"
echo
