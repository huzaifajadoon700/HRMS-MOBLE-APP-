const express = require('express');
const router = express.Router();
const upload = require('../Middlewares/uploadpic')

// POST endpoint for file upload
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    res.status(200).json({ message: 'File uploaded successfully', filePath: req.file.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
