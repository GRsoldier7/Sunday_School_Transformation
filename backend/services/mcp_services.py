"""
MCP Services Integration for the Bible Study Tracker application.

This module provides integration with the MCP servers for enhanced functionality.
"""

import json
import time
import requests
from typing import Dict, Any, List, Optional, Union, Tuple

from utils.config import config
from utils.logger import app_logger, log_api_call

class MCPServiceError(Exception):
    """Exception raised for errors in MCP services"""
    pass

class BaseMCPService:
    """Base class for MCP service integrations"""
    
    def __init__(self, service_name: str):
        """
        Initialize the MCP service
        
        Args:
            service_name: Name of the MCP service
        """
        self.service_name = service_name
        self.service_config = config.get_mcp_server_config(service_name)
        self.base_url = self.service_config.get('base_url', '')
        self.api_key = self.service_config.get('api_key', '')
        self.enabled = self.service_config.get('enabled', False)
        self.logger = app_logger
    
    def is_enabled(self) -> bool:
        """Check if the service is enabled"""
        return self.enabled
    
    def get_headers(self) -> Dict[str, str]:
        """Get headers for API requests"""
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
        
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
        
        return headers
    
    def check_health(self) -> bool:
        """
        Check if the service is healthy
        
        Returns:
            Boolean indicating if the service is healthy
        """
        if not self.is_enabled():
            return False
        
        try:
            start_time = time.time()
            response = requests.get(
                f"{self.base_url}/api/health",
                headers=self.get_headers(),
                timeout=5
            )
            duration = time.time() - start_time
            
            success = response.status_code == 200
            log_api_call(
                self.service_name,
                'health',
                success=success,
                response=response.json() if success else None,
                error=response.text if not success else None,
                duration=duration,
                logger=self.logger
            )
            
            return success
        except Exception as e:
            log_api_call(
                self.service_name,
                'health',
                success=False,
                error=e,
                logger=self.logger
            )
            return False
    
    def make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        timeout: int = 30
    ) -> Tuple[bool, Union[Dict[str, Any], str]]:
        """
        Make a request to the MCP service
        
        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint
            data: Request data (for POST, PUT, etc.)
            params: Query parameters
            timeout: Request timeout in seconds
            
        Returns:
            Tuple of (success, response_data_or_error)
        """
        if not self.is_enabled():
            return False, "Service is not enabled"
        
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        try:
            start_time = time.time()
            response = requests.request(
                method,
                url,
                json=data,
                params=params,
                headers=self.get_headers(),
                timeout=timeout
            )
            duration = time.time() - start_time
            
            success = response.status_code in (200, 201, 204)
            
            try:
                response_data = response.json()
            except json.JSONDecodeError:
                response_data = response.text
            
            log_api_call(
                self.service_name,
                endpoint,
                params=params,
                success=success,
                response=response_data if success else None,
                error=response_data if not success else None,
                duration=duration,
                logger=self.logger
            )
            
            if success:
                return True, response_data
            else:
                return False, response_data
        except Exception as e:
            log_api_call(
                self.service_name,
                endpoint,
                params=params,
                success=False,
                error=e,
                logger=self.logger
            )
            return False, str(e)

class Context7Service(BaseMCPService):
    """Integration with the Context7 MCP service"""
    
    def __init__(self):
        super().__init__('context7')
    
    def store_context(self, key: str, data: Dict[str, Any], tags: List[str] = None) -> bool:
        """
        Store context data
        
        Args:
            key: Context key
            data: Context data
            tags: Optional list of tags
            
        Returns:
            Boolean indicating success
        """
        success, response = self.make_request(
            'POST',
            'api/context',
            data={
                'key': key,
                'data': data,
                'tags': tags or []
            }
        )
        
        return success
    
    def get_context(self, key: str, tags: List[str] = None) -> Optional[Dict[str, Any]]:
        """
        Get context data
        
        Args:
            key: Context key
            tags: Optional list of tags
            
        Returns:
            Context data or None if not found
        """
        params = {'key': key}
        if tags:
            params['tags'] = ','.join(tags)
        
        success, response = self.make_request(
            'GET',
            'api/context',
            params=params
        )
        
        if success and isinstance(response, dict):
            return response.get('data')
        
        return None

class TaskmasterService(BaseMCPService):
    """Integration with the Taskmaster MCP service"""
    
    def __init__(self):
        super().__init__('taskmaster')
    
    def generate_ai_content(
        self,
        scripture: str,
        transcription: str,
        plaud_synopsis: str
    ) -> Optional[Dict[str, str]]:
        """
        Generate AI content using Taskmaster
        
        Args:
            scripture: Bible scripture
            transcription: Session transcription
            plaud_synopsis: PLAUD AI synopsis
            
        Returns:
            Dictionary with generated content or None if failed
        """
        success, response = self.make_request(
            'POST',
            'api/tasks',
            data={
                'task_type': 'generate_ai_content',
                'inputs': {
                    'scripture': scripture,
                    'transcription': transcription,
                    'plaud_synopsis': plaud_synopsis
                },
                'model': self.service_config.get('model', config.OPENROUTER_DEFAULT_MODEL)
            }
        )
        
        if success and isinstance(response, dict):
            return response.get('outputs', {})
        
        return None
    
    def schedule_email_digest(self, session_id: int, scheduled_time: str = None) -> bool:
        """
        Schedule an email digest task
        
        Args:
            session_id: Session ID
            scheduled_time: Optional scheduled time (ISO format)
            
        Returns:
            Boolean indicating success
        """
        data = {
            'task_type': 'send_email_digest',
            'inputs': {
                'session_id': session_id
            }
        }
        
        if scheduled_time:
            data['scheduled_time'] = scheduled_time
        
        success, _ = self.make_request(
            'POST',
            'api/tasks',
            data=data
        )
        
        return success

