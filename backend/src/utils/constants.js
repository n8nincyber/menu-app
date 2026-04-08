/**
 * Application-wide constants.
 */

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
  'image/bmp',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const MAX_QUERY_LENGTH = 500;

const DEFAULT_CURRENCY_SYMBOL = '₹';

const RESPONSE_TYPES = {
  TEXT: 'text',
  MENU_TABLE: 'menuTable',
  RESTAURANT_LIST: 'restaurantList',
  HELP: 'help',
  ERROR: 'error',
};

module.exports = {
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE_BYTES,
  MAX_QUERY_LENGTH,
  DEFAULT_CURRENCY_SYMBOL,
  RESPONSE_TYPES,
};
