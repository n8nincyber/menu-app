const { Restaurant, MenuItem } = require('../models');
const { extractText } = require('./ocrService');
const { parseMenu } = require('./menuParser');
const { preprocessImage, validateImage } = require('./imageProcessor');
const fs = require('fs').promises;

/**
 * Process an uploaded menu image:
 *  0. Validate & preprocess image
 *  1. Run OCR
 *  2. Parse structured data
 *  3. Store in MongoDB
 *  4. Clean up temp files
 */
const processMenuImage = async (imagePath, originalFilename) => {
  let processedPath = null;

  try {
    // Step 0a: Validate image
    const validationError = await validateImage(imagePath);
    if (validationError) {
      return { success: false, message: validationError };
    }

    // Step 0b: Preprocess for better OCR accuracy
    const preprocessed = await preprocessImage(imagePath);
    processedPath = preprocessed.processedPath;

    // Step 1: OCR (use preprocessed image)
    const ocrResult = await extractText(processedPath);

    // Step 2: Parse
    const parsed = parseMenu(ocrResult);

    if (parsed.items.length === 0) {
      return {
        success: false,
        message: 'Could not extract any menu items from this image. Try a clearer photo with visible text and prices.',
      };
    }

    // Step 3: Find or create restaurant
    let restaurant = await Restaurant.findOne({
      normalizedName: parsed.restaurantName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    });

    if (restaurant) {
      // Update: remove old items and re-insert (treats upload as full refresh)
      await MenuItem.deleteMany({ restaurantId: restaurant._id });
    } else {
      restaurant = await Restaurant.create({
        name: parsed.restaurantName,
        sourceImage: originalFilename,
      });
    }

    // Step 4: Insert menu items
    const itemDocs = parsed.items.map((item) => ({
      restaurantId: restaurant._id,
      name: item.name,
      category: item.category,
      price: item.price,
    }));

    const inserted = await MenuItem.insertMany(itemDocs);

    // Step 5: Clean up temp files
    for (const filePath of [imagePath, processedPath]) {
      if (filePath) {
        try { await fs.unlink(filePath); } catch { /* non-critical */ }
      }
    }

    return {
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
      },
      menuItems: inserted.map((i) => ({
        name: i.name,
        category: i.category,
        price: i.price,
      })),
      message: `Extracted ${inserted.length} items from "${restaurant.name}"`,
      confidence: parsed.confidence,
    };
  } catch (err) {
    // Clean up on error
    for (const filePath of [imagePath, processedPath]) {
      if (filePath) {
        try { await fs.unlink(filePath); } catch { /* ignore */ }
      }
    }

    throw err;
  }
};

module.exports = { processMenuImage };
