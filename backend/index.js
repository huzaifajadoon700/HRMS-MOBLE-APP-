const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
require("dotenv").config();
require("./Models/db");

// Initialize ML models
const mlModelLoader = require('./utils/mlModelLoader');
const tableMLLoader = require('./utils/tableMLModelLoader');

// Global variables to track Python services
let pythonModelService = null;
let roomModelService = null;

// Function to start Python food model service
function startPythonModelService() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting Python Food Model Service...');

    const pythonScript = path.join(__dirname, 'ml_models', 'start_model_service.py');

    // Check if Python script exists
    if (!fs.existsSync(pythonScript)) {
      console.log('⚠️ Python food model service script not found, using mock model');
      resolve(false);
      return;
    }

    // Try to start Python service with dependency installer
    try {
      pythonModelService = spawn('python', [pythonScript], {
        cwd: path.join(__dirname, 'ml_models'),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serviceReady = false;
      let startupTimeout;

      // Handle Python service output
      pythonModelService.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`Python Service: ${output}`);
        }

        // Check if service is ready
        if (output.includes('Running on') || output.includes('* Running on') || output.includes('Flask server starting') || output.includes('Model loaded successfully')) {
          if (!serviceReady) {
            serviceReady = true;
            clearTimeout(startupTimeout);
            console.log('Python Model Service started successfully!');
            resolve(true);
          }
        }
      });

      pythonModelService.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (!error.includes('WARNING') && !error.includes('INFO') && !error.includes('DeprecationWarning') && error) {
          console.log(`Python Service Error: ${error}`);
        }
      });

      pythonModelService.on('error', (error) => {
        console.log('Failed to start Python service:', error.message);
        if (!serviceReady) {
          resolve(false);
        }
      });

      pythonModelService.on('exit', (code) => {
        if (code !== 0) {
          console.log(`Python service exited with code ${code}`);
        }
        pythonModelService = null;
      });

      // Timeout after 8 seconds
      startupTimeout = setTimeout(() => {
        if (!serviceReady) {
          console.log('Python service startup timeout, using mock model');
          resolve(false);
        }
      }, 8000);

    } catch (error) {
      console.log('Error starting Python service:', error.message);
      resolve(false);
    }
  });
}

// Function to start Python room model service
function startRoomModelService() {
  return new Promise((resolve, reject) => {
    console.log('🏨 Starting Python Room Model Service...');

    const pythonScript = path.join(__dirname, 'rooms_ml_models', 'start_room_service.py');

    // Check if Python script exists
    if (!fs.existsSync(pythonScript)) {
      console.log('⚠️ Python room model service script not found, using mock model');
      resolve(false);
      return;
    }

    // Try to start Python room service
    try {
      roomModelService = spawn('python', [pythonScript], {
        cwd: path.join(__dirname, 'rooms_ml_models'),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let serviceReady = false;
      let startupTimeout;

      // Handle Python service output
      roomModelService.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
          console.log(`Room Service: ${output}`);
        }

        // Check if service is ready
        if (output.includes('Running on') || output.includes('* Running on') || output.includes('Flask server starting') || output.includes('Room model loaded successfully')) {
          if (!serviceReady) {
            serviceReady = true;
            clearTimeout(startupTimeout);
            console.log('Room Model Service started successfully!');
            resolve(true);
          }
        }
      });

      roomModelService.stderr.on('data', (data) => {
        const error = data.toString().trim();
        if (!error.includes('WARNING') && !error.includes('INFO') && !error.includes('DeprecationWarning') && error) {
          console.log(`Room Service Error: ${error}`);
        }
      });

      roomModelService.on('error', (error) => {
        console.log('Failed to start Room service:', error.message);
        if (!serviceReady) {
          resolve(false);
        }
      });

      roomModelService.on('exit', (code) => {
        if (code !== 0) {
          console.log(`Room service exited with code ${code}`);
        }
        roomModelService = null;
      });

      // Timeout after 8 seconds
      startupTimeout = setTimeout(() => {
        if (!serviceReady) {
          console.log('Room service startup timeout, using mock model');
          resolve(false);
        }
      }, 8000);

    } catch (error) {
      console.log('Error starting Room service:', error.message);
      resolve(false);
    }
  });
}

// Load food recommendation models with Python service
async function initializeRecommendationSystem() {
  console.log('🤖 Initializing Food Recommendation System...');

  // Start Python model service first
  const pythonServiceStarted = await startPythonModelService();

  // Wait a moment for Python service to fully initialize
  if (pythonServiceStarted) {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Load ML models
  const mlSuccess = await mlModelLoader.loadModels();

  if (mlSuccess) {
    console.log('Food Recommendation System initialized successfully!');
    if (pythonServiceStarted) {
      console.log('*** REAL SVD MODEL IS ACTIVE WITH 85% ACCURACY! ***');
    } else {
      console.log('Using mock SVD model (Python service unavailable)');
    }
  } else {
    console.log('Food Recommendation System failed to initialize');
  }

  return mlSuccess;
}

// Initialize the recommendation system
initializeRecommendationSystem();

// Initialize room recommendation system
async function initializeRoomRecommendationSystem() {
  console.log('🏨 Initializing Room Recommendation System...');

  // Start Python room model service
  const roomServiceStarted = await startRoomModelService();

  // Wait a moment for Python service to fully initialize
  if (roomServiceStarted) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('*** REAL ROOM SVD MODEL IS ACTIVE! ***');
  } else {
    console.log('Using mock room recommendation model (Python service unavailable)');
  }

  return roomServiceStarted;
}

// Initialize room recommendation system
initializeRoomRecommendationSystem();

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

// Graceful shutdown handling
function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);

  // Close Python model services
  if (pythonModelService) {
    console.log('🐍 Stopping Python food model service...');
    pythonModelService.kill('SIGTERM');
    pythonModelService = null;
  }

  if (roomModelService) {
    console.log('🏨 Stopping Python room model service...');
    roomModelService.kill('SIGTERM');
    roomModelService = null;
  }

  // Close server
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.log('⏰ Force exit after timeout');
    process.exit(1);
  }, 10000);
}

// Handle shutdown signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});
