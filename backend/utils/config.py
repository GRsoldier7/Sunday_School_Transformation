"""
Configuration module for the Bible Study Tracker application.

This module loads configuration from environment variables and provides
a centralized place for accessing configuration values.
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, Any, Optional, List, Union

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for the application"""
    
    # Base configuration
    DEBUG = os.getenv('FLASK_DEBUG', '0') == '1'
    TESTING = os.getenv('TESTING', '0') == '1'
    ENV = os.getenv('FLASK_ENV', 'production')
    PORT = int(os.getenv('PORT', '5000'))
    
    # API Keys
    PEXELS_API_KEY = os.getenv('PEXELS_API_KEY', '')
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '')
    
    # OpenRouter Configuration
    OPENROUTER_API_URL = os.getenv('OPENROUTER_API_URL', 'https://openrouter.ai/api/v1')
    OPENROUTER_DEFAULT_MODEL = os.getenv('OPENROUTER_DEFAULT_MODEL', 'anthropic/claude-3-opus-20240229')
    OPENROUTER_FALLBACK_MODEL = os.getenv('OPENROUTER_FALLBACK_MODEL', 'anthropic/claude-3-sonnet-20240229')
    
    # Google Sheets
    GOOGLE_SHEETS_ID = os.getenv('GOOGLE_SHEETS_ID', '')
    
    # Email Configuration
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
    EMAIL_SENDER = os.getenv('EMAIL_SENDER', '')
    EMAIL_RECIPIENT = os.getenv('EMAIL_RECIPIENT', '')
    
    # MCP Servers Configuration
    MCP_SERVERS = {
        'context7': {
            'base_url': os.getenv('CONTEXT7_BASE_URL', 'http://localhost:3002'),
            'enabled': os.getenv('ENABLE_CONTEXT7', 'true').lower() == 'true'
        },
        'taskmaster': {
            'base_url': os.getenv('TASKMASTER_BASE_URL', 'http://localhost:3003'),
            'api_key': os.getenv('TASKMASTER_API_KEY', ''),
            'model': os.getenv('TASKMASTER_MODEL', 'anthropic/claude-3-opus-20240229'),
            'enabled': os.getenv('ENABLE_TASKMASTER', 'true').lower() == 'true'
        },
        'magicui': {
            'base_url': os.getenv('MAGICUI_BASE_URL', 'http://localhost:3004'),
            'api_key': os.getenv('MAGICUI_API_KEY', ''),
            'enabled': os.getenv('ENABLE_MAGICUI', 'true').lower() == 'true'
        },
        'memory': {
            'base_url': os.getenv('MEMORY_BASE_URL', 'http://localhost:3005'),
            'enabled': os.getenv('ENABLE_MEMORY', 'true').lower() == 'true'
        },
        'knowledge': {
            'base_url': os.getenv('KNOWLEDGE_BASE_URL', 'http://localhost:3006'),
            'enabled': os.getenv('ENABLE_KNOWLEDGE', 'true').lower() == 'true'
        },
        'github_mcp': {
            'base_url': os.getenv('GITHUB_MCP_BASE_URL', 'http://localhost:3007'),
            'api_key': os.getenv('GITHUB_MCP_API_KEY', ''),
            'enabled': os.getenv('ENABLE_GITHUB_MCP', 'true').lower() == 'true'
        }
    }
    
    # Google API credentials
    GOOGLE_CREDENTIALS_PATH = os.getenv('GOOGLE_CREDENTIALS_PATH', 'credentials.json')
    
    # Logging Configuration
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    ENABLE_FILE_LOGGING = os.getenv('ENABLE_FILE_LOGGING', 'true').lower() == 'true'
    ENABLE_JSON_LOGGING = os.getenv('ENABLE_JSON_LOGGING', 'true').lower() == 'true'
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    @classmethod
    def get_mcp_server_config(cls, server_name: str) -> Dict[str, Any]:
        """
        Get configuration for a specific MCP server
        
        Args:
            server_name: Name of the MCP server
            
        Returns:
            Dict containing the server configuration
        """
        return cls.MCP_SERVERS.get(server_name, {})
    
    @classmethod
    def is_mcp_server_enabled(cls, server_name: str) -> bool:
        """
        Check if a specific MCP server is enabled
        
        Args:
            server_name: Name of the MCP server
            
        Returns:
            Boolean indicating if the server is enabled
        """
        server_config = cls.get_mcp_server_config(server_name)
        return server_config.get('enabled', False)
    
    @classmethod
    def get_google_credentials(cls) -> Optional[Dict[str, Any]]:
        """
        Get Google API credentials from the credentials file
        
        Returns:
            Dict containing the credentials or None if file doesn't exist
        """
        credentials_path = Path(cls.GOOGLE_CREDENTIALS_PATH)
        
        if not credentials_path.exists():
            return None
        
        try:
            with open(credentials_path, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return None
    
    @classmethod
    def validate(cls) -> List[str]:
        """
        Validate the configuration and return a list of missing required values
        
        Returns:
            List of missing configuration keys
        """
        missing = []
        
        # Check required API keys
        if not cls.PEXELS_API_KEY:
            missing.append('PEXELS_API_KEY')
        
        if not cls.OPENROUTER_API_KEY:
            missing.append('OPENROUTER_API_KEY')
        
        # Check Google Sheets ID
        if not cls.GOOGLE_SHEETS_ID:
            missing.append('GOOGLE_SHEETS_ID')
        
        # Check Google credentials
        if not cls.get_google_credentials():
            missing.append('GOOGLE_CREDENTIALS_PATH (valid credentials.json file)')
        
        # Check email configuration if we're sending emails
        if cls.ENV == 'production':
            if not cls.SMTP_USERNAME:
                missing.append('SMTP_USERNAME')
            
            if not cls.SMTP_PASSWORD:
                missing.append('SMTP_PASSWORD')
            
            if not cls.EMAIL_SENDER:
                missing.append('EMAIL_SENDER')
            
            if not cls.EMAIL_RECIPIENT:
                missing.append('EMAIL_RECIPIENT')
        
        return missing
    
    @classmethod
    def as_dict(cls) -> Dict[str, Any]:
        """
        Get configuration as a dictionary (with sensitive values redacted)
        
        Returns:
            Dict containing the configuration
        """
        config_dict = {}
        
        for key in dir(cls):
            # Skip private attributes and methods
            if key.startswith('_') or callable(getattr(cls, key)):
                continue
            
            value = getattr(cls, key)
            
            # Redact sensitive values
            if 'API_KEY' in key or 'PASSWORD' in key or 'CREDENTIALS' in key:
                value = '***' if value else ''
            
            config_dict[key] = value
        
        return config_dict

# Create an instance for easier imports
config = Config
