const express = require('express');
const {
  addShift,
  getAllShifts,
  updateShiftStatus,
  deleteShift,
} = require('../Controllers/shift controller');
const { ensureAuthenticated } = require('../Middlewares/Auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(ensureAuthenticated);

// Shift routes
router.post('/add', addShift);
router.get('/', getAllShifts);
router.patch('/:id/status', updateShiftStatus);
router.delete('/:id', deleteShift);

module.exports = router;