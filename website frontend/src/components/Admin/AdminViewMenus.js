import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import "./AdminManageRooms.css";

const AdminViewMenus = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategory]);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === "all"
        ? "http://localhost:8080/api/menus"
        : `http://localhost:8080/api/menus/category/${selectedCategory}`;
      
      const response = await axios.get(url);
      setMenuItems(response.data);
    } catch (error) {
      toast.error("Failed to fetch menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/menus/${id}`);
      setMenuItems(menuItems.filter(item => item._id !== id));
      toast.success("Menu item deleted successfully");
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Error deleting menu item");
    }
  };

  const handleAvailabilityToggle = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`http://localhost:8080/api/menus/${id}/toggle-availability`);
      setMenuItems(menuItems.map(item => item._id === id ? response.data : item));
      toast.success("Availability updated successfully");
    } catch (error) {
      toast.error("Error updating availability");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-menu.jpg';
    try {
      if (imagePath.startsWith('http')) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, '');
      if (cleanPath.includes('uploads')) {
        return `http://localhost:8080/${cleanPath}`;
      }
      return `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error('Error formatting image URL:', error);
      return '/images/placeholder-menu.jpg';
    }
  };

  return (
    <div className="admin-manage-rooms">
      <Container fluid>
        <div className="admin-header">
          <h1 className="admin-title">Menu Items</h1>
          <div className="d-flex align-items-center gap-3">
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="cosmic-input"
              style={{ width: '200px' }}
            >
              <option value="all">All Categories</option>
              <option value="appetizers">Appetizers</option>
              <option value="main-course">Main Course</option>
              <option value="desserts">Desserts</option>
              <option value="beverages">Beverages</option>
            </Form.Select>
          </div>
        </div>

        <div className="room-grid">
          {loading ? (
            <div className="loading-state">
              <div className="cosmic-spinner"></div>
              <p>Loading menu items...</p>
            </div>
          ) : menuItems.length > 0 ? (
            <Row>
              {menuItems.map((item) => (
                <Col key={item._id} lg={4} md={6} className="mb-4">
                  <div className="room-card">
                    <div className="room-card-image">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = "/images/placeholder-menu.jpg";
                          e.target.onerror = null;
                        }}
                      />
                      <span className={`room-status ${item.availability ? 'available' : 'unavailable'}`}>
                        {item.availability ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="room-card-content">
                      <div className="room-card-header">
                        <h3 className="room-number">{item.name}</h3>
                        <div className="room-price">${parseFloat(item.price).toFixed(2)}</div>
                      </div>
                      <div className="room-type">{item.category}</div>
                      <p className="room-description">{item.description}</p>
                      <div className="d-flex gap-2 mt-3">
                        <Button
                          variant={item.availability ? "outline-success" : "outline-danger"}
                          className="flex-grow-1"
                          onClick={() => handleAvailabilityToggle(item._id, item.availability)}
                        >
                          {item.availability ? <FaToggleOn className="me-2" /> : <FaToggleOff className="me-2" />}
                          {item.availability ? 'Available' : 'Unavailable'}
                        </Button>
                        <Button
                          variant="outline-warning"
                          onClick={() => window.location.href = `/admin/update-menu/${item._id}`}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          onClick={() => {
                            setItemToDelete(item);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div className="empty-state">
              <div className="empty-state-text">No menu items found</div>
              <div className="empty-state-subtext">
                {selectedCategory === "all" 
                  ? "Add some items to get started" 
                  : "No items in this category"}
              </div>
            </div>
          )}
        </div>
      </Container>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{itemToDelete?.name}</strong>?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleDeleteItem(itemToDelete?._id)}
          >
            Delete Item
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminViewMenus; 