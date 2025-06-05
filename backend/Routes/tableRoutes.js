// // /routes/tableRoutes.js
// const express = require('express');
// const router = express.Router();
// const upload = require('../Middlewares/uploadpic');
// const { addTable } = require('../Controllers/tableController');
// const { getAllTables, updateTable, deleteTable } = require('../Controllers/tableController');

// // POST route to add a new table
// router.post('/add', upload.single('image'), addTable);

// // GET endpoint to fetch all tables (R operation)
// router.get('/', getAllTables);

// // PUT endpoint to update a table (U operation)
// router.put('/:id', upload.single('image'), updateTable);

// // DELETE endpoint to delete a table (D operation)
// router.delete('/:id', deleteTable);


// module.exports = router;
const express = require('express');
const router = express.Router();
const upload = require('../Middlewares/uploadpic');
const { ensureAuthenticated, ensureAdmin } = require('../Middlewares/auth');
const {
  addTable,
  getAllTables,
  updateTable,
  deleteTable,
  checkTableAvailability
} = require('../Controllers/tableController');

// Public routes
router.get('/', getAllTables);
router.get('/availability', checkTableAvailability);

// Admin routes
router.post('/', ensureAuthenticated, ensureAdmin, upload.single('image'), addTable);
router.put('/:id', ensureAuthenticated, ensureAdmin, upload.single('image'), updateTable);
router.delete('/:id', ensureAuthenticated, ensureAdmin, deleteTable);

module.exports = router;