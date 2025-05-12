"""
Logger module for the Bible Study Tracker application.

This module provides a centralized logging system with different log levels,
file and console output, and structured logging capabilities.
"""

import os
import json
import logging
import traceback
from datetime import datetime
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

# Configure logging
class CustomFormatter(logging.Formatter):
    """
    Custom formatter that adds color to console output and formats JSON for file output
    """
    
    # ANSI color codes
    COLORS = {
        'DEBUG': '\033[36m',  # Cyan
        'INFO': '\033[32m',   # Green
        'WARNING': '\033[33m', # Yellow
        'ERROR': '\033[31m',  # Red
        'CRITICAL': '\033[41m\033[37m', # White on Red background
        'RESET': '\033[0m'    # Reset
    }
    
    def __init__(self, use_colors=True, json_format=False):
        self.use_colors = use_colors
        self.json_format = json_format
        
        if json_format:
            super().__init__('%(message)s')
        else:
            fmt = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            super().__init__(fmt)
    
    def format(self, record):
        if self.json_format:
            # Create a JSON log entry
            log_entry = {
                'timestamp': datetime.fromtimestamp(record.created).isoformat(),
                'level': record.levelname,
                'logger': record.name,
                'message': record.getMessage(),
                'module': record.module,
                'function': record.funcName,
                'line': record.lineno
            }
            
            # Add exception info if present
            if record.exc_info:
                log_entry['exception'] = {
                    'type': record.exc_info[0].__name__,
                    'message': str(record.exc_info[1]),
                    'traceback': traceback.format_exception(*record.exc_info)
                }
            
            # Add extra fields if present
            if hasattr(record, 'extra'):
                log_entry.update(record.extra)
            
            return json.dumps(log_entry)
        else:
            # Standard text format with optional colors
            levelname = record.levelname
            message = super().format(record)
            
            if self.use_colors:
                color = self.COLORS.get(levelname, self.COLORS['RESET'])
                reset = self.COLORS['RESET']
                message = message.replace(levelname, f"{color}{levelname}{reset}")
            
            return message

