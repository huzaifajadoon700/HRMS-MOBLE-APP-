const express = require('express');
const { signup, login, promoteToAdmin } = require('../Controllers/AuthController');
const { ensureAuthenticated, ensureAdmin } = require('../Middlewares/Auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/promote/:userId', ensureAuthenticated, ensureAdmin, promoteToAdmin);

module.exports = router;
