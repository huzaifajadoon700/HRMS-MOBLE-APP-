import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaHotel, FaShoppingCart, FaComment, FaMoneyBillWave } from "react-icons/fa";
import "./DashboardModule.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboardmodule() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomsRes, ordersRes, feedbackRes, bookingsRes] = await Promise.all([
          axios.get("http://localhost:8080/api/rooms", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/feedback/analytics", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8080/api/bookings", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
        setOrders(Array.isArray(ordersRes.data?.orders) ? ordersRes.data.orders : []);
        setFeedbacks(feedbackRes.data?.data || {});
        setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setError("Failed to fetch dashboard data. Please try again.");
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dash-loading-container">
        <div className="dash-loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-error-container">
        <p className="dash-error-message">{error}</p>
        <button className="dash-retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((room) => room.status === "occupied").length;
  const availableRooms = totalRooms - occupiedRooms;

  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
  const pendingOrders = totalOrders - deliveredOrders;

  const totalFeedbacks = feedbacks.total || 0;
  const positiveFeedbacks = feedbacks.positive || 0;
  const negativeFeedbacks = feedbacks.negative || 0;

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: "rgba(0, 163, 255, 1)",
        backgroundColor: "rgba(0, 163, 255, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "rgba(240, 244, 252, 0.7)",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(240, 244, 252, 0.1)",
        },
        ticks: {
          color: "rgba(240, 244, 252, 0.7)",
        },
      },
      x: {
        grid: {
          color: "rgba(240, 244, 252, 0.1)",
        },
        ticks: {
          color: "rgba(240, 244, 252, 0.7)",
        },
      },
    },
  };

  return (
    <div className="dash-module-container">
      <div className="dash-module-header">
        <h1 className="dash-module-title">Dashboard Overview</h1>
        <p className="dash-module-subtitle">Welcome to your hotel management dashboard</p>
      </div>

      <div className="dash-metrics-grid">
        <div className="dash-metric-card">
          <div className="dash-metric-title">
            <FaHotel className="me-2" />
            Total Rooms
          </div>
          <div className="dash-metric-value">{totalRooms}</div>
          <div className="dash-metric-change">
            <span className="dash-status-available">Available: {availableRooms}</span>
            <span className="dash-status-occupied">Occupied: {occupiedRooms}</span>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-title">
            <FaShoppingCart className="me-2" />
            Total Orders
          </div>
          <div className="dash-metric-value">{totalOrders}</div>
          <div className="dash-metric-change">
            <span className="dash-status-delivered">Delivered: {deliveredOrders}</span>
            <span className="dash-status-pending">Pending: {pendingOrders}</span>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-title">
            <FaComment className="me-2" />
            Total Feedbacks
          </div>
          <div className="dash-metric-value">{totalFeedbacks}</div>
          <div className="dash-metric-change">
            <span className="dash-status-delivered">Positive: {positiveFeedbacks}</span>
            <span className="dash-status-occupied">Negative: {negativeFeedbacks}</span>
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-title">
            <FaMoneyBillWave className="me-2" />
            Total Revenue
          </div>
          <div className="dash-metric-value">${totalRevenue.toLocaleString()}</div>
          <div className="dash-metric-change positive">+12% from last month</div>
        </div>
      </div>

      <div className="dash-charts-grid">
        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Revenue Trend</h3>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="dash-chart-card">
          <h3 className="dash-chart-title">Room Occupancy</h3>
          <Bar
            data={{
              labels: ["Occupied", "Available"],
              datasets: [
                {
                  label: "Rooms",
                  data: [occupiedRooms, availableRooms],
                  backgroundColor: ["rgba(255, 77, 77, 0.5)", "rgba(0, 255, 157, 0.5)"],
                  borderColor: ["rgba(255, 77, 77, 1)", "rgba(0, 255, 157, 1)"],
                  borderWidth: 1,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
}



