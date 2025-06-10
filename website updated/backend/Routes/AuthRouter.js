const express = require('express');
const { signup, login, promoteToAdmin } = require('../Controllers/AuthController');
const { ensureAuthenticated, ensureAdmin } = require('../Middlewares/Auth');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');

const router = express.Router();

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.put('/promote/:userId', ensureAuthenticated, ensureAdmin, promoteToAdmin);

module.exports = router;
