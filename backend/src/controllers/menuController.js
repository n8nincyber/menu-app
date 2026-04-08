const { processMenuImage } = require('../services/menuService');
const { AppError } = require('../middleware/errorHandler');

/**
 * POST /api/menu/upload
 * Upload a menu image for OCR processing.
 */
const uploadMenu = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('No image file provided. Please upload a menu image.', 400);
    }

    const result = await processMenuImage(req.file.path, req.file.originalname);

    if (!result.success) {
      return res.status(422).json({
        success: false,
        error: result.message,
      });
    }

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadMenu };
