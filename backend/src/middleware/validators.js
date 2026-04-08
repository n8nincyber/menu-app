const { AppError } = require('./errorHandler');

/**
 * Validate chat query request body.
 */
const validateChatQuery = (req, res, next) => {
  const { message } = req.body;

  if (message === undefined || message === null) {
    return next(new AppError('Request body must include a "message" field.', 400));
  }

  if (typeof message !== 'string') {
    return next(new AppError('"message" must be a string.', 400));
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return next(new AppError('Message cannot be empty.', 400));
  }

  if (trimmed.length > 500) {
    return next(new AppError('Message too long (max 500 characters).', 400));
  }

  // Sanitize: strip any HTML tags
  req.body.message = trimmed.replace(/<[^>]*>/g, '');

  next();
};

/**
 * Validate file upload requests.
 * Runs AFTER multer middleware to check the processed file.
 */
const validateUpload = (req, res, next) => {
  if (!req.file) {
    return next(new AppError('No image file provided. Attach a menu image using the "image" field.', 400));
  }

  // Double-check MIME type (multer already filters, but defense in depth)
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff', 'image/bmp'];
  if (!allowedMimes.includes(req.file.mimetype)) {
    return next(new AppError(`Unsupported image format: ${req.file.mimetype}`, 400));
  }

  next();
};

module.exports = { validateChatQuery, validateUpload };
