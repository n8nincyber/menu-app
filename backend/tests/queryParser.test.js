/**
 * Query Service — Intent Parsing Unit Tests
 *
 * Run: npx jest tests/queryParser.test.js
 *
 * These tests cover the parseIntent function (extracted for testability).
 * They don't require a database connection.
 */

// Extract parseIntent directly for unit testing
// We'll test the regex patterns used by queryService

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

function parseIntent(message) {
  const msg = message.trim();

  for (const pattern of INTENT_PATTERNS.listRestaurants) {
    if (pattern.test(msg)) return { intent: 'listRestaurants' };
  }

  for (const pattern of INTENT_PATTERNS.showCategory) {
    const match = msg.match(pattern);
    if (match) {
      const category = match[1].trim();
      const restaurant = match[2].trim().replace(/[?.!]+$/, '');
      if (category.toLowerCase() === 'menu') continue;
      return { intent: 'showCategory', restaurantName: restaurant, category };
    }
  }

  for (const pattern of INTENT_PATTERNS.showMenu) {
    const match = msg.match(pattern);
    if (match) {
      const restaurant = match[1].trim().replace(/[?.!]+$/, '');
      return { intent: 'showMenu', restaurantName: restaurant };
    }
  }

  return { intent: 'unknown', rawMessage: msg };
}

describe('Query Intent Parser', () => {
  describe('listRestaurants intent', () => {
    const cases = [
      'list restaurants',
      'List all restaurants',
      'show restaurants',
      'show all restaurants',
      'what restaurants do you have',
      'what restaurants are available',
      'available restaurants',
    ];

    cases.forEach((input) => {
      it(`should detect listRestaurants: "${input}"`, () => {
        expect(parseIntent(input).intent).toBe('listRestaurants');
      });
    });
  });

  describe('showMenu intent', () => {
    it('should parse "show menu of Pizza Palace"', () => {
      const result = parseIntent('show menu of Pizza Palace');
      expect(result.intent).toBe('showMenu');
      expect(result.restaurantName).toBe('Pizza Palace');
    });

    it('should parse "Show me the menu of Café Milano"', () => {
      const result = parseIntent('Show me the menu of Café Milano');
      expect(result.intent).toBe('showMenu');
      expect(result.restaurantName).toBe('Café Milano');
    });

    it('should parse "menu for Spice Garden"', () => {
      const result = parseIntent('menu for Spice Garden');
      expect(result.intent).toBe('showMenu');
      expect(result.restaurantName).toBe('Spice Garden');
    });

    it('should parse "what does Burger King have"', () => {
      const result = parseIntent('what does Burger King have');
      expect(result.intent).toBe('showMenu');
      expect(result.restaurantName).toBe('Burger King');
    });

    it('should parse "Pizza Palace\'s menu"', () => {
      const result = parseIntent("Pizza Palace's menu");
      expect(result.intent).toBe('showMenu');
      expect(result.restaurantName).toBe("Pizza Palace's");
    });

    it('should strip trailing punctuation', () => {
      const result = parseIntent('show menu of Taco Bell?');
      expect(result.restaurantName).toBe('Taco Bell');
    });
  });

  describe('showCategory intent', () => {
    it('should parse "show desserts from Café Milano"', () => {
      const result = parseIntent('show desserts from Café Milano');
      expect(result.intent).toBe('showCategory');
      expect(result.category).toBe('desserts');
      expect(result.restaurantName).toBe('Café Milano');
    });

    it('should parse "list starters at Pizza Palace"', () => {
      const result = parseIntent('list starters at Pizza Palace');
      expect(result.intent).toBe('showCategory');
      expect(result.category).toBe('starters');
      expect(result.restaurantName).toBe('Pizza Palace');
    });

    it('should parse "find beverages of Spice Garden"', () => {
      const result = parseIntent('find beverages of Spice Garden');
      expect(result.intent).toBe('showCategory');
      expect(result.category).toBe('beverages');
      expect(result.restaurantName).toBe('Spice Garden');
    });

    it('should NOT classify "show menu of X" as showCategory', () => {
      const result = parseIntent('show menu of Pizza Palace');
      // "menu" as category should be skipped → falls through to showMenu
      expect(result.intent).toBe('showMenu');
    });
  });

  describe('unknown intent', () => {
    it('should return unknown for gibberish', () => {
      const result = parseIntent('asdfghjkl');
      expect(result.intent).toBe('unknown');
    });

    it('should return unknown for greetings', () => {
      const result = parseIntent('hello there');
      expect(result.intent).toBe('unknown');
    });

    it('should return unknown for empty-ish input', () => {
      const result = parseIntent('   ');
      expect(result.intent).toBe('unknown');
    });
  });
});
