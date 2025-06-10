import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiCalendar, FiUsers, FiTable, FiTrash2, FiRefreshCw,
  FiSearch, FiFilter, FiGrid, FiList, FiEye, FiEdit,
  FiMapPin, FiClock, FiDollarSign, FiCheckCircle,
  FiXCircle, FiAlertCircle, FiDownload, FiMail, FiPhone
} from "react-icons/fi";
import "./AdminManageRooms.css";

const AdminManageReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("reservationDate");
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

    fetchReservations();
  }, [navigate]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...reservations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.tableNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.payment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter (you can add status field to reservations)
    if (statusFilter !== "all") {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "reservationDate") {
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

    setFilteredReservations(filtered);
  }, [reservations, searchTerm, statusFilter, sortBy, sortOrder]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/reservations", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Fetched reservations:", response.data);
      setReservations(response.data);
      setFilteredReservations(response.data);
      toast.success("Reservations loaded successfully");
      
    } catch (error) {
      console.error("Error fetching reservations:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const deleteToast = toast.loading("Deleting reservation...");
      
      const response = await axios.delete(`http://localhost:8080/api/reservations/${reservationId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.message === "Reservation deleted") {
        setReservations(prevReservations => 
          prevReservations.filter(reservation => reservation._id !== reservationId)
        );
        toast.update(deleteToast, {
          render: "Reservation deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
      } else {
        throw new Error(response.data.message || "Failed to delete reservation");
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      
      toast.error(error.response?.data?.message || "Failed to delete reservation");
      await fetchReservations(); // Refresh the list to ensure UI is in sync
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReservationStatus = (reservation) => {
    const today = new Date();
    const reservationDate = new Date(reservation.reservationDate);

    if (reservationDate > today) return { status: 'upcoming', color: 'blue' };
    if (reservationDate.toDateString() === today.toDateString()) return { status: 'today', color: 'green' };
    return { status: 'past', color: 'gray' };
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <FiClock />;
      case 'today': return <FiCheckCircle />;
      case 'past': return <FiCheckCircle />;
      default: return <FiAlertCircle />;
    }
  };

  return (
    <div className="enhanced-admin-reservations">
      {/* Enhanced Header */}
      <div className="enhanced-reservations-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiCalendar />
              </div>
              <div className="title-text">
                <h1 className="page-title">Reservation Management</h1>
                <p className="page-subtitle">Monitor and manage all table reservations</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiCalendar />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{reservations.length}</div>
                  <div className="stat-label">Total Reservations</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {reservations.filter(r => getReservationStatus(r).status === 'today').length}
                  </div>
                  <div className="stat-label">Today's Reservations</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiClock />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {reservations.filter(r => getReservationStatus(r).status === 'upcoming').length}
                  </div>
                  <div className="stat-label">Upcoming Reservations</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiDollarSign />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    Rs. {reservations.reduce((sum, r) => sum + parseFloat(r.totalPrice || 0), 0).toLocaleString('en-PK')}
                  </div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="action-btn secondary"
                onClick={fetchReservations}
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
      <div className="enhanced-reservations-controls">
        <div className="controls-container">
          <div className="search-section">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search reservations by ID, table, or payment method..."
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
                <option value="today">Today</option>
                <option value="past">Past</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="reservationDate">Reservation Date</option>
                <option value="totalPrice">Total Price</option>
                <option value="tableNumber">Table Number</option>
                <option value="guests">Number of Guests</option>
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
      <div className="enhanced-reservations-content">
        <div className="content-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <FiRefreshCw className="spinning" />
              </div>
              <p>Loading reservations...</p>
            </div>
          ) : filteredReservations.length > 0 ? (
            <div className={`reservations-${viewMode}`}>
              {viewMode === 'grid' ? (
                <div className="reservations-grid">
                  {filteredReservations.map((reservation) => {
                    const reservationStatus = getReservationStatus(reservation);
                    return (
                      <div key={reservation._id} className="reservation-card">
                        <div className="card-header">
                          <div className="reservation-id">
                            <span className="id-label">Reservation ID</span>
                            <span className="id-value">{reservation._id.slice(-8)}</span>
                          </div>
                          <div className={`status-badge ${reservationStatus.status}`}>
                            {getStatusIcon(reservationStatus.status)}
                            <span>{reservationStatus.status}</span>
                          </div>
                        </div>

                        <div className="card-content">
                          <div className="table-info">
                            <div className="table-details">
                              <FiTable className="detail-icon" />
                              <div>
                                <div className="table-number">Table {reservation.tableNumber}</div>
                                <div className="table-location">Main Dining Area</div>
                              </div>
                            </div>
                          </div>

                          <div className="reservation-details">
                            <div className="detail-item">
                              <FiCalendar className="detail-icon" />
                              <div>
                                <div className="detail-label">Date & Time</div>
                                <div className="detail-value">{formatDate(reservation.reservationDate)}</div>
                              </div>
                            </div>

                            <div className="detail-item">
                              <FiUsers className="detail-icon" />
                              <div>
                                <div className="detail-label">Guests</div>
                                <div className="detail-value">{reservation.guests} people</div>
                              </div>
                            </div>
                          </div>

                          <div className="payment-info">
                            <div className="detail-item">
                              <FiDollarSign className="detail-icon" />
                              <span>Payment: {reservation.payment}</span>
                            </div>
                          </div>

                          <div className="price-section">
                            <div className="total-price">
                              Rs. {parseInt(reservation.totalPrice).toLocaleString('en-PK')}
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
                            onClick={() => handleDeleteReservation(reservation._id)}
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
                <div className="reservations-list">
                  <div className="list-header">
                    <div className="list-header-item">Reservation</div>
                    <div className="list-header-item">Table</div>
                    <div className="list-header-item">Date & Time</div>
                    <div className="list-header-item">Guests</div>
                    <div className="list-header-item">Payment</div>
                    <div className="list-header-item">Total</div>
                    <div className="list-header-item">Actions</div>
                  </div>

                  {filteredReservations.map((reservation) => {
                    const reservationStatus = getReservationStatus(reservation);
                    return (
                      <div key={reservation._id} className="list-item">
                        <div className="list-cell">
                          <div className="reservation-info">
                            <div className="reservation-id">{reservation._id.slice(-8)}</div>
                            <div className={`status-badge ${reservationStatus.status}`}>
                              {getStatusIcon(reservationStatus.status)}
                              <span>{reservationStatus.status}</span>
                            </div>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="table-info">
                            <div className="table-number">Table {reservation.tableNumber}</div>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="date-info">
                            <div className="reservation-date">{formatDate(reservation.reservationDate)}</div>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="guests-info">
                            <FiUsers className="guests-icon" />
                            <span>{reservation.guests}</span>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="payment-method">{reservation.payment}</div>
                        </div>

                        <div className="list-cell">
                          <div className="price">
                            Rs. {parseInt(reservation.totalPrice).toLocaleString('en-PK')}
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
                              onClick={() => handleDeleteReservation(reservation._id)}
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
              <h3>No Reservations Found</h3>
              <p>
                {searchTerm || statusFilter !== "all"
                  ? "No reservations match your current filters. Try adjusting your search criteria."
                  : "No reservations have been made yet. Reservations will appear here once customers start booking tables."}
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

export default AdminManageReservations; 