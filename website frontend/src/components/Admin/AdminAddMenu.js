import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminManageRooms.css";

const AdminAddMenu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    availability: true,
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
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
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
      await axios.post(
        "http://localhost:8080/api/menus",
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Menu item added successfully!");
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        availability: true,
        image: null,
      });
      setImagePreview(null);
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error("Error adding menu item:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-manage-rooms">
      <Container fluid>
        <div className="admin-header">
          <h1 className="admin-title">Add Menu Item</h1>
          <p className="admin-subtitle">Create a new menu item with details and image</p>
        </div>

        <Row>
          <Col lg={6} className="mb-4">
            <div className="preview-section">
              <div className="room-card">
                <div className="room-card-image">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Menu item preview"
                      className="preview-image"
                    />
                  ) : (
                    <div className="empty-image">
                      <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                      <p>Upload an image to preview</p>
                    </div>
                  )}
                  <span className={`room-status ${formData.availability ? 'available' : 'unavailable'}`}>
                    {formData.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="room-card-content">
                  <div className="room-card-header">
                    <h3 className="room-number">{formData.name || 'Item Name'}</h3>
                    <div className="room-price">${formData.price || '0.00'}</div>
                  </div>
                  <div className="room-type">{formData.category || 'Category'}</div>
                  <p className="room-description">{formData.description || 'Item description will appear here'}</p>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={6}>
            <div className="room-form-card">
              <div className="cosmic-card-header">
                <h5 className="mb-0">Menu Item Details</h5>
              </div>
              <div className="p-4">
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Item Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter item name"
                      className="cosmic-input"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter item description"
                      className="cosmic-input"
                      rows={3}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Price ($)</Form.Label>
                    <Form.Control
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      className="cosmic-input"
                      min="0"
                      step="0.01"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="cosmic-input"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="appetizers">Appetizers</option>
                      <option value="main-course">Main Course</option>
                      <option value="desserts">Desserts</option>
                      <option value="beverages">Beverages</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Availability</Form.Label>
                    <Form.Check
                      type="switch"
                      name="availability"
                      label="Item is available"
                      checked={formData.availability}
                      onChange={handleInputChange}
                      className="cosmic-switch"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Item Image</Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cosmic-input"
                    />
                    <Form.Text className="text-muted">
                      Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                    </Form.Text>
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
                          Adding Item...
                        </>
                      ) : (
                        "Add Menu Item"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="cosmic-button"
                      onClick={() => navigate("/admin/view-menus")}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminAddMenu; 