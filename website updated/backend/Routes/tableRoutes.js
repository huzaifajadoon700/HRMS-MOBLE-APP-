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
const { ensureAuthenticated, ensureAdmin } = require('../Middlewares/Auth');
const {
  addTable,
  getAllTables,
  updateTable,
  deleteTable,
  checkTableAvailability
} = require('../Controllers/tableController');

const {
  recordTableInteraction,
  getTableRecommendations,
  getUserTableHistory,
  getPopularTables,
  getTableAnalytics
} = require('../Controllers/tableRecommendationController');

const {
  getTableAnalyticsDashboard,
  getTablePerformanceMetrics,
  updateMLModelSettings,
  refreshMLModelCache
} = require('../Controllers/adminTableController');

// Public routes
router.get('/', getAllTables);
router.get('/availability', checkTableAvailability);
router.get('/popular', getPopularTables);

// Table recommendation routes (authenticated users)
router.post('/interactions', ensureAuthenticated, recordTableInteraction);
router.get('/recommendations/:userId', ensureAuthenticated, getTableRecommendations);
router.get('/recommendations', ensureAuthenticated, getTableRecommendations); // For current user
router.get('/history/:userId', ensureAuthenticated, getUserTableHistory);

// Admin routes
router.post('/', ensureAuthenticated, ensureAdmin, upload.single('image'), addTable);
router.post('/add', ensureAuthenticated, ensureAdmin, upload.single('image'), addTable); // Alternative route for frontend compatibility
router.put('/:id', ensureAuthenticated, ensureAdmin, upload.single('image'), updateTable);
router.delete('/:id', ensureAuthenticated, ensureAdmin, deleteTable);
router.get('/analytics', ensureAuthenticated, ensureAdmin, getTableAnalytics);

// Admin recommendation analytics routes
router.get('/admin/dashboard', ensureAuthenticated, ensureAdmin, getTableAnalyticsDashboard);
router.get('/admin/performance/:tableId', ensureAuthenticated, ensureAdmin, getTablePerformanceMetrics);
router.put('/admin/ml-settings', ensureAuthenticated, ensureAdmin, updateMLModelSettings);
router.post('/admin/refresh-cache', ensureAuthenticated, ensureAdmin, refreshMLModelCache);

module.exports = router;