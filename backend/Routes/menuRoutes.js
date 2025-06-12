const express = require('express');
const router = express.Router();
const {
    getMenus,
    getMenusByCategory,
    addMenu,
    updateMenu,
    deleteMenu,
    toggleAvailability,
} = require('../Controllers/MenuController');
const { ensureAuthenticated, ensureAdmin } = require('../Middlewares/auth');
const upload = require('../Middlewares/uploadpic');

// Public routes
router.get('/', getMenus);
router.get('/category/:category', getMenusByCategory);

// Admin routes
router.post('/', ensureAuthenticated, ensureAdmin, upload.single('image'), addMenu);
router.put('/:id', ensureAuthenticated, ensureAdmin, upload.single('image'), updateMenu);
router.delete('/:id', ensureAuthenticated, ensureAdmin, deleteMenu);
router.patch('/:id/toggle-availability', ensureAuthenticated, ensureAdmin, toggleAvailability);

module.exports = router;