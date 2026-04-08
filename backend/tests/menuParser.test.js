/**
 * Menu Parser — Unit Tests
 *
 * Run: npx jest tests/menuParser.test.js
 */

const { parseMenu } = require('../src/services/menuParser');

describe('MenuParser', () => {
  describe('parseMenu', () => {
    it('should extract restaurant name from first line', () => {
      const ocrResult = {
        text: '',
        confidence: 90,
        lines: [
          'The Grand Bistro',
          'STARTERS',
          'Garlic Bread 149',
          'Soup of the Day 129',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.restaurantName).toBe('The Grand Bistro');
    });

    it('should detect category headers (ALL CAPS)', () => {
      const ocrResult = {
        text: '',
        confidence: 88,
        lines: [
          'My Restaurant',
          'APPETIZERS',
          'Spring Rolls 199',
          'MAIN COURSE',
          'Grilled Chicken 399',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].category).toBe('Appetizers');
      expect(result.items[1].category).toBe('Main Course');
    });

    it('should detect category headers (colon-terminated)', () => {
      const ocrResult = {
        text: '',
        confidence: 85,
        lines: [
          'Cafe Blue',
          'Drinks:',
          'Latte 199',
          'Espresso 149',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.items[0].category).toBe('Drinks');
      expect(result.items[1].category).toBe('Drinks');
    });

    it('should extract prices with currency symbols', () => {
      const ocrResult = {
        text: '',
        confidence: 92,
        lines: [
          'Test Place',
          'Burger ₹299',
          'Fries $4.99',
          'Salad Rs 189',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.items).toHaveLength(3);
      expect(result.items[0].price).toContain('299');
      expect(result.items[1].price).toContain('4.99');
      expect(result.items[2].price).toContain('189');
    });

    it('should extract prices from bare numbers at end of line', () => {
      const ocrResult = {
        text: '',
        confidence: 80,
        lines: [
          'Corner Cafe',
          'FOOD',
          'Sandwich 250',
          'Pasta 350',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].price).toBe('₹250');
      expect(result.items[1].price).toBe('₹350');
    });

    it('should handle dot leaders between name and price', () => {
      const ocrResult = {
        text: '',
        confidence: 75,
        lines: [
          'Deli Shop',
          'Ham Sandwich.......... 299',
          'Turkey Wrap........... 349',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.items).toHaveLength(2);
      expect(result.items[0].name).toBe('Ham Sandwich');
      expect(result.items[1].name).toBe('Turkey Wrap');
    });

    it('should skip noise lines (phone, URL, address)', () => {
      const ocrResult = {
        text: '',
        confidence: 70,
        lines: [
          'Good Food Place',
          'www.goodfood.com',
          'Phone: 9876543210',
          'MENU',
          'Pasta 299',
          'All rights reserved',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Pasta');
    });

    it('should skip divider lines', () => {
      const ocrResult = {
        text: '',
        confidence: 85,
        lines: [
          'Bistro X',
          '============',
          'MAINS',
          '------------',
          'Steak 599',
          '***********',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Steak');
    });

    it('should deduplicate items', () => {
      const ocrResult = {
        text: '',
        confidence: 78,
        lines: [
          'Dupe Diner',
          'Burger 299',
          'Burger 299',
          'Fries 149',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.items).toHaveLength(2);
    });

    it('should handle items without prices', () => {
      const ocrResult = {
        text: '',
        confidence: 65,
        lines: [
          'Simple Menu',
          'SPECIALS',
          'Soup of the Day',
          'Chef Selection',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.items.length).toBeGreaterThanOrEqual(1);
      result.items.forEach((item) => {
        expect(item.price).toBe('—');
      });
    });

    it('should assign "General" category when none detected', () => {
      const ocrResult = {
        text: '',
        confidence: 80,
        lines: [
          'Quick Bites',
          'Samosa 30',
          'Vada Pav 25',
        ],
      };

      const result = parseMenu(ocrResult);
      result.items.forEach((item) => {
        expect(item.category).toBe('General');
      });
    });

    it('should return totalExtracted count', () => {
      const ocrResult = {
        text: '',
        confidence: 90,
        lines: [
          'Counter',
          'Tea 20',
          'Coffee 30',
          'Juice 50',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.totalExtracted).toBe(3);
    });

    it('should fallback to text split if lines array is empty', () => {
      const ocrResult = {
        text: 'Tiny Cafe\nMuffin 99\nCookie 79',
        confidence: 82,
        lines: [],
      };

      const result = parseMenu(ocrResult);
      expect(result.restaurantName).toBe('Tiny Cafe');
      expect(result.items.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle numbered list prefixes', () => {
      const ocrResult = {
        text: '',
        confidence: 85,
        lines: [
          'Numbered Place',
          '1. Butter Chicken 349',
          '2. Naan 49',
          '3. Raita 79',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.items[0].name).toBe('Butter Chicken');
      expect(result.items[1].name).toBe('Naan');
    });

    it('should return "Unknown Restaurant" if no name detected', () => {
      const ocrResult = {
        text: '',
        confidence: 50,
        lines: [
          '---',
          '***',
          'Pizza 299',
        ],
      };

      const result = parseMenu(ocrResult);
      expect(result.restaurantName).toBe('Unknown Restaurant');
    });
  });
});
