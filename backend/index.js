const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
require("./Models/db");

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
app.use("/api/user", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);

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
});
