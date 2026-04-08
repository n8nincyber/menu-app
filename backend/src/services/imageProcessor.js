const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Preprocess an image before OCR to improve extraction accuracy.
 *
 * Steps:
 *  1. Convert to grayscale
 *  2. Normalize contrast
 *  3. Sharpen text edges
 *  4. Resize if too large (Tesseract works best < 4000px wide)
 *  5. Output as high-quality PNG
 */
const preprocessImage = async (inputPath) => {
  const outputDir = process.env.UPLOAD_DIR || 'uploads';
  const outputPath = path.join(outputDir, `processed-${uuidv4()}.png`);

  try {
    const metadata = await sharp(inputPath).metadata();

    let pipeline = sharp(inputPath);

    // Resize if extremely large (keeps aspect ratio)
    const MAX_WIDTH = 4000;
    const MAX_HEIGHT = 5000;
    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      pipeline = pipeline.resize({
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Grayscale for cleaner text detection
    pipeline = pipeline.grayscale();

    // Normalize brightness and contrast
    pipeline = pipeline.normalize();

    // Sharpen to enhance text edges
    pipeline = pipeline.sharpen({
      sigma: 1.5,
      m1: 1.0,
      m2: 0.5,
    });

    // Slight contrast boost via gamma
    pipeline = pipeline.gamma(1.2);

    // Output as lossless PNG
    await pipeline
      .png({ quality: 100 })
      .toFile(outputPath);

    return {
      processedPath: outputPath,
      originalWidth: metadata.width,
      originalHeight: metadata.height,
      format: metadata.format,
    };
  } catch (err) {
    // If preprocessing fails, fall back to original image
    console.warn('[ImagePreprocess] Failed, using original:', err.message);
    return {
      processedPath: inputPath,
      originalWidth: null,
      originalHeight: null,
      format: null,
      preprocessFailed: true,
    };
  }
};

/**
 * Validate image dimensions and content.
 * Returns null if valid, or an error message string.
 */
const validateImage = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();

    if (metadata.width < 100 || metadata.height < 100) {
      return 'Image is too small (minimum 100x100 pixels). Please upload a larger, clearer photo.';
    }

    if (metadata.width > 10000 || metadata.height > 10000) {
      return 'Image is too large (maximum 10000x10000 pixels). Please resize before uploading.';
    }

    // Check for essentially blank/solid images via stats
    const stats = await sharp(imagePath).stats();
    const channels = stats.channels;

    // If all channel standard deviations are near zero, image is likely blank
    const avgStdDev = channels.reduce((sum, ch) => sum + ch.stdev, 0) / channels.length;
    if (avgStdDev < 5) {
      return 'Image appears to be blank or nearly uniform. Please upload a photo of an actual menu.';
    }

    return null; // valid
  } catch (err) {
    return `Could not read image: ${err.message}`;
  }
};

module.exports = { preprocessImage, validateImage };
