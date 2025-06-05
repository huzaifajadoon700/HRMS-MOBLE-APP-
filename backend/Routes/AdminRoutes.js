const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, toggleUserStatus } = require('../Controllers/AdminController');
const { ensureAuthenticated, ensureAdmin } = require('../Middlewares/Auth');

// Apply authentication and admin middleware to all routes
router.use(ensureAuthenticated);
router.use(ensureAdmin);

// Get all users
router.get('/users', getAllUsers);

// Update user
router.put('/users/:id', updateUser);

// Delete user
router.delete('/users/:id', deleteUser);

// Toggle user status
router.patch('/users/:id/toggle-status', toggleUserStatus);

module.exports = router; 