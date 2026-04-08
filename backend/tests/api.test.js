/**
 * API Integration Tests
 *
 * Run: npx jest tests/api.test.js
 *
 * These test the Express routes without needing a real MongoDB.
 * They use a mock approach for DB calls.
 */

const request = require('supertest');

// We need to mock mongoose before requiring the app
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      readyState: 1,
      on: jest.fn(),
    },
  };
});

const app = require('../src/config/app');

describe('API Endpoints', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/api/health');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('POST /api/chat/query', () => {
    it('should reject empty body', async () => {
      const res = await request(app)
        .post('/api/chat/query')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject empty message', async () => {
      const res = await request(app)
        .post('/api/chat/query')
        .send({ message: '' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject message over 500 chars', async () => {
      const res = await request(app)
        .post('/api/chat/query')
        .send({ message: 'x'.repeat(501) });

      expect(res.statusCode).toBe(400);
    });

    it('should reject non-string message', async () => {
      const res = await request(app)
        .post('/api/chat/query')
        .send({ message: 12345 });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/menu/upload', () => {
    it('should reject request with no file', async () => {
      const res = await request(app)
        .post('/api/menu/upload');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('404 handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/nonexistent');

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Route not found');
    });
  });
});
