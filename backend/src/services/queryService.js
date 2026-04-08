const { Restaurant, MenuItem } = require('../models');

/**
 * Intent patterns for query parsing.
 */
const INTENT_PATTERNS = {
  showMenu: [
    /show\s+(?:me\s+)?(?:the\s+)?menu\s+(?:of|for|from|at)\s+(.+)/i,
    /menu\s+(?:of|for|from|at)\s+(.+)/i,
    /what(?:'s| is| does)\s+(.+?)\s+(?:have|serve|offer)/i,
    /(.+?)(?:'s)?\s+menu/i,
  ],
  showCategory: [
    /show\s+(?:me\s+)?(\w+)\s+(?:from|at|of)\s+(.+)/i,
    /(?:list|get|find)\s+(\w+)\s+(?:from|at|of)\s+(.+)/i,
    /(\w+)\s+(?:from|at|of)\s+(.+)/i,
  ],
  listRestaurants: [
    /list\s+(?:all\s+)?restaurants?/i,
    /show\s+(?:all\s+)?restaurants?/i,
    /what\s+restaurants?\s+(?:do you have|are available|are stored)/i,
    /available\s+restaurants?/i,
  ],
};

/**
 * Parse user message into an intent + entities.
 */
const parseIntent = (message) => {
  const msg = message.trim();

  // Check: list restaurants
  for (const pattern of INTENT_PATTERNS.listRestaurants) {
    if (pattern.test(msg)) {
      return { intent: 'listRestaurants' };
    }
  }

  // Check: show category from restaurant
  for (const pattern of INTENT_PATTERNS.showCategory) {
    const match = msg.match(pattern);
    if (match) {
      const category = match[1].trim();
      const restaurant = match[2].trim().replace(/[?.!]+$/, '');

      // Avoid false positives: "menu" is not a category
      if (category.toLowerCase() === 'menu') continue;

      return {
        intent: 'showCategory',
        restaurantName: restaurant,
        category,
      };
    }
  }

  // Check: show full menu
  for (const pattern of INTENT_PATTERNS.showMenu) {
    const match = msg.match(pattern);
    if (match) {
      const restaurant = match[1].trim().replace(/[?.!]+$/, '');
      return {
        intent: 'showMenu',
        restaurantName: restaurant,
      };
    }
  }

  return { intent: 'unknown', rawMessage: msg };
};

/**
 * Find a restaurant by fuzzy name matching.
 */
const findRestaurant = async (name) => {
  const normalized = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Exact normalized match
  let restaurant = await Restaurant.findOne({ normalizedName: normalized });
  if (restaurant) return restaurant;

  // Partial match via regex
  const escapedName = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  restaurant = await Restaurant.findOne({
    normalizedName: { $regex: escapedName, $options: 'i' },
  });
  if (restaurant) return restaurant;

  // Word-based search: match if all significant words appear
  const words = normalized.split(' ').filter((w) => w.length > 2);
  if (words.length > 0) {
    const wordRegex = words.map((w) => `(?=.*${w})`).join('');
    restaurant = await Restaurant.findOne({
      normalizedName: { $regex: new RegExp(wordRegex, 'i') },
    });
  }

  return restaurant;
};

/**
 * Handle a chat query and return structured response.
 */
const handleQuery = async (message) => {
  const { intent, restaurantName, category } = parseIntent(message);

  switch (intent) {
    case 'listRestaurants': {
      const restaurants = await Restaurant.find()
        .select('name createdAt')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      if (restaurants.length === 0) {
        return {
          type: 'text',
          message: 'No restaurants stored yet. Upload a menu image to get started!',
        };
      }

      return {
        type: 'restaurantList',
        restaurants: restaurants.map((r) => ({
          name: r.name,
          addedAt: r.createdAt,
        })),
        message: `Found ${restaurants.length} restaurant(s):`,
      };
    }

    case 'showMenu': {
      const restaurant = await findRestaurant(restaurantName);
      if (!restaurant) {
        return {
          type: 'text',
          message: `Could not find a restaurant matching "${restaurantName}". Try "list restaurants" to see what's available.`,
        };
      }

      const items = await MenuItem.find({ restaurantId: restaurant._id })
        .select('name category price')
        .sort({ category: 1, name: 1 })
        .lean();

      return {
        type: 'menuTable',
        restaurant: restaurant.name,
        items: items.map((i) => ({
          name: i.name,
          category: i.category,
          price: i.price,
        })),
        message: `Menu for "${restaurant.name}" (${items.length} items):`,
      };
    }

    case 'showCategory': {
      const restaurant = await findRestaurant(restaurantName);
      if (!restaurant) {
        return {
          type: 'text',
          message: `Could not find a restaurant matching "${restaurantName}".`,
        };
      }

      // Fuzzy category match
      const catRegex = new RegExp(category, 'i');
      const items = await MenuItem.find({
        restaurantId: restaurant._id,
        category: catRegex,
      })
        .select('name category price')
        .sort({ name: 1 })
        .lean();

      if (items.length === 0) {
        // Fall back: show all items and let user know
        const allItems = await MenuItem.find({ restaurantId: restaurant._id })
          .select('name category price')
          .sort({ category: 1, name: 1 })
          .lean();

        const categories = [...new Set(allItems.map((i) => i.category))];

        return {
          type: 'text',
          message: `No "${category}" category found at "${restaurant.name}". Available categories: ${categories.join(', ')}`,
        };
      }

      return {
        type: 'menuTable',
        restaurant: restaurant.name,
        items: items.map((i) => ({
          name: i.name,
          category: i.category,
          price: i.price,
        })),
        message: `${category} items from "${restaurant.name}" (${items.length} items):`,
      };
    }

    default:
      return {
        type: 'help',
        message: `I can help you with restaurant menus! Try:\n• "Show menu of [restaurant name]"\n• "Show desserts from [restaurant]"\n• "List restaurants"\n• Or upload a menu image to digitize it.`,
      };
  }
};

module.exports = { handleQuery };
