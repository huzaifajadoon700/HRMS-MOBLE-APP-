const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../Middlewares/Auth");
const {
  getProfile,
  updateProfile,
  updatePassword,
  getUserById
} = require("../Controllers/UserController");

// ✅ Get User Profile (Logged-in users only)
router.get("/profile", ensureAuthenticated, getProfile);

// ✅ Get User by ID (Logged-in users only)
router.get("/:id", ensureAuthenticated, getUserById);

// ✅ Update User Profile (Logged-in users only)
router.put("/profile", ensureAuthenticated, updateProfile);

// ✅ Update User Password (Logged-in users only)
router.put("/password", ensureAuthenticated, updatePassword);

module.exports = router;