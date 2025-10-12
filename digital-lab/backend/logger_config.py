"""
Structured JSON Logger for ABM² Backend
Provides consistent logging with levels, timestamps, and separate error tracking
"""

import logging
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'level': record.levelname,
            'service': 'abm2-backend',
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno
        }

        # Add extra fields if present
        if hasattr(record, 'context'):
            log_entry.update(record.context)

        # Add exception info if present
        if record.exc_info:
            log_entry['exception'] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


class ContextAdapter(logging.LoggerAdapter):
    """Logger adapter that allows adding context to log messages"""

    def process(self, msg, kwargs):
        # Extract context from kwargs
        context = kwargs.pop('context', {})
        if context:
            kwargs['extra'] = {'context': context}
        return msg, kwargs


def setup_logger(
    name: str = 'abm2',
    log_dir: str = '/tmp',
    log_level: int = logging.INFO,
    enable_console: bool = True,
    enable_json: bool = True
) -> ContextAdapter:
    """
    Setup structured logger for ABM² backend

    Args:
        name: Logger name
        log_dir: Directory for log files
        log_level: Minimum log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        enable_console: Whether to output to console
        enable_json: Whether to use JSON format for file logs

    Returns:
        ContextAdapter: Configured logger with context support
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(log_level)

    # Remove existing handlers
    logger.handlers.clear()

    # Create log directory if needed
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)

    # File handler for all logs (JSON format)
    if enable_json:
        file_handler = logging.FileHandler(log_path / f'{name}-backend.log')
        file_handler.setLevel(log_level)
        file_handler.setFormatter(JSONFormatter())
        logger.addHandler(file_handler)

        # Separate file handler for errors only
        error_handler = logging.FileHandler(log_path / f'{name}-backend-errors.log')
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(JSONFormatter())
        logger.addHandler(error_handler)

    # Console handler (human-readable format)
    if enable_console:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        console_format = logging.Formatter(
            '[%(asctime)s] [%(levelname)s] [%(module)s:%(funcName)s:%(lineno)d] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        console_handler.setFormatter(console_format)
        logger.addHandler(console_handler)

    # Prevent propagation to root logger
    logger.propagate = False

    # Wrap in ContextAdapter
    return ContextAdapter(logger, {})


def log_api_request(logger: ContextAdapter, method: str, path: str, client: str, request_id: Optional[str] = None):
    """Log an API request"""
    logger.info(f'API request: {method} {path}', context={
        'request_id': request_id,
        'method': method,
        'path': path,
        'client': client
    })


def log_api_response(
    logger: ContextAdapter,
    method: str,
    path: str,
    status_code: int,
    duration_ms: float,
    request_id: Optional[str] = None
):
    """Log an API response"""
    level = 'info' if status_code < 400 else 'warning' if status_code < 500 else 'error'
    log_method = getattr(logger, level)

    log_method(f'API response: {method} {path} - {status_code}', context={
        'request_id': request_id,
        'method': method,
        'path': path,
        'status_code': status_code,
        'duration_ms': duration_ms
    })


def log_simulation_event(
    logger: ContextAdapter,
    event: str,
    details: Optional[Dict[str, Any]] = None,
    request_id: Optional[str] = None
):
    """Log a simulation-related event"""
    logger.info(f'Simulation event: {event}', context={
        'request_id': request_id,
        'event': event,
        **(details or {})
    })


# Global logger instance
_logger_instance: Optional[ContextAdapter] = None


def get_logger() -> ContextAdapter:
    """Get the global logger instance"""
    global _logger_instance
    if _logger_instance is None:
        _logger_instance = setup_logger()
    return _logger_instance


if __name__ == '__main__':
    # Test the logger
    logger = setup_logger('test', log_level=logging.DEBUG)

    logger.debug('This is a debug message', context={'foo': 'bar'})
    logger.info('This is an info message', context={'count': 42})
    logger.warning('This is a warning message')
    logger.error('This is an error message', context={'error_code': 'E001'})

    try:
        1 / 0
    except Exception as e:
        logger.exception('Exception occurred', context={'operation': 'division'})

    print('\nLog files created in /tmp:')
    print('  - test-backend.log')
    print('  - test-backend-errors.log')
