require('dotenv').config();
const app = require('./src/config/app');
const { connectDB } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[MenuLens] Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[MenuLens] Failed to start:', err.message);
    process.exit(1);
  }
};

start();
