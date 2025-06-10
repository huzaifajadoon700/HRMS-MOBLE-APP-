const express = require('express');
const router = express.Router();
const { googleAuth } = require('../Controllers/GoogleController');

// Route for Google login
router.post('/google', googleAuth);

module.exports = router;
