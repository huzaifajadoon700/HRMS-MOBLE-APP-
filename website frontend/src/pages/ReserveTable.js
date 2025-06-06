import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { FiCalendar, FiUsers, FiClock, FiX } from "react-icons/fi";
import EditReservation from "../components/User/EditReservation";
import "./ReserveTable.css";

const ReserveTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reservationData, setReservationData] = useState({
    date: "",
    time: "",
    guests: 1,
  });
  
  // Extract the edit reservation ID from URL query parameters (if it exists)
  const queryParams = new URLSearchParams(location.search);
  const editReservationId = queryParams.get('edit');

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-table.jpg";
    try {
      if (imagePath.startsWith("http")) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, "");
      return cleanPath.includes("uploads")
        ? `http://localhost:8080/${cleanPath}`
        : `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error("Error formatting image URL:", error);
      return "/images/placeholder-table.jpg";
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/tables");
      setTables(response.data);
    } catch (error) {
      setError("Failed to load tables. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleReserveClick = (table) => {
    // Store the selected table and reservation data in localStorage
    const reservationDetails = {
      tableId: table._id,
      tableName: table.tableName,
      tableImage: getImageUrl(table.image),
      tableCapacity: table.capacity,
      tableDescription: table.description,
      date: reservationData.date,
      time: reservationData.time,
      guests: reservationData.guests,
    };
    
    localStorage.setItem('reservationDetails', JSON.stringify(reservationDetails));
    navigate('/table-reservation');
  };
  
  const handleEditSuccess = () => {
    // After successful edit, go back to My Reservations
    navigate('/my-reservations');
  };

  // If in edit mode, show the EditReservation component instead
  if (editReservationId) {
    return (
      <div className="reserve-table-container">
        <Container className="py-5">
          <EditReservation 
            reservationId={editReservationId} 
            onClose={() => navigate('/my-reservations')}
            onSuccess={handleEditSuccess}
          />
        </Container>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="reserve-table-container">
        <Container className="py-5">
          <div className="header">
            <h1 className="cosmic-title">Reserve a Table</h1>
            <p className="subtitle">Loading available tables...</p>
          </div>
          <Row className="table-list">
            {[1, 2, 3].map((index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="table-card skeleton">
                  <div className="table-image-container skeleton-image" />
                  <Card.Body>
                    <div className="skeleton-title" />
                    <div className="skeleton-text" />
                    <div className="skeleton-text" />
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="reserve-table-container">
      <Container className="py-5">
        <div className="header">
          <h1 className="cosmic-title">Reserve a Table</h1>
          <p className="subtitle">Book your perfect dining experience</p>
        </div>

        <div className="filters">
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-light">Date</Form.Label>
                <Form.Control
                  type="date"
                  className="cosmic-input"
                  value={reservationData.date}
                  onChange={(e) => setReservationData({ ...reservationData, date: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-light">Time</Form.Label>
                <Form.Control
                  type="time"
                  className="cosmic-input"
                  value={reservationData.time}
                  onChange={(e) => setReservationData({ ...reservationData, time: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="text-light">Number of Guests</Form.Label>
                <Form.Control
                  type="number"
                  className="cosmic-input"
                  min="1"
                  value={reservationData.guests}
                  onChange={(e) => setReservationData({ ...reservationData, guests: e.target.value })}
                />
              </Form.Group>
            </Col>
          </Row>
        </div>

        {error && (
          <div className="error-alert">
            <FiX className="me-2" />
            {error}
          </div>
        )}

        <Row className="table-list">
          {tables.map((table) => (
            <Col key={table._id} lg={4} md={6} className="mb-4">
              <Card className="table-card">
                <div className="table-image-container">
                  <Card.Img
                    variant="top"
                    src={getImageUrl(table.image)}
                    alt={table.tableName}
                    className="table-image"
                    onError={(e) => {
                      e.target.src = "/images/placeholder-table.jpg";
                      e.target.onerror = null;
                    }}
                  />
                  <div className="capacity-badge">
                    <FiUsers className="me-1" />
                    {table.capacity} seats
                  </div>
                </div>
                <Card.Body>
                  <Card.Title className="table-title">{table.tableName}</Card.Title>
                  <Card.Text className="table-description">{table.description}</Card.Text>
                  <div className="table-features">
                    <div className="feature">
                      <FiClock className="me-2" />
                      <span>Available</span>
                    </div>
                    <div className="feature">
                      <FiUsers className="me-2" />
                      <span>Max {table.capacity} guests</span>
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    className="reserve-button"
                    onClick={() => handleReserveClick(table)}
                  >
                    Reserve Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default ReserveTable;