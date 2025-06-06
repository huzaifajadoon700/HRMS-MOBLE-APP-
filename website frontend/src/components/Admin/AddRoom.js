import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Table, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faInfoCircle, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import './AdminManageRooms.css'; // Import the updated Cosmic Theme CSS

const AdminManageRooms = () => {
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch rooms from the backend
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/rooms");
      setRooms(response.data);
      setAlert({ show: true, message: "Rooms loaded successfully!", variant: "success" });
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setAlert({ show: true, message: "Failed to fetch rooms.", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // Handle form toggling and reset
  const handleShowAddRoom = () => {
    setShowAddRoom(!showAddRoom);
    resetForm();
  };

  // Reset form fields and errors
  const resetForm = () => {
    setErrors({});
    setRoomName("");
    setRoomType("");
    setRoomDescription("");
    setPrice("");
    setImage(null);
    setSelectedRoom(null);
  };

  // Handle image upload validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "Please upload a valid image file." }));
      } else if (file.size > 5000000) {
        setErrors((prev) => ({ ...prev, image: "Image size should not exceed 5MB." }));
      } else {
        setImage(file);
        setErrors((prev) => ({ ...prev, image: null }));
      }
    }
  };

  // Handle price validation
  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);
    if (value <= 0 || isNaN(value)) {
      setErrors((prev) => ({ ...prev, price: "Please enter a valid price greater than 0." }));
    } else {
      setErrors((prev) => ({ ...prev, price: null }));
    }
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!roomName.trim()) newErrors.roomName = "Room Name is required.";
    if (!roomType) newErrors.roomType = "Room Type is required.";
    if (!roomDescription.trim()) newErrors.roomDescription = "Description is required.";
    if (!price || price <= 0 || isNaN(price)) newErrors.price = "Please enter a valid price.";
    if (!image && !selectedRoom) newErrors.image = "Please upload an image.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission for adding/updating rooms
  const handleAddOrUpdateRoom = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("roomName", roomName);
    formData.append("roomType", roomType);
    formData.append("description", roomDescription);
    formData.append("price", price);
    if (image) formData.append("image", image);

    try {
      setLoading(true);
      if (selectedRoom) {
        await axios.put(`http://localhost:8080/api/rooms/${selectedRoom._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({ show: true, message: "Room updated successfully!", variant: "success" });
      } else {
        await axios.post("http://localhost:8080/api/rooms/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({ show: true, message: "Room added successfully!", variant: "success" });
      }
      fetchRooms();
      handleShowAddRoom();
    } catch (error) {
      console.error("Error:", error);
      setAlert({ show: true, message: "Failed to process your request.", variant: "danger" });
    } finally {
      setLoading(false);
    }
  };

  // Handle room deletion
  const handleDeleteRoom = async (id) => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await axios.delete(`http://localhost:8080/api/rooms/${id}`);
        setAlert({ show: true, message: "Room deleted successfully!", variant: "success" });
        fetchRooms();
      } catch (error) {
        console.error("Error deleting room:", error);
        setAlert({ show: true, message: "Failed to delete room.", variant: "danger" });
      }
    }
  };

  // Handle room update (pre-fill form)
  const handleUpdateRoom = (room) => {
    setRoomName(room.roomName);
    setRoomType(room.roomType);
    setRoomDescription(room.description);
    setPrice(room.price);
    setImage(null);
    setSelectedRoom(room);
    setShowAddRoom(true);
  };

  // Handle room details modal
  const handleShowDetails = (room) => {
    setSelectedRoom(room);
    setShowDetailsModal(true);
  };

  return (
    <div className="admin-manage-rooms">
      {/* Alert Messages */}
      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ ...alert, show: false })}
          dismissible
          className="fade-in"
        >
          {alert.message}
        </Alert>
      )}

      {/* Header and Add Room Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Manage Rooms</h2>
        <Button
          variant={showAddRoom ? "danger" : "primary"}
          onClick={handleShowAddRoom}
          className="add-room-button"
        >
          <FontAwesomeIcon icon={showAddRoom ? faTimes : faPlus} className="me-2" />
          {showAddRoom ? "Close Form" : "Add Room"}
        </Button>
      </div>

      {/* Add/Update Room Form */}
      {showAddRoom && (
        <div className="room-form-card mb-4">
          <h4 className="form-title">{selectedRoom ? "Update Room" : "Add a New Room"}</h4>
          <Form onSubmit={handleAddOrUpdateRoom}>
            <Form.Group className="mb-3">
              <Form.Label>Room Name</Form.Label>
              <Form.Control
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                isInvalid={!!errors.roomName}
                placeholder="Enter room name"
              />
              <Form.Control.Feedback type="invalid">{errors.roomName}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Room Type</Form.Label>
              <Form.Select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                isInvalid={!!errors.roomType}
              >
                <option value="">Choose...</option>
                <option value="single">Single Room</option>
                <option value="double">Double Room</option>
                <option value="suite">Suite</option>
                <option value="triple-seater-suite">Triple Seater Suite</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.roomType}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={roomDescription}
                onChange={(e) => setRoomDescription(e.target.value)}
                isInvalid={!!errors.roomDescription}
                placeholder="Enter room description"
              />
              <Form.Control.Feedback type="invalid">{errors.roomDescription}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price per Night ($)</Form.Label>
              <Form.Control
                type="number"
                value={price}
                onChange={handlePriceChange}
                isInvalid={!!errors.price}
                placeholder="Enter price per night"
              />
              <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Upload Room Image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                isInvalid={!!errors.image}
              />
              <Form.Control.Feedback type="invalid">{errors.image}</Form.Control.Feedback>
              {selectedRoom?.image && (
                <div className="mt-2">
                  <strong>Current Image:</strong>
                  <img
                    src={`http://localhost:8080/${selectedRoom.image}`}
                    alt={selectedRoom.roomName}
                    className="img-thumbnail mt-2"
                    style={{ width: "100px" }}
                  />
                </div>
              )}
            </Form.Group>

            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner size="sm" /> : selectedRoom ? "Update Room" : "Add Room"}
            </Button>
          </Form>
        </div>
      )}

      {/* Rooms Table */}
      <Table striped bordered hover responsive className="rooms-table">
        <thead>
          <tr>
            <th>Room Name</th>
            <th>Type</th>
            <th>Description</th>
            <th>Price</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6" className="text-center">
                <Spinner animation="border" />
              </td>
            </tr>
          ) : rooms.length > 0 ? (
            rooms.map((room) => (
              <tr key={room._id}>
                <td>{room.roomName}</td>
                <td>{room.roomType}</td>
                <td>{room.description}</td>
                <td>${room.price}</td>
                <td>
                  {room.image && (
                    <img
                      src={`http://localhost:8080/${room.image}`}
                      alt={room.roomName}
                      className="room-image"
                    />
                  )}
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => handleShowDetails(room)}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </Button>
                    <Button
                      variant="outline-warning"
                      size="sm"
                      onClick={() => handleUpdateRoom(room)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteRoom(room._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No rooms found.</td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Room Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Room Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <div>
              <p><strong>Name:</strong> {selectedRoom.roomName}</p>
              <p><strong>Type:</strong> {selectedRoom.roomType}</p>
              <p><strong>Description:</strong> {selectedRoom.description}</p>
              <p><strong>Price:</strong> ${selectedRoom.price}</p>
              {selectedRoom.image && (
                <img
                  src={`http://localhost:8080/${selectedRoom.image}`}
                  alt={selectedRoom.roomName}
                  className="img-fluid rounded"
                />
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminManageRooms;
