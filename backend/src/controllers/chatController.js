const { handleQuery } = require('../services/queryService');
const { AppError } = require('../middleware/errorHandler');

/**
 * POST /api/chat/query
 * Handle natural language menu queries.
 */
const chatQuery = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new AppError('Message is required', 400);
    }

    if (message.length > 500) {
      throw new AppError('Message too long. Keep it under 500 characters.', 400);
    }

    const result = await handleQuery(message.trim());

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { chatQuery };
