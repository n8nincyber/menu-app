const express = require('express');
const router = express.Router();
const { chatQuery } = require('../controllers/chatController');
const { validateChatQuery } = require('../middleware/validators');

router.post('/query', validateChatQuery, chatQuery);

module.exports = router;
