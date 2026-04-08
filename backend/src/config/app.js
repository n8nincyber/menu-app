const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const { limiter } = require('../middleware/rateLimiter');
const { requestLogger } = require('../middleware/requestLogger');
const { errorHandler, notFound } = require('../middleware/errorHandler');
const menuRoutes = require('../routes/menuRoutes');
const chatRoutes = require('../routes/chatRoutes');
const healthRoutes = require('../routes/healthRoutes');

const app = express();

// --- Security Middleware ---
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
}));
app.use(limiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(mongoSanitize());

// --- Logging ---
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// --- Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/chat', chatRoutes);

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
