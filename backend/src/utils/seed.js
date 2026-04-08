/**
 * Seed script — populates MongoDB with demo restaurant data.
 *
 * Usage:
 *   node src/utils/seed.js
 *
 * Drops existing data and inserts fresh demo restaurants + menu items.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Restaurant, MenuItem } = require('../models');

const SEED_DATA = [
  {
    name: 'Pizza Palace',
    items: [
      { name: 'Margherita Pizza', category: 'Pizzas', price: '₹299' },
      { name: 'Farmhouse Pizza', category: 'Pizzas', price: '₹349' },
      { name: 'Pepperoni Feast', category: 'Pizzas', price: '₹399' },
      { name: 'BBQ Chicken Pizza', category: 'Pizzas', price: '₹429' },
      { name: 'Garlic Bread', category: 'Starters', price: '₹149' },
      { name: 'Cheesy Fries', category: 'Starters', price: '₹179' },
      { name: 'Bruschetta', category: 'Starters', price: '₹199' },
      { name: 'Tiramisu', category: 'Desserts', price: '₹249' },
      { name: 'Chocolate Lava Cake', category: 'Desserts', price: '₹229' },
      { name: 'Coca Cola', category: 'Beverages', price: '₹69' },
      { name: 'Fresh Lime Soda', category: 'Beverages', price: '₹99' },
      { name: 'Cold Coffee', category: 'Beverages', price: '₹149' },
    ],
  },
  {
    name: 'Café Milano',
    items: [
      { name: 'Espresso', category: 'Coffee', price: '₹149' },
      { name: 'Cappuccino', category: 'Coffee', price: '₹199' },
      { name: 'Latte Macchiato', category: 'Coffee', price: '₹229' },
      { name: 'Affogato', category: 'Coffee', price: '₹259' },
      { name: 'Caesar Salad', category: 'Salads', price: '₹279' },
      { name: 'Greek Salad', category: 'Salads', price: '₹249' },
      { name: 'Penne Arrabbiata', category: 'Pasta', price: '₹329' },
      { name: 'Spaghetti Carbonara', category: 'Pasta', price: '₹379' },
      { name: 'Fettuccine Alfredo', category: 'Pasta', price: '₹349' },
      { name: 'Panna Cotta', category: 'Desserts', price: '₹219' },
      { name: 'Gelato (2 scoops)', category: 'Desserts', price: '₹189' },
    ],
  },
  {
    name: 'Spice Garden',
    items: [
      { name: 'Paneer Butter Masala', category: 'Main Course', price: '₹289' },
      { name: 'Dal Makhani', category: 'Main Course', price: '₹249' },
      { name: 'Chicken Tikka Masala', category: 'Main Course', price: '₹339' },
      { name: 'Butter Naan', category: 'Breads', price: '₹49' },
      { name: 'Garlic Naan', category: 'Breads', price: '₹59' },
      { name: 'Laccha Paratha', category: 'Breads', price: '₹55' },
      { name: 'Hyderabadi Biryani', category: 'Biryani', price: '₹319' },
      { name: 'Veg Biryani', category: 'Biryani', price: '₹259' },
      { name: 'Gulab Jamun', category: 'Desserts', price: '₹129' },
      { name: 'Rasmalai', category: 'Desserts', price: '₹149' },
      { name: 'Mango Lassi', category: 'Beverages', price: '₹119' },
      { name: 'Masala Chai', category: 'Beverages', price: '₹69' },
    ],
  },
];

const seed = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/menulens';

  try {
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing data
    await MenuItem.deleteMany({});
    await Restaurant.deleteMany({});
    console.log('[Seed] Cleared existing data');

    for (const data of SEED_DATA) {
      const restaurant = await Restaurant.create({
        name: data.name,
        sourceImage: 'seed-data',
      });

      const items = data.items.map((item) => ({
        restaurantId: restaurant._id,
        name: item.name,
        category: item.category,
        price: item.price,
      }));

      await MenuItem.insertMany(items);
      console.log(`[Seed] Created "${data.name}" with ${items.length} items`);
    }

    console.log('[Seed] Done! Seeded 3 restaurants.');
  } catch (err) {
    console.error('[Seed] Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
