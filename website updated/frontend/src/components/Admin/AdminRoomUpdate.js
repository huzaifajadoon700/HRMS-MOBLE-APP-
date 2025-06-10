import React, { useState, useEffect } from "react";
import { Card, Form, Button, Spinner, Row, Col, Container } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiEdit, FiSave, FiRefreshCw, FiHome, FiDollarSign, FiUsers,
  FiMapPin, FiImage, FiCheck, FiX
} from "react-icons/fi";
import "./AdminManageRooms.css";

const AdminRoomUpdate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    price: "",
    status: "",
    description: "",
    capacity: "",
    amenities: [],
    floor: "",
    size: "",
    bedType: "",
    smokingAllowed: false,
    petFriendly: false
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
      const response = await axios.get("http://localhost:8080/api/rooms", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRooms(response.data);
      toast.success("Rooms loaded successfully");
    } catch (error) {
      console.error("Error fetching rooms:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error("Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber || "",
      roomType: room.roomType || "",
      price: room.price || "",
      status: room.status || "",
      description: room.description || "",
      capacity: room.capacity || "",
      amenities: room.amenities || [],
      floor: room.floor || "",
      size: room.size || "",
      bedType: room.bedType || "",
      smokingAllowed: room.smokingAllowed || false,
      petFriendly: room.petFriendly || false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-room.jpg";
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8080${imagePath}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoom) {
      toast.warning("Please select a room to update");
      return;
    }

    setLoading(true);
    const data = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'amenities') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });
    
    if (image) {
      data.append("image", image);
    }

    try {
      await axios.put(`http://localhost:8080/api/rooms/${selectedRoom._id}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Room updated successfully!");
      setSelectedRoom(null);
      setImage(null);
      setFormData({
        roomNumber: "",
        roomType: "",
        price: "",
        status: "",
        description: "",
        capacity: "",
        amenities: [],
        floor: "",
        size: "",
        bedType: "",
        smokingAllowed: false,
        petFriendly: false
      });
      
      fetchRooms();
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
    <Container fluid className="admin-manage-rooms p-4">
      <div className="admin-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="admin-title">
              <FiEdit className="me-2" />
              Update Room
            </h1>
            <p className="admin-subtitle">Select a room to update its details</p>
          </div>
          <Button
            variant="outline-primary"
            onClick={fetchRooms}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            {loading ? ' Loading...' : ' Refresh Rooms'}
          </Button>
        </div>
      </div>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="cosmic-card">
            <Card.Header className="cosmic-card-header">
              <h5 className="mb-0">
                <FiHome className="me-2" />
                Select Room to Update
              </h5>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Loading rooms...</p>
                </div>
              ) : rooms.length > 0 ? (
                <div className="room-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {rooms.map((room) => (
                    <div 
                      key={room._id}
                      className={`room-item p-3 mb-2 border rounded ${selectedRoom?._id === room._id ? 'border-primary bg-light' : 'border-light'}`}
                      onClick={() => handleSelectRoom(room)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="room-info">
                          <h6 className="mb-1">Room {room.roomNumber}</h6>
                          <p className="mb-1 text-muted">{room.roomType}</p>
                          <small className="text-success">Rs. {parseInt(room.price || 0).toLocaleString('en-PK')}/night</small>
                        </div>
                        <span className={`badge bg-${room.status === 'Available' ? 'success' : room.status === 'Occupied' ? 'warning' : 'danger'}`}>
                          {room.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <FiHome size={48} className="text-muted mb-3" />
                  <p className="text-muted">No rooms found</p>
                  <small className="text-muted">Add some rooms first to update them</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="cosmic-card">
            <Card.Header className="cosmic-card-header">
              <h5 className="mb-0">
                <FiEdit className="me-2" />
                Update Room Details
              </h5>
            </Card.Header>
            <Card.Body>
              {selectedRoom ? (
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
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
                    </Col>
                    <Col md={6}>
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
                          <option value="Single">Single</option>
                          <option value="Double">Double</option>
                          <option value="Twin">Twin</option>
                          <option value="Suite">Suite</option>
                          <option value="Deluxe">Deluxe</option>
                          <option value="Family">Family</option>
                          <option value="Presidential">Presidential</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price per Night (PKR)</Form.Label>
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
                    </Col>
                    <Col md={6}>
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
                    </Col>
                  </Row>

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

                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Capacity</Form.Label>
                        <Form.Control
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleInputChange}
                          className="cosmic-input"
                          placeholder="Guests"
                          min="1"
                          max="10"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Floor</Form.Label>
                        <Form.Control
                          type="number"
                          name="floor"
                          value={formData.floor}
                          onChange={handleInputChange}
                          className="cosmic-input"
                          placeholder="Floor"
                          min="1"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Size (sq ft)</Form.Label>
                        <Form.Control
                          type="number"
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                          className="cosmic-input"
                          placeholder="Size"
                          min="100"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Room Image</Form.Label>
                    {selectedRoom.image && (
                      <div className="mb-2">
                        <img
                          src={getImageUrl(selectedRoom.image)}
                          alt={selectedRoom.roomNumber}
                          style={{ width: '100px', height: '60px', objectFit: 'cover' }}
                          className="rounded"
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
                      Leave empty to keep current image. Max size: 5MB
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      className="cosmic-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiSave className="me-2" />
                          Update Room
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedRoom(null);
                        setFormData({
                          roomNumber: "",
                          roomType: "",
                          price: "",
                          status: "",
                          description: "",
                          capacity: "",
                          amenities: [],
                          floor: "",
                          size: "",
                          bedType: "",
                          smokingAllowed: false,
                          petFriendly: false
                        });
                      }}
                    >
                      <FiX className="me-2" />
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <div className="text-center p-4">
                  <FiEdit size={48} className="text-muted mb-3" />
                  <p className="text-muted">Select a room from the list to update its details</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminRoomUpdate;
