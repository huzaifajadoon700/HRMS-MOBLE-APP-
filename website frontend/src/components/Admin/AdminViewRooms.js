import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminManageRooms.css";

const AdminViewRooms = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }
    
    fetchRooms();
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

  return (
    <div className="admin-manage-rooms">
      <Container fluid>
        <div className="admin-header">
          <div className="header-content">
            <h1 className="admin-title">View Rooms</h1>
            <p className="admin-subtitle">Browse all available rooms in the system</p>
          </div>
        </div>

        <div className="room-grid">
          {loading ? (
            <div className="loading-state">
              <div className="cosmic-spinner"></div>
              <p>Loading rooms...</p>
            </div>
          ) : rooms.length > 0 ? (
            <Row>
              {rooms.map((room) => (
                <Col key={room._id} lg={4} md={6} className="mb-4">
                  <div className="room-card">
                    <div className="room-card-image">
                      <img
                        src={getImageUrl(room.image)}
                        alt={room.roomNumber}
                        onError={(e) => {
                          e.target.src = "/images/placeholder-room.jpg";
                          e.target.onerror = null;
                        }}
                      />
                      <span className={`room-status ${room.status.toLowerCase()}`}>
                        {room.status}
                      </span>
                    </div>
                    <div className="room-card-content">
                      <div className="room-card-header">
                        <h3 className="room-number">Room {room.roomNumber}</h3>
                        <span className="room-price">${room.price}</span>
                      </div>
                      <div className="room-type">{room.roomType}</div>
                      <p className="room-description">{room.description}</p>
                      <div className="room-amenities">
                        <div className="amenity">
                          <span className="amenity-icon">🛏️</span>
                          <span className="amenity-text">King Size Bed</span>
                        </div>
                        <div className="amenity">
                          <span className="amenity-icon">🚿</span>
                          <span className="amenity-text">Private Bathroom</span>
                        </div>
                        <div className="amenity">
                          <span className="amenity-icon">📺</span>
                          <span className="amenity-text">Smart TV</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-state">
              <div className="empty-state-text">No rooms found</div>
              <div className="empty-state-subtext">
                Add some rooms to see them listed here
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default AdminViewRooms;
