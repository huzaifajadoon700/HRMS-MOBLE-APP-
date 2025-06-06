import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Home, Booking, AboutUs, Contact, PageNotFound, Room, Services, Team, Testimonial, Help } from "./pages/index";
import Header from "./components/common/Header";
import Footer from "./components/layout/Footer";
import LoginPage from "./components/Auth/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Dashboard from "./components/Admin/Sidebar";
import BookRoom from "./pages/BookRoom";
import OrderFood from "./pages/OrderFood";
import Cart from "./components/orders/Cart";
import MyOrders from "./components/User/MyOrders.jsx";
import Invoice from "./components/orders/Invoice";
import MyBookings from "./components/User/MyBookings";
import MyReservations from "./components/User/MyReservations";
import AdminOrders from "./pages/AdminOrders";
import DeliveryTracking from "./components/DeliveryTracking";
import DeliveryTrackingPage from "./components/DeliveryTracking";
import ReserveTable from "./pages/ReserveTable";
import TableReservationPage from "./pages/TableReservationPage";
import TableConfirmationPage from "./pages/TableConfirmationPage";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Profile from "./components/User/Profile";
import Feedback from "./components/User/Feedback";
import "./styles/theme.css";
import "./styles/global.css";
import BookingPage from './pages/BookingPage';
import BookingConfirmation from "./pages/BookingConfirmation";
import OrderTracking from "./pages/OrderTracking";
import { Toaster } from 'react-hot-toast';

// Layout Component for Header and Footer
const Layout = ({ children }) => {
  const location = useLocation();
  const excludeHeaderFooter = location.pathname === "/dashboard";
  return (
    <>
      {!excludeHeaderFooter && <Header />}
      <main className="main-content">
        {children}
      </main>
      {!excludeHeaderFooter && <Footer />}
    </>
  );
};

// Authenticated Route Wrapper
const AuthenticatedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const role = localStorage.getItem("role");
  return role === "admin" ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(17, 34, 64, 0.9)',
            color: '#f0f4fc',
            border: '1px solid rgba(100, 255, 218, 0.1)',
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/booking" element={<Layout><Booking /></Layout>} />
          <Route path="/about" element={<Layout><AboutUs /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/rooms" element={<Layout><Room /></Layout>} />
          <Route path="/services" element={<Layout><Services /></Layout>} />
          <Route path="/team" element={<Layout><Team /></Layout>} />
          <Route path="/testimonial" element={<Layout><Testimonial /></Layout>} />
          <Route path="/help" element={<Layout><Help /></Layout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/book-room" element={<Layout><BookRoom /></Layout>} />
          <Route path="/order-food" element={<Layout><OrderFood /></Layout>} />
          <Route path="/cart" element={<Layout><Cart /></Layout>} />
          <Route path="/my-orders" element={<Layout><MyOrders /></Layout>} />
          <Route path="/invoice/:orderId" element={<Layout><Invoice /></Layout>} />
          <Route path="/my-bookings" element={<Layout><MyBookings /></Layout>} />
          <Route path="/my-reservations" element={<Layout><MyReservations /></Layout>} />
          <Route path="/admin-orders" element={<Layout><AdminOrders /></Layout>} />
          <Route path="/delivery-tracking" element={<Layout><DeliveryTrackingPage /></Layout>} />
          <Route path="/reserve-table" element={<Layout><ReserveTable /></Layout>} />
          <Route path="/table-reservation" element={<Layout><TableReservationPage /></Layout>} />
          <Route path="/table-confirmation" element={<Layout><TableConfirmationPage /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/feedback" element={<Layout><Feedback /></Layout>} />
          <Route path="/booking-page/:id" element={<Layout><BookingPage /></Layout>} />
          <Route path="/booking-confirmation" element={<Layout><BookingConfirmation /></Layout>} />
          <Route path="/order-confirmation" element={
            <AuthenticatedRoute>
              <Layout><OrderConfirmation /></Layout>
            </AuthenticatedRoute>
          } />
          <Route path="/track-order/:orderId" element={
            <AuthenticatedRoute>
              <Layout><OrderTracking /></Layout>
            </AuthenticatedRoute>
          } />
          <Route path="*" element={<Layout><PageNotFound /></Layout>} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;