import React, { useState, useEffect } from "react";
import { Card, Form, Button, Spinner, Container, Row, Col } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminManageRooms.css";

const AdminUpdateRoom = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    price: "",
    status: "",
    description: "",
    image: null,
  });

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

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: room.price,
      status: room.status,
      description: room.description,
      image: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file");
        return;
      }
      if (file.size > 5000000) {
        toast.error("Image size should not exceed 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  // Helper function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-room.jpg';
    
    try {
      // If it's already a full URL
      if (imagePath.startsWith('http')) return imagePath;
      
      // Remove any leading slashes
      const cleanPath = imagePath.replace(/^\/+/, '');
      
      // If the path includes 'uploads', make sure it's properly formatted
      if (cleanPath.includes('uploads')) {
        return `http://localhost:8080/${cleanPath}`;
      }
      
      // For all other cases, assume it's a relative path in the uploads directory
      return `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error('Error formatting image URL:', error);
      return '/images/placeholder-room.jpg';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedRoom) {
      toast.error("Please select a room to update");
      return;
    }

    if (!formData.roomNumber || !formData.roomType || !formData.price || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key]) {
        submitData.append(key, formData[key]);
      } else if (key !== 'image') {
        submitData.append(key, formData[key]);
      }
    });

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8080/api/rooms/${selectedRoom._id}`,
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Room updated successfully!");
      fetchRooms();
      setSelectedRoom(null);
      setFormData({
        roomNumber: "",
        roomType: "",
        price: "",
        status: "",
        description: "",
        image: null,
      });
      
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error updating room:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to update room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-manage-rooms">
      <Container fluid>
        <div className="admin-header">
          <h1 className="admin-title">Update Room</h1>
          <p className="admin-subtitle">Select a room to update its details</p>
        </div>

        <Row>
          <Col lg={6} className="mb-4">
            <div className="room-grid">
              {loading ? (
                <div className="loading-state">
                  <div className="cosmic-spinner"></div>
                  <p>Loading rooms...</p>
                </div>
              ) : rooms.length > 0 ? (
                <Row>
                  {rooms.map((room) => (
                    <Col key={room._id} md={6} className="mb-4">
                      <div 
                        className={`room-card ${selectedRoom?._id === room._id ? 'selected' : ''}`}
                        onClick={() => handleSelectRoom(room)}
                        style={{ cursor: 'pointer' }}
                      >
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
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-text">No rooms found</div>
                  <div className="empty-state-subtext">Add some rooms to update them</div>
                </div>
              )}
            </div>
          </Col>

          <Col lg={6}>
            <Card className="room-form-card">
              <Card.Header className="cosmic-card-header">
                <h5 className="mb-0">Update Room Details</h5>
              </Card.Header>
              <Card.Body>
                {selectedRoom ? (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Room Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="roomNumber"
                        value={formData.roomNumber}
                        onChange={handleInputChange}
                        className="cosmic-input"
                        placeholder="Enter room number"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Room Type</Form.Label>
                      <Form.Select
                        name="roomType"
                        value={formData.roomType}
                        onChange={handleInputChange}
                        className="cosmic-input"
                        required
                      >
                        <option value="">Select room type</option>
                        <option value="Single">Single Room</option>
                        <option value="Double">Double Room</option>
                        <option value="Suite">Suite</option>
                        <option value="Deluxe">Deluxe Room</option>
                        <option value="Family">Family Room</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Price per Night ($)</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="cosmic-input"
                        placeholder="Enter price per night"
                        min="0"
                        step="0.01"
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="cosmic-input"
                        required
                      >
                        <option value="Available">Available</option>
                        <option value="Occupied">Occupied</option>
                        <option value="Maintenance">Under Maintenance</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="cosmic-input"
                        placeholder="Enter room description"
                        rows={3}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Room Image</Form.Label>
                      <div className="image-upload-container">
                        {selectedRoom.image && (
                          <div className="current-image mb-3">
                            <img
                              src={getImageUrl(selectedRoom.image)}
                              alt={selectedRoom.roomNumber}
                              className="preview-image"
                              onError={(e) => {
                                e.target.src = "/images/placeholder-room.jpg";
                                e.target.onerror = null;
                              }}
                            />
                          </div>
                        )}
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="cosmic-input"
                        />
                        <Form.Text className="text-muted">
                          Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                        </Form.Text>
                      </div>
                    </Form.Group>

                    <div className="d-flex gap-3">
                      <Button
                        type="submit"
                        variant="primary"
                        className="cosmic-button"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Updating Room...
                          </>
                        ) : (
                          "Update Room"
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        className="cosmic-button"
                        onClick={() => {
                          setSelectedRoom(null);
                          setFormData({
                            roomNumber: "",
                            roomType: "",
                            price: "",
                            status: "",
                            description: "",
                            image: null,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <div className="text-center p-4">
                    <p className="mb-0">Select a room from the list to update its details</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminUpdateRoom;
