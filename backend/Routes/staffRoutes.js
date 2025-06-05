const express = require('express');
const { addStaff, getAllStaff, updateStaff, deleteStaff } = require('../Controllers/StaffController');

const router = express.Router();

router.post('/add', addStaff);
router.get('/', getAllStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);

module.exports = router;