const express = require('express');
const router = express.Router();
const upload = require('../Middlewares/uploadpic');
const { ensureAuthenticated, ensureAdmin } = require('../Middlewares/Auth');
const {
  addRoom,
  getAllRooms,
  updateRoom,
  deleteRoom,
  checkRoomAvailability,
  getRoomById,
  // Room recommendation functions
  recordRoomInteraction,
  getRoomRecommendations,
  getUserRoomHistory,
  getPopularRooms,
  // ML model functions
  getRealMLRoomRecommendations
} = require('../Controllers/roomController');

// Public routes
router.get('/', getAllRooms);
router.get('/availability', checkRoomAvailability);
router.get('/popular', getPopularRooms);
router.get('/:id', getRoomById);

// Room recommendation routes (authenticated users)
router.post('/interactions', ensureAuthenticated, recordRoomInteraction);
router.get('/recommendations/:userId', ensureAuthenticated, getRoomRecommendations);
router.get('/history/:userId', ensureAuthenticated, getUserRoomHistory);

// ML Model evaluation routes (public for testing)
router.get('/ml/accuracy', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:5002/accuracy');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Room ML service not available',
      details: error.message
    });
  }
});

router.get('/ml/confusion-matrix', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:5002/confusion-matrix');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Room ML service not available',
      details: error.message
    });
  }
});

router.get('/ml/status', async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios.get('http://localhost:5002/status');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Room ML service not available',
      details: error.message
    });
  }
});

// Admin routes
router.post('/', ensureAuthenticated, ensureAdmin, upload.single('image'), addRoom);
router.put('/:id', ensureAuthenticated, ensureAdmin, upload.single('image'), updateRoom);
router.delete('/:id', ensureAuthenticated, ensureAdmin, deleteRoom);

module.exports = router;