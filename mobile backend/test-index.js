const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

console.log('Starting server initialization...');

try {
  require("dotenv").config();
  console.log('✅ Environment variables loaded');
} catch (error) {
  console.error('❌ Error loading environment variables:', error.message);
}

try {
  require("./Models/db");
  console.log('✅ Database connection initiated');
} catch (error) {
  console.error('❌ Error connecting to database:', error.message);
}

const app = express();
const server = http.createServer(app);

// 🔹 CORS Setup for Express
const corsOptions = {
  origin: "*",  // Allow all origins during development
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Health check route to test the server
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

// 🔹 Start Server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🌍 Server running on port ${PORT}`);
  console.log('✅ Basic server started successfully');
});
