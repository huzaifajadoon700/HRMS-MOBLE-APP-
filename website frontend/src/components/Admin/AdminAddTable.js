import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminAddTable.css';

const AdminAddTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    status: 'available',
    location: '',
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/tables', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Table added successfully');
      navigate('/admin/tables');
    } catch (error) {
      console.error('Error adding table:', error);
      toast.error(error.response?.data?.message || 'Error adding table');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="add-table-container">
      <div className="add-table-header">
        <h2>Add New Table</h2>
      </div>

      <Form onSubmit={handleSubmit} className="add-table-form">
        <Row>
          <Col md={6}>
            <Form.Group className="form-group">
              <Form.Label>Table Number</Form.Label>
              <Form.Control
                type="text"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="Enter table number"
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label>Capacity</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                required
                min="1"
                className="form-control"
                placeholder="Enter seating capacity"
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group className="form-group">
              <Form.Label>Location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="Enter table location"
              />
            </Form.Group>

            <Form.Group className="form-group">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="form-control"
                placeholder="Enter table description"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="form-actions">
          <Button
            type="submit"
            className="btn btn-primary"
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
                Adding...
              </>
            ) : (
              'Add Table'
            )}
          </Button>
          <Button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/tables')}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AdminAddTable; 