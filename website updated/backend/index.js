const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
require("./Models/db");

// Initialize ML models
const mlModelLoader = require('./utils/mlModelLoader');
const tableMLLoader = require('./utils/tableMLModelLoader');

// Load food recommendation models
mlModelLoader.loadModels().then(success => {
  if (success) {
    console.log('🤖 Food Recommendation System initialized successfully!');
  } else {
    console.log('⚠️ Food Recommendation System failed to initialize, using fallback mode');
  }
});

// Load table recommendation models
tableMLLoader.loadModels().then(success => {
  if (success) {
    console.log('🍽️ Table Recommendation System initialized successfully!');
  } else {
    console.log('⚠️ Table Recommendation System failed to initialize, using fallback mode');
  }
});

const app = express();
const server = http.createServer(app);

// Import and initialize socket.io
const socketModule = require('./socket');
const io = socketModule.init(server);

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

// 📌 Import Routes
const menuRoutes = require("./Routes/menuRoutes");
const fileRoutes = require("./Routes/PicRoutes");
const tableRoutes = require("./Routes/tableRoutes");
const roomRoutes = require("./Routes/roomRoutes");
const staffRoutes = require("./Routes/staffRoutes");
const shiftRoutes = require("./Routes/shiftroutes");
const AuthRouter = require("./Routes/AuthRouter");
const ProductRouter = require("./Routes/ProductRouter");
const GoogleRoutes = require("./Routes/GoogleRoutes");
const bookingRoutes = require("./Routes/bookingRoutes");
const orderRoutes = require("./Routes/orderRoutes");
const reservationRoutes = require("./Routes/ReservationRoutes");
const userRoutes = require("./Routes/UserRoutes");
const feedbackRoutes = require("./Routes/feedbackRoutes");
const adminRoutes = require('./Routes/AdminRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');
const recommendationRoutes = require('./Routes/recommendationRoutes');
const fixImagesRoute = require('./Routes/fixImagesRoute');

// 📌 Serve Uploaded Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔹 Register Routes
app.use("/api/menus", menuRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/shift", shiftRoutes);
app.use("/auth", AuthRouter);
app.use("/api/products", ProductRouter);
app.use("/auth/google", GoogleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/table-reservations", reservationRoutes); // Alias for frontend compatibility
app.use("/api/user", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/food-recommendations", recommendationRoutes);
app.use("/api/table-recommendations", tableRoutes); // Table recommendations use same routes as tables
app.use("/api/fix", fixImagesRoute);

// Health check route to test the server
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

// API status endpoint for debugging
app.get('/api/status', (req, res) => {
  const endpoints = [
    '/api/rooms',
    '/api/orders',
    '/api/menus',
    '/api/bookings',
    '/api/reservations',
    '/api/table-reservations',
    '/api/tables',
    '/api/feedback/analytics',
    '/api/admin/dashboard/analytics'
  ];

  res.status(200).json({
    status: 'ok',
    message: 'Hotel Management System API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    availableEndpoints: endpoints,
    features: {
      authentication: 'JWT',
      database: 'MongoDB',
      fileUpload: 'Multer',
      recommendations: 'ML-powered',
      analytics: 'Real-time'
    }
  });
});

// ML Model info endpoint
app.get('/api/ml-info', (req, res) => {
  const modelInfo = mlModelLoader.getModelInfo();
  res.status(200).json({
    success: true,
    mlSystem: modelInfo,
    timestamp: new Date().toISOString()
  });
});

// 🔹 Start Server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🌍 Server running on port ${PORT}`);
});
