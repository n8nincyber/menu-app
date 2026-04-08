/**
 * Lightweight structured logger.
 *
 * In production, replace with winston or pino.
 * This keeps dependencies minimal while providing consistent formatting.
 */

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const currentLevel = () => {
  const env = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
  return LOG_LEVELS[env] ?? LOG_LEVELS.info;
};

const formatMessage = (level, context, message, meta) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;

  if (meta && Object.keys(meta).length > 0) {
    return `${base} ${JSON.stringify(meta)}`;
  }

  return base;
};

const createLogger = (context = 'App') => ({
  error: (message, meta = {}) => {
    if (currentLevel() >= LOG_LEVELS.error) {
      console.error(formatMessage('error', context, message, meta));
    }
  },
  warn: (message, meta = {}) => {
    if (currentLevel() >= LOG_LEVELS.warn) {
      console.warn(formatMessage('warn', context, message, meta));
    }
  },
  info: (message, meta = {}) => {
    if (currentLevel() >= LOG_LEVELS.info) {
      console.log(formatMessage('info', context, message, meta));
    }
  },
  debug: (message, meta = {}) => {
    if (currentLevel() >= LOG_LEVELS.debug) {
      console.log(formatMessage('debug', context, message, meta));
    }
  },
});

module.exports = { createLogger };
