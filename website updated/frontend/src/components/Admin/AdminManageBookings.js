import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiCalendar, FiUsers, FiCreditCard, FiTrash2, FiRefreshCw,
  FiSearch, FiFilter, FiGrid, FiList, FiEye, FiEdit,
  FiMapPin, FiClock, FiDollarSign, FiHome, FiCheckCircle,
  FiXCircle, FiAlertCircle, FiDownload, FiMail
} from "react-icons/fi";
import "./AdminManageBookings.css";

const AdminManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("checkInDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }
    
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/bookings", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Fetched bookings:", response.data);
      setBookings(response.data);
      setFilteredBookings(response.data);
      toast.success("Bookings loaded successfully");
      
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const deleteToast = toast.loading("Deleting booking...");
      
      const response = await axios.delete(`http://localhost:8080/api/bookings/${bookingId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setBookings(prevBookings => prevBookings.filter(booking => booking._id !== bookingId));
        toast.update(deleteToast, {
          render: "Booking deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
      } else {
        throw new Error(response.data.message || "Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      
      let errorMessage = "Failed to delete booking.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      await fetchBookings(); // Refresh the list to ensure UI is in sync
    } finally {
      setLoading(false);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...bookings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.roomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.payment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter (you can add status field to bookings)
    if (statusFilter !== "all") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "checkInDate" || sortBy === "checkOutDate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === "totalPrice") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, sortBy, sortOrder]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBookingStatus = (booking) => {
    const today = new Date();
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);

    if (today < checkIn) return { status: 'upcoming', color: 'blue' };
    if (today >= checkIn && today <= checkOut) return { status: 'active', color: 'green' };
    return { status: 'completed', color: 'gray' };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <FiClock />;
      case 'active': return <FiCheckCircle />;
      case 'completed': return <FiCheckCircle />;
      default: return <FiAlertCircle />;
    }
  };

  return (
    <div className="enhanced-admin-bookings">
      {/* Enhanced Header */}
      <div className="enhanced-bookings-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiCalendar />
              </div>
              <div className="title-text">
                <h1 className="page-title">Booking Management</h1>
                <p className="page-subtitle">Monitor and manage all hotel bookings</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiCalendar />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{bookings.length}</div>
                  <div className="stat-label">Total Bookings</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {bookings.filter(b => getBookingStatus(b).status === 'active').length}
                  </div>
                  <div className="stat-label">Active Bookings</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiDollarSign />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    Rs. {bookings.reduce((sum, b) => sum + parseFloat(b.totalPrice || 0), 0).toLocaleString('en-PK')}
                  </div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="action-btn secondary"
                onClick={fetchBookings}
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'spinning' : ''} />
                <span>Refresh</span>
              </button>

              <button className="action-btn primary">
                <FiDownload />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="enhanced-bookings-controls">
        <div className="controls-container">
          <div className="search-section">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search bookings by ID, room, or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="checkInDate">Check-in Date</option>
                <option value="checkOutDate">Check-out Date</option>
                <option value="totalPrice">Total Price</option>
                <option value="roomNumber">Room Number</option>
              </select>
            </div>

            <button
              className={`sort-btn ${sortOrder === 'asc' ? 'asc' : 'desc'}`}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="view-section">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="enhanced-bookings-content">
        <div className="content-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <FiRefreshCw className="spinning" />
              </div>
              <p>Loading bookings...</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className={`bookings-${viewMode}`}>
              {viewMode === 'grid' ? (
                <div className="bookings-grid">
                  {filteredBookings.map((booking) => {
                    const bookingStatus = getBookingStatus(booking);
                    return (
                      <div key={booking._id} className="booking-card">
                        <div className="card-header">
                          <div className="booking-id">
                            <span className="id-label">Booking ID</span>
                            <span className="id-value">{booking._id.slice(-8)}</span>
                          </div>
                          <div className={`status-badge ${bookingStatus.status}`}>
                            {getStatusIcon(bookingStatus.status)}
                            <span>{bookingStatus.status}</span>
                          </div>
                        </div>

                        <div className="card-content">
                          <div className="room-info">
                            <div className="room-details">
                              <FiHome className="detail-icon" />
                              <div>
                                <div className="room-type">{booking.roomType}</div>
                                <div className="room-number">Room {booking.roomNumber}</div>
                              </div>
                            </div>
                          </div>

                          <div className="booking-dates">
                            <div className="date-item">
                              <FiCalendar className="date-icon" />
                              <div>
                                <div className="date-label">Check-in</div>
                                <div className="date-value">{formatDate(booking.checkInDate)}</div>
                              </div>
                            </div>
                            <div className="date-item">
                              <FiCalendar className="date-icon" />
                              <div>
                                <div className="date-label">Check-out</div>
                                <div className="date-value">{formatDate(booking.checkOutDate)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="booking-details">
                            <div className="detail-item">
                              <FiUsers className="detail-icon" />
                              <span>{booking.guests} Guests</span>
                            </div>
                            <div className="detail-item">
                              <FiCreditCard className="detail-icon" />
                              <span>{booking.payment}</span>
                            </div>
                          </div>

                          <div className="price-section">
                            <div className="total-price">
                              Rs. {parseInt(booking.totalPrice).toLocaleString('en-PK')}
                            </div>
                          </div>
                        </div>

                        <div className="card-actions">
                          <button className="action-btn secondary small">
                            <FiEye />
                            <span>View</span>
                          </button>
                          <button className="action-btn secondary small">
                            <FiEdit />
                            <span>Edit</span>
                          </button>
                          <button className="action-btn secondary small">
                            <FiMail />
                            <span>Contact</span>
                          </button>
                          <button
                            className="action-btn danger small"
                            onClick={() => handleDeleteBooking(booking._id)}
                            disabled={loading}
                          >
                            <FiTrash2 />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bookings-list">
                  <div className="list-header">
                    <div className="list-header-item">Booking</div>
                    <div className="list-header-item">Room</div>
                    <div className="list-header-item">Dates</div>
                    <div className="list-header-item">Details</div>
                    <div className="list-header-item">Price</div>
                    <div className="list-header-item">Actions</div>
                  </div>

                  {filteredBookings.map((booking) => {
                    const bookingStatus = getBookingStatus(booking);
                    return (
                      <div key={booking._id} className="list-item">
                        <div className="list-cell">
                          <div className="booking-info">
                            <div className="booking-id">{booking._id.slice(-8)}</div>
                            <div className={`status-badge ${bookingStatus.status}`}>
                              {getStatusIcon(bookingStatus.status)}
                              <span>{bookingStatus.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="room-info">
                            <div className="room-type">{booking.roomType}</div>
                            <div className="room-number">Room {booking.roomNumber}</div>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="dates-info">
                            <div className="date-range">
                              {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                            </div>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="booking-details">
                            <div className="detail">{booking.guests} Guests</div>
                            <div className="detail">{booking.payment}</div>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="price">
                            Rs. {parseInt(booking.totalPrice).toLocaleString('en-PK')}
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="actions">
                            <button className="action-btn secondary small">
                              <FiEye />
                            </button>
                            <button className="action-btn secondary small">
                              <FiEdit />
                            </button>
                            <button
                              className="action-btn danger small"
                              onClick={() => handleDeleteBooking(booking._id)}
                              disabled={loading}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FiCalendar />
              </div>
              <h3>No Bookings Found</h3>
              <p>
                {searchTerm || statusFilter !== "all"
                  ? "No bookings match your current filters. Try adjusting your search criteria."
                  : "No bookings have been made yet. Bookings will appear here once customers start making reservations."}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  className="action-btn primary"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageBookings;
