import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminManageRooms.css";

const AdminDeleteRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [deletingRoomId, setDeletingRoomId] = useState(null);

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
      const response = await axios.get("http://localhost:8080/api/rooms");
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
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

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      return;
    }

    setDeletingRoomId(roomId);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/api/rooms/${roomId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json" 
          },
        }
      );

      toast.success("Room deleted successfully!");
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to delete room");
    } finally {
      setDeletingRoomId(null);
    }
  };

  return (
    <div className="admin-manage-rooms">
      <Container fluid>
        <div className="admin-header">
          <h1 className="admin-title">Delete Room</h1>
          <p className="admin-subtitle">Select a room to remove it from the system</p>
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
                        <div className="room-price">${room.price}</div>
                      </div>
                      <div className="room-type">{room.roomType}</div>
                      <p className="room-description">{room.description}</p>
                      <Button
                        variant="danger"
                        className="w-100 mt-3"
                        onClick={() => handleDeleteRoom(room._id)}
                        disabled={deletingRoomId === room._id}
                      >
                        {deletingRoomId === room._id ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Deleting...
                          </>
                        ) : (
                          "Delete Room"
                        )}
                      </Button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-state">
              <div className="empty-state-text">No rooms found</div>
              <div className="empty-state-subtext">Add some rooms to manage them</div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default AdminDeleteRoom; 