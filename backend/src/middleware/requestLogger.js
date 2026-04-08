const { createLogger } = require('../utils/logger');

const logger = createLogger('HTTP');

/**
 * Simple request logging middleware.
 * Logs method, path, status code, and response time.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Capture when response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger[level](`${method} ${originalUrl} ${statusCode}`, {
      ms: duration,
      ip: req.ip,
    });
  });

  next();
};

module.exports = { requestLogger };
