import logging
import logging.config
from constants import LOG_PATH, LOG_LEVEL

_logging_configured = False

def configure_logging():
    """Configure logging from the ini file"""
    global _logging_configured
    
    if _logging_configured:
        return
    
    if LOG_PATH.exists():
        try:
            logging.config.fileConfig(LOG_PATH, disable_existing_loggers=False)
            _logging_configured = True
        except Exception as e:
            logging.basicConfig(
                level=LOG_LEVEL,
                format='[%(asctime)s] [pid %(process)d - %(threadName)s] %(name)s(%(funcName)s:%(lineno)s) - %(levelname)s: %(message)s',
                datefmt='%Y-%m-%d %H:%M:%S'
            )
            logging.warning(f"Failed to load logging config from {LOG_PATH}: {e}")
            _logging_configured = True
    else:
        logging.basicConfig(
            level=LOG_LEVEL,
            format='[%(asctime)s] [pid %(process)d - %(threadName)s] %(name)s(%(funcName)s:%(lineno)s) - %(levelname)s: %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        logging.warning(f"Log config file not found at {LOG_PATH}, using basic config")
        _logging_configured = True

def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name.
    
    Args:
        name: The name of the logger (typically __name__ of the calling module)
    
    Returns:
        A configured logger instance
    """
    configure_logging()
    logger = logging.getLogger(name)
    
    if LOG_LEVEL:
        logger.setLevel(LOG_LEVEL)
    
    return logger