def get_logger(name, level=logging.INFO, enable_file_logging=True, enable_json=True):
    """
    Get a logger with the specified name and configuration.
    
    Args:
        name (str): Logger name
        level (int): Logging level (default: INFO)
        enable_file_logging (bool): Whether to log to files (default: True)
        enable_json (bool): Whether to use JSON format for file logs (default: True)
    
    Returns:
        logging.Logger: Configured logger
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Remove existing handlers if any
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Console handler (with colors)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(CustomFormatter(use_colors=True, json_format=False))
    logger.addHandler(console_handler)
    
    if enable_file_logging:
        # Regular log file (JSON format)
        if enable_json:
            file_handler = RotatingFileHandler(
                f'logs/{name}.log',
                maxBytes=10*1024*1024,  # 10 MB
                backupCount=5
            )
            file_handler.setFormatter(CustomFormatter(use_colors=False, json_format=True))
            logger.addHandler(file_handler)
        
        # Error log file (JSON format, errors only)
        error_file_handler = RotatingFileHandler(
            f'logs/{name}_error.log',
            maxBytes=10*1024*1024,  # 10 MB
            backupCount=5
        )
        error_file_handler.setLevel(logging.ERROR)
        error_file_handler.setFormatter(CustomFormatter(use_colors=False, json_format=True))
        logger.addHandler(error_file_handler)
        
        # Daily log file
        daily_handler = TimedRotatingFileHandler(
            f'logs/{name}_daily.log',
            when='midnight',
            interval=1,
            backupCount=30
        )
        daily_handler.setFormatter(CustomFormatter(use_colors=False, json_format=enable_json))
        logger.addHandler(daily_handler)
    
    return logger

# Create application logger
app_logger = get_logger('bible_study_tracker')

# Create API logger
api_logger = get_logger('bible_study_tracker.api')

# Create Google Sheets logger
sheets_logger = get_logger('bible_study_tracker.sheets')

# Create OpenRouter logger
openrouter_logger = get_logger('bible_study_tracker.openrouter')

# Create Pexels logger
pexels_logger = get_logger('bible_study_tracker.pexels')

# Create email logger
email_logger = get_logger('bible_study_tracker.email')

def log_request(request, logger=api_logger):
    """
    Log an incoming request
    
    Args:
        request: Flask request object
        logger: Logger to use (default: api_logger)
    """
    logger.info(f"Request: {request.method} {request.path}", extra={
        'extra': {
            'method': request.method,
            'path': request.path,
            'remote_addr': request.remote_addr,
            'user_agent': request.headers.get('User-Agent'),
            'content_type': request.content_type,
            'content_length': request.content_length,
            'query_params': dict(request.args),
            'headers': dict(request.headers)
        }
    })

def log_response(response, duration=None, logger=api_logger):
    """
    Log an outgoing response
    
    Args:
        response: Flask response object
        duration: Request duration in seconds (optional)
        logger: Logger to use (default: api_logger)
    """
    extra = {
        'status_code': response.status_code,
        'content_type': response.content_type,
        'content_length': response.content_length,
        'headers': dict(response.headers)
    }
    
    if duration is not None:
        extra['duration'] = duration
    
    logger.info(f"Response: {response.status_code}", extra={'extra': extra})

def log_exception(exception, logger=app_logger):
    """
    Log an exception with traceback
    
    Args:
        exception: Exception object
        logger: Logger to use (default: app_logger)
    """
    logger.error(f"Exception: {str(exception)}", exc_info=True, extra={
        'extra': {
            'exception_type': exception.__class__.__name__,
            'exception_message': str(exception)
        }
    })

def log_api_call(service, endpoint, params=None, success=True, response=None, error=None, duration=None, logger=app_logger):
    """
    Log an external API call
    
    Args:
        service: Service name (e.g., 'openrouter', 'pexels')
        endpoint: API endpoint
        params: Request parameters (optional)
        success: Whether the call was successful (default: True)
        response: Response data (optional)
        error: Error message or object (optional)
        duration: Request duration in seconds (optional)
        logger: Logger to use (default: app_logger)
    """
    level = logging.INFO if success else logging.ERROR
    
    extra = {
        'service': service,
        'endpoint': endpoint
    }
    
    if params is not None:
        # Sanitize params to remove sensitive information
        sanitized_params = params.copy() if isinstance(params, dict) else params
        if isinstance(sanitized_params, dict) and 'api_key' in sanitized_params:
            sanitized_params['api_key'] = '***'
        extra['params'] = sanitized_params
    
    if duration is not None:
        extra['duration'] = duration
    
    if success and response is not None:
        # Limit response size for logging
        if isinstance(response, dict):
            # Only log a subset of the response to avoid huge log entries
            response_sample = {k: v for k, v in list(response.items())[:5]}
            if len(response) > 5:
                response_sample['...'] = f'({len(response) - 5} more items)'
            extra['response'] = response_sample
        elif isinstance(response, list):
            response_length = len(response)
            response_sample = response[:2]
            if response_length > 2:
                extra['response'] = f'{response_sample} ... ({response_length - 2} more items)'
            else:
                extra['response'] = response
        else:
            # For string or other types, limit to 200 chars
            response_str = str(response)
            if len(response_str) > 200:
                extra['response'] = response_str[:200] + '...'
            else:
                extra['response'] = response_str
    
    if not success and error is not None:
        if isinstance(error, Exception):
            extra['error'] = {
                'type': error.__class__.__name__,
                'message': str(error)
            }
        else:
            extra['error'] = error
    
    message = f"API Call: {service} - {endpoint} - {'Success' if success else 'Failed'}"
    logger.log(level, message, extra={'extra': extra})
