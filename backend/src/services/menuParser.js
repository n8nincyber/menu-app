/**
 * MenuParser — Extracts structured menu data from raw OCR text.
 *
 * Strategy:
 *  1. Detect restaurant name from the first prominent line
 *  2. Detect category headers (all-caps lines, lines ending with ':')
 *  3. Extract items with price patterns
 *  4. Handle noisy OCR gracefully
 */

// Common category keywords
const CATEGORY_KEYWORDS = [
  'appetizer', 'appetizers', 'starter', 'starters',
  'soup', 'soups', 'salad', 'salads',
  'main', 'mains', 'entree', 'entrees', 'entrée', 'entrées',
  'pizza', 'pasta', 'burger', 'burgers', 'sandwich', 'sandwiches',
  'seafood', 'fish', 'chicken', 'meat', 'grill', 'grilled',
  'side', 'sides', 'extra', 'extras',
  'dessert', 'desserts', 'sweet', 'sweets',
  'beverage', 'beverages', 'drink', 'drinks',
  'coffee', 'tea', 'juice', 'smoothie',
  'breakfast', 'lunch', 'dinner', 'brunch',
  'special', 'specials', 'combo', 'combos',
  'vegetarian', 'vegan', 'kids', "kid's", 'children',
  'rice', 'noodle', 'noodles', 'curry', 'tandoori',
  'thali', 'biryani', 'dal', 'roti', 'naan', 'bread',
];

// Price patterns: $12.99, 12.99, Rs 150, ₹200, €9.50, £8, etc.
const PRICE_REGEX = /(?:[$€£₹¥]|rs\.?|inr|usd|eur)\s*\d+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?\s*(?:[$€£₹¥]|rs\.?|inr|usd|eur)|\b\d{2,5}(?:\.\d{1,2})?\b(?=\s*$|\s*[-|])/i;

// Lines to skip
const NOISE_PATTERNS = [
  /^\s*$/, // empty
  /^[-=_*]{3,}$/, // dividers
  /^\d{5,}$/, // phone numbers
  /www\.|\.com|\.in|\.org/i, // URLs
  /address|phone|tel|fax|email|follow us|wifi|password/i,
  /tax|gst|cgst|sgst|service charge|disclaimer/i,
  /all rights reserved|terms|conditions/i,
  /^\s*[•·*]\s*$/, // lone bullets
  /page\s*\d/i,
];

/**
 * Check if a line is noise (should be skipped).
 */
const isNoise = (line) => NOISE_PATTERNS.some((p) => p.test(line));

/**
 * Check if a line is a category header.
 */
const isCategory = (line) => {
  const clean = line.replace(/[-=_:*#]/g, '').trim();
  if (clean.length < 2 || clean.length > 40) return false;

  // All uppercase and no price → likely a header
  if (clean === clean.toUpperCase() && clean.length > 2 && !PRICE_REGEX.test(line)) {
    return true;
  }

  // Ends with colon
  if (line.trim().endsWith(':')) return true;

  // Matches known category keywords
  const lower = clean.toLowerCase();
  return CATEGORY_KEYWORDS.some(
    (kw) => lower === kw || lower === kw + 's' || lower.startsWith(kw + ' ') || lower.endsWith(' ' + kw)
  );
};

/**
 * Extract price from a line.
 */
const extractPrice = (line) => {
  const match = line.match(PRICE_REGEX);
  if (!match) return null;

  let price = match[0].trim();

  // Normalize: strip currency words, keep symbol + number
  price = price.replace(/\b(rs\.?|inr|usd|eur)\b/i, '₹').trim();

  // If it's just a bare number, try to add context
  if (/^\d+(\.\d{1,2})?$/.test(price)) {
    const num = parseFloat(price);
    if (num < 1 || num > 99999) return null; // unlikely price
    return `₹${price}`;
  }

  return price;
};

/**
 * Extract item name from a line (removing the price portion).
 */
const extractItemName = (line, price) => {
  let name = line;

  if (price) {
    // Remove the price and surrounding dots/dashes
    const priceIndex = name.lastIndexOf(price.replace('₹', ''));
    if (priceIndex > 0) {
      name = name.substring(0, priceIndex);
    } else {
      name = name.replace(PRICE_REGEX, '');
    }
  }

  // Clean up trailing dots, dashes, spaces
  name = name
    .replace(/[.]{2,}/g, '') // dot leaders
    .replace(/[-]{2,}/g, '')
    .replace(/[|]/g, '')
    .replace(/^\s*[\d]+[.)]\s*/, '') // numbered list prefixes
    .replace(/^\s*[•·*-]\s*/, '') // bullet prefixes
    .trim();

  return name;
};

/**
 * Detect restaurant name from OCR lines.
 * Heuristic: first non-noise, non-category line that's short and has no price.
 */
const detectRestaurantName = (lines) => {
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (isNoise(line)) continue;
    if (PRICE_REGEX.test(line)) continue;
    if (line.length < 2 || line.length > 60) continue;

    // A reasonable restaurant name candidate
    const clean = line.replace(/[-=_*#:]/g, '').trim();
    if (clean.length >= 2) {
      return clean;
    }
  }

  return 'Unknown Restaurant';
};

/**
 * Main parse function: takes raw OCR lines → structured menu data.
 */
const parseMenu = (ocrResult) => {
  const { lines: rawLines, text, confidence } = ocrResult;

  // Use lines if available, otherwise split text
  const lines = rawLines && rawLines.length > 0
    ? rawLines
    : text.split('\n').map((l) => l.trim()).filter(Boolean);

  const restaurantName = detectRestaurantName(lines);
  let currentCategory = 'General';
  const items = [];
  const seenItems = new Set();

  for (const line of lines) {
    if (isNoise(line)) continue;
    if (line.trim() === restaurantName) continue;

    // Check if category header
    if (isCategory(line)) {
      const catName = line.replace(/[-=_:*#]/g, '').trim();
      if (catName.length >= 2) {
        // Title-case the category
        currentCategory = catName
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
      continue;
    }

    // Try to extract as a menu item
    const price = extractPrice(line);
    const name = extractItemName(line, price);

    // Validate: item name should be reasonable
    if (!name || name.length < 2 || name.length > 100) continue;

    // Skip if it looks like an address or description (too many words, no price)
    if (!price && name.split(' ').length > 8) continue;

    // Dedup
    const key = name.toLowerCase().replace(/\s+/g, ' ');
    if (seenItems.has(key)) continue;
    seenItems.add(key);

    items.push({
      name,
      category: currentCategory,
      price: price || '—',
    });
  }

  return {
    restaurantName,
    items,
    confidence,
    totalExtracted: items.length,
  };
};

module.exports = { parseMenu, detectRestaurantName };
