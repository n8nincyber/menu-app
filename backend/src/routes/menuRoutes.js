const express = require('express');
const router = express.Router();
const { uploadMenu } = require('../controllers/menuController');
const { upload } = require('../middleware/fileUpload');
const { validateUpload } = require('../middleware/validators');
const { uploadLimiter } = require('../middleware/rateLimiter');

router.post('/upload', uploadLimiter, upload.single('image'), validateUpload, uploadMenu);

module.exports = router;
