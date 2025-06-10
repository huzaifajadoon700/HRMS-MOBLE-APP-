import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Badge, Nav } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiStar, FiTrendingUp, FiBarChart2, FiUsers, FiHome, FiEye, FiEdit,
  FiTrash, FiPlus, FiFilter, FiSearch, FiRefreshCw, FiGrid, FiList,
  FiMapPin, FiDollarSign, FiCalendar, FiClock, FiWifi, FiTv, FiCoffee
} from "react-icons/fi";
import RoomRecommendationAnalytics from "./RoomRecommendationAnalytics";
import "./AdminManageRooms.css";

const AdminViewRooms = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState('rooms');
  const [popularRooms, setPopularRooms] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('roomNumber');

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchRooms();
    fetchPopularRooms();
  }, [navigate]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/rooms", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularRooms = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/rooms/popular?count=10");
      if (response.data.success) {
        setPopularRooms(response.data.popularRooms);
      }
    } catch (error) {
      console.error("Error fetching popular rooms:", error);
    }
  };

  // Format price in Pakistani Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-room.jpg';
    try {
      if (imagePath.startsWith('http')) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, '');
      if (cleanPath.includes('uploads')) {
        return `http://localhost:8080/${cleanPath}`;
      }
      return `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error('Error formatting image URL:', error);
      return '/images/placeholder-room.jpg';
    }
  };

  // Filter and sort rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.roomType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price': return a.price - b.price;
      case 'rating': return (b.averageRating || 0) - (a.averageRating || 0);
      case 'roomNumber': return a.roomNumber - b.roomNumber;
      default: return 0;
    }
  });

  return (
    <div className="enhanced-admin-rooms">
      <div className="enhanced-rooms-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiHome />
              </div>
              <div className="title-text">
                <h1 className="page-title">Room Management</h1>
                <p className="page-subtitle">Manage rooms and view analytics</p>
              </div>
            </div>

            <div className="header-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiHome />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{rooms.length}</span>
                  <span className="stat-label">Total Rooms</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FiTrendingUp />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{popularRooms.length}</span>
                  <span className="stat-label">Popular</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FiEye />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{rooms.filter(r => r.status === 'available').length}</span>
                  <span className="stat-label">Available</span>
                </div>
              </div>
            </div>
          </div>

          <div className="controls-section">
            <div className="search-controls">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-controls">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="roomNumber">Room Number</option>
                  <option value="price">Price</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            <div className="view-controls">
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
              <button
                className="refresh-btn"
                onClick={fetchRooms}
              >
                <FiRefreshCw />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="enhanced-tabs">
        <div className="tab-container">
          <button
            className={`enhanced-tab ${activeTab === 'rooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('rooms')}
          >
            <FiHome className="tab-icon" />
            <span className="tab-text">All Rooms</span>
            <span className="tab-badge">{filteredRooms.length}</span>
          </button>
          <button
            className={`enhanced-tab ${activeTab === 'popular' ? 'active' : ''}`}
            onClick={() => setActiveTab('popular')}
          >
            <FiTrendingUp className="tab-icon" />
            <span className="tab-text">Popular Rooms</span>
            <span className="tab-badge">{popularRooms.length}</span>
          </button>
          <button
            className={`enhanced-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FiBarChart2 className="tab-icon" />
            <span className="tab-text">Analytics</span>
          </button>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="enhanced-content">
        {activeTab === 'analytics' ? (
          <RoomRecommendationAnalytics />
        ) : (
          <div className={`rooms-container ${viewMode}-view`}>
            {loading ? (
              <div className="enhanced-loading">
                <div className="loading-spinner">
                  <div className="spinner-ring"></div>
                  <div className="spinner-ring"></div>
                  <div className="spinner-ring"></div>
                </div>
                <p className="loading-text">Loading rooms...</p>
              </div>
            ) : (activeTab === 'rooms' ? filteredRooms : popularRooms).length > 0 ? (
              <div className="enhanced-rooms-grid">
                {(activeTab === 'rooms' ? filteredRooms : popularRooms).map((roomItem) => {
                  const room = roomItem.roomDetails || roomItem;
                  const isPopular = activeTab === 'popular';

                  return (
                    <div key={room._id} className={`enhanced-room-card ${isPopular ? 'popular' : ''} ${viewMode}-card`}>
                      <div className="room-image-container">
                        <img
                          src={getImageUrl(room.image)}
                          alt={`Room ${room.roomNumber}`}
                          className="room-image"
                          onError={(e) => {
                            e.target.src = "/images/placeholder-room.jpg";
                            e.target.onerror = null;
                          }}
                        />
                        <div className="image-overlay">
                          <div className="overlay-actions">
                            <button className="action-btn view-btn">
                              <FiEye />
                            </button>
                            <button className="action-btn edit-btn">
                              <FiEdit />
                            </button>
                            <button className="action-btn delete-btn">
                              <FiTrash />
                            </button>
                          </div>
                        </div>

                        <div className="room-badges">
                          <span className={`status-badge ${room.status?.toLowerCase() || 'available'}`}>
                            {room.status || 'Available'}
                          </span>
                          {isPopular && (
                            <span className="popular-badge">
                              <FiTrendingUp />
                              Popular
                            </span>
                          )}
                          {isPopular && roomItem.score && (
                            <span className="score-badge">
                              <FiStar />
                              {roomItem.score.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>


                      <div className="room-content">
                        <div className="room-header">
                          <div className="room-title">
                            <h3 className="room-number">Room {room.roomNumber}</h3>
                            <span className="room-type">{room.roomType}</span>
                          </div>
                          <div className="room-price">
                            <span className="price-amount">{formatPrice(room.price)}</span>
                            <span className="price-period">per night</span>
                          </div>
                        </div>

                        <p className="room-description">{room.description}</p>


                        <div className="room-stats">
                          {room.averageRating > 0 && (
                            <div className="stat-item">
                              <FiStar className="stat-icon rating" />
                              <span className="stat-value">{room.averageRating.toFixed(1)}</span>
                              {room.totalRatings > 0 && (
                                <span className="stat-label">({room.totalRatings} reviews)</span>
                              )}
                            </div>
                          )}
                          {room.capacity && (
                            <div className="stat-item">
                              <FiUsers className="stat-icon capacity" />
                              <span className="stat-value">{room.capacity}</span>
                              <span className="stat-label">guests</span>
                            </div>
                          )}
                        </div>

                        <div className="room-amenities">
                          {room.amenities && room.amenities.length > 0 ? (
                            room.amenities.slice(0, 4).map((amenity, index) => (
                              <div key={index} className="amenity-tag">
                                <span className="amenity-text">{amenity}</span>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="amenity-tag">
                                <FiWifi className="amenity-icon" />
                                <span className="amenity-text">WiFi</span>
                              </div>
                              <div className="amenity-tag">
                                <FiTv className="amenity-icon" />
                                <span className="amenity-text">Smart TV</span>
                              </div>
                              <div className="amenity-tag">
                                <FiCoffee className="amenity-icon" />
                                <span className="amenity-text">Mini Bar</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="enhanced-empty-state">
                <div className="empty-icon">
                  <FiHome />
                </div>
                <div className="empty-content">
                  <h3 className="empty-title">
                    No {activeTab === 'popular' ? 'popular ' : ''}rooms found
                  </h3>
                  <p className="empty-description">
                    {activeTab === 'popular'
                      ? 'Popular rooms will appear here based on user interactions and bookings'
                      : searchQuery
                        ? 'Try adjusting your search criteria or filters'
                        : 'Add some rooms to see them listed here'
                    }
                  </p>
                  {!searchQuery && activeTab === 'rooms' && (
                    <button className="empty-action-btn">
                      <FiPlus />
                      Add New Room
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminViewRooms;
