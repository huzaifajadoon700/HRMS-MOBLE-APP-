import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Spinner, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminDeleteMenu.css";

const AdminDeleteMenu = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchMenuItems();
  }, [navigate]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/menus", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setMenuItems(response.data);
      } else {
        console.error("Invalid response format:", response.data);
        toast.error("Failed to load menu items");
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error(error.response?.data?.message || "Error fetching menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/menus/${selectedItem._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Menu item deleted successfully");
      await fetchMenuItems();
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error(error.response?.data?.message || "Error deleting menu item");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="delete-menu-container">
      <div className="delete-menu-header">
        <h2>Delete Menu Items</h2>
      </div>

      {menuItems.length === 0 ? (
        <div className="no-items-message">
          <h4>No menu items found</h4>
          <p>There are no menu items available to delete.</p>
        </div>
      ) : (
        <div className="menu-items-grid">
          {menuItems.map((item) => (
            <div key={item._id} className="menu-item-card">
              <div className="menu-item-image">
                <img
                  src={item.image ? `http://localhost:8080${item.image}` : "/placeholder-food.jpg"}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = "/placeholder-food.jpg";
                  }}
                />
              </div>
              <div className="menu-item-info">
                <h4>{item.name}</h4>
                <p>{item.category}</p>
                <p>${item.price.toFixed(2)}</p>
                <Button
                  variant="danger"
                  className="delete-button"
                  onClick={() => {
                    setSelectedItem(item);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete Item
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        className="delete-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "{selectedItem?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
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
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDeleteMenu; 