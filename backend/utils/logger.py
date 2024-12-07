import logging
import logging.config
import io
import os

DEBUG: str = os.getenv("DEBUG", '0')

DEFAULT_CONFIG = """
[loggers]
keys=root

[handlers]
keys=console

[formatters]
keys=default

[logger_root]
propagate=1
handlers=console

[handler_console]
class=logging.StreamHandler
formatter=default
steam=ext://sys.stderr

[formatter_default]
format=[%(asctime)-15s][pid %(process)d - %(threadName)s] %(name)s(%(funcName)s:%(lineno)s) - %(levelname)s: %(message)s
datefmt=%Y-%m-%d %H:%M:%S
"""

def get_logger(module: str, config=None) -> logging.Logger:
  """Assures global config is loaded before logger object."""

  config = io.StringIO(DEFAULT_CONFIG)
  logging.config.fileConfig(config, disable_existing_loggers=False)
  config.close()
  logger = logging.getLogger(module)
  logger.setLevel(logging.DEBUG if DEBUG == '1' else logging.INFO)

  return logger