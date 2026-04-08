const Tesseract = require('tesseract.js');
const path = require('path');

/**
 * Run OCR on an image file and return raw text.
 */
const extractText = async (imagePath) => {
  try {
    const { data } = await Tesseract.recognize(imagePath, 'eng', {
      logger: (info) => {
        if (info.status === 'recognizing text') {
          // Progress tracking (optional logging)
        }
      },
    });

    if (!data.text || data.text.trim().length === 0) {
      throw new Error('OCR produced no readable text from this image');
    }

    return {
      text: data.text,
      confidence: data.confidence,
      lines: data.lines?.map((l) => l.text.trim()).filter(Boolean) || [],
    };
  } catch (err) {
    if (err.message.includes('no readable text')) throw err;
    throw new Error(`OCR processing failed: ${err.message}`);
  }
};

module.exports = { extractText };
