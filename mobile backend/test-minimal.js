const express = require("express");
const http = require("http");
const cors = require("cors");

console.log('Starting minimal server...');

const app = express();
const server = http.createServer(app);

// 🔹 CORS Setup for Express
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Minimal server is running'
  });
});

// Start Server
const PORT = 8082;
server.listen(PORT, () => {
  console.log(`🌍 Minimal server running on port ${PORT}`);
  console.log('✅ Test http://localhost:8082/api/health');
});
