import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminUpdateMenu.css";

const AdminUpdateMenu = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [categories] = useState([
    "appetizers",
    "main-course",
    "desserts",
    "beverages",
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to access this page");
      navigate("/login");
      return;
    }
    fetchMenuItems();
  }, [navigate]);

  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/menus", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error(error.response?.data?.message || "Error fetching menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      image: null,
    });
    setImagePreview(item.image ? `http://localhost:8080${item.image}` : null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      toast.error("Please select a menu item to update");
      return;
    }

    setUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      await axios.put(`http://localhost:8080/api/menus/${selectedItem._id}`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Menu item updated successfully");
      fetchMenuItems();
      setSelectedItem(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
      });
      setImagePreview(null);
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error(error.response?.data?.message || "Error updating menu item");
    } finally {
      setUpdating(false);
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
    <Container fluid className="update-menu-container">
      <div className="update-menu-header">
        <h2>Update Menu Items</h2>
      </div>

      <Row>
        <Col md={7}>
          <div className="menu-items-grid">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className={`menu-item-card ${selectedItem?._id === item._id ? "selected" : ""}`}
                onClick={() => handleItemSelect(item)}
              >
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
                </div>
              </div>
            ))}
          </div>
        </Col>

        <Col md={5}>
          {selectedItem ? (
            <Form className="update-menu-form" onSubmit={handleSubmit}>
              <div className="image-preview-container">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="preview-image"
                    onError={(e) => {
                      e.target.src = "/placeholder-food.jpg";
                    }}
                  />
                ) : (
                  <div className="no-image">No image selected</div>
                )}
              </div>

              <Form.Group className="form-group">
                <Form.Label>Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  min="0"
                  className="form-control"
                />
              </Form.Group>

              <Form.Group className="form-group">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="form-control"
                />
              </Form.Group>

              <div className="d-grid gap-2">
                <Button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Updating...
                    </>
                  ) : (
                    "Update Item"
                  )}
                </Button>
                <Button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedItem(null);
                    setFormData({
                      name: "",
                      description: "",
                      price: "",
                      category: "",
                      image: null,
                    });
                    setImagePreview(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          ) : (
            <div className="text-center p-4">
              <h4 className="text-muted">Select a menu item to update</h4>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default AdminUpdateMenu; 