class MagicUIService(BaseMCPService):
    """Integration with the MagicUI MCP service"""
    
    def __init__(self):
        super().__init__('magicui')
    
    def get_components(self, page: str) -> List[Dict[str, Any]]:
        """
        Get UI components for a page
        
        Args:
            page: Page identifier
            
        Returns:
            List of UI component definitions
        """
        success, response = self.make_request(
            'GET',
            'api/components',
            params={'page': page}
        )
        
        if success and isinstance(response, dict) and 'components' in response:
            return response['components']
        
        return []
    
    def get_theme(self) -> Dict[str, Any]:
        """
        Get theme configuration
        
        Returns:
            Theme configuration
        """
        success, response = self.make_request(
            'GET',
            'api/theme'
        )
        
        if success and isinstance(response, dict) and 'theme' in response:
            return response['theme']
        
        return {}

class MemoryService(BaseMCPService):
    """Integration with the Memory MCP service"""
    
    def __init__(self):
        super().__init__('memory')
    
    def store(self, key: str, value: Any, expires_in: int = None) -> bool:
        """
        Store data in memory
        
        Args:
            key: Data key
            value: Data value
            expires_in: Optional expiration time in seconds
            
        Returns:
            Boolean indicating success
        """
        data = {
            'key': key,
            'value': value
        }
        
        if expires_in is not None:
            data['expires_in'] = expires_in
        
        success, _ = self.make_request(
            'POST',
            'api/memory',
            data=data
        )
        
        return success
    
    def retrieve(self, key: str) -> Optional[Any]:
        """
        Retrieve data from memory
        
        Args:
            key: Data key
            
        Returns:
            Stored value or None if not found
        """
        success, response = self.make_request(
            'GET',
            'api/memory',
            params={'key': key}
        )
        
        if success and isinstance(response, dict) and 'value' in response:
            return response['value']
        
        return None

class KnowledgeService(BaseMCPService):
    """Integration with the Knowledge MCP service"""
    
    def __init__(self):
        super().__init__('knowledge')
    
    def get_bible_reference(self, reference: str) -> Optional[Dict[str, Any]]:
        """
        Get Bible reference information
        
        Args:
            reference: Bible reference (e.g., "John 3:16")
            
        Returns:
            Reference information or None if not found
        """
        success, response = self.make_request(
            'GET',
            'api/bible',
            params={'reference': reference}
        )
        
        if success and isinstance(response, dict):
            return response
        
        return None
    
    def get_cross_references(self, reference: str) -> List[str]:
        """
        Get cross-references for a Bible passage
        
        Args:
            reference: Bible reference
            
        Returns:
            List of cross-references
        """
        success, response = self.make_request(
            'GET',
            'api/bible/cross-references',
            params={'reference': reference}
        )
        
        if success and isinstance(response, dict) and 'cross_references' in response:
            return response['cross_references']
        
        return []
    
    def get_resources(self, reference: str, resource_type: str = None) -> List[Dict[str, Any]]:
        """
        Get resources related to a Bible passage
        
        Args:
            reference: Bible reference
            resource_type: Optional resource type filter
            
        Returns:
            List of resources
        """
        params = {'reference': reference}
        if resource_type:
            params['type'] = resource_type
        
        success, response = self.make_request(
            'GET',
            'api/resources',
            params=params
        )
        
        if success and isinstance(response, dict) and 'resources' in response:
            return response['resources']
        
        return []

class GitHubMCPService(BaseMCPService):
    """Integration with the GitHub MCP service"""
    
    def __init__(self):
        super().__init__('github_mcp')
    
    def get_repository_info(self, owner: str, repo: str) -> Optional[Dict[str, Any]]:
        """
        Get repository information
        
        Args:
            owner: Repository owner
            repo: Repository name
            
        Returns:
            Repository information or None if not found
        """
        success, response = self.make_request(
            'GET',
            'api/repos',
            params={'owner': owner, 'repo': repo}
        )
        
        if success and isinstance(response, dict):
            return response
        
        return None
    
    def push_changes(
        self,
        owner: str,
        repo: str,
        branch: str,
        message: str,
        files: List[Dict[str, str]]
    ) -> bool:
        """
        Push changes to a repository
        
        Args:
            owner: Repository owner
            repo: Repository name
            branch: Branch name
            message: Commit message
            files: List of files to change (each with 'path' and 'content')
            
        Returns:
            Boolean indicating success
        """
        success, _ = self.make_request(
            'POST',
            'api/repos/push',
            data={
                'owner': owner,
                'repo': repo,
                'branch': branch,
                'message': message,
                'files': files
            }
        )
        
        return success

# Create service instances
context7 = Context7Service()
taskmaster = TaskmasterService()
magicui = MagicUIService()
memory = MemoryService()
knowledge = KnowledgeService()
github_mcp = GitHubMCPService()

# Export all services
mcp_services = {
    'context7': context7,
    'taskmaster': taskmaster,
    'magicui': magicui,
    'memory': memory,
    'knowledge': knowledge,
    'github_mcp': github_mcp
}
