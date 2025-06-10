import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiImage, FiPlus, FiCoffee, FiDollarSign, FiTag, FiEdit,
  FiX, FiUpload, FiSave, FiRefreshCw, FiEye, FiCheck,
  FiToggleLeft, FiToggleRight, FiPackage, FiStar
} from "react-icons/fi";
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
    <div className="enhanced-admin-add-menu">
      {/* Enhanced Header */}
      <div className="enhanced-add-menu-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiPlus />
              </div>
              <div className="title-text">
                <h1 className="page-title">Add New Menu Item</h1>
                <p className="page-subtitle">Create a delicious new menu item with detailed information</p>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="action-btn secondary"
                onClick={() => navigate("/admin/view-menus")}
              >
                <FiX />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="enhanced-add-menu-content">
        <div className="content-container">
          <div className="menu-form-layout">
            {/* Form Section */}
            <div className="form-section">
              <div className="form-card">
                <div className="form-header">
                  <h2 className="form-title">Menu Item Details</h2>
                  <p className="form-subtitle">Enter the information for the new menu item</p>
                </div>

                <form className="enhanced-menu-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        <FiCoffee className="label-icon" />
                        Item Name
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="enhanced-input"
                        placeholder="e.g., Chicken Biryani, Chocolate Cake"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiDollarSign className="label-icon" />
                        Price (PKR)
                        <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        className="enhanced-input"
                        placeholder="Enter price in Pakistani Rupees"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="50"
                        step="10"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiTag className="label-icon" />
                        Category
                        <span className="required">*</span>
                      </label>
                      <select
                        name="category"
                        className="enhanced-select"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="appetizers">🥗 Appetizers</option>
                        <option value="main-course">🍽️ Main Course</option>
                        <option value="desserts">🍰 Desserts</option>
                        <option value="beverages">🥤 Beverages</option>
                        <option value="breakfast">🍳 Breakfast</option>
                        <option value="lunch">🍛 Lunch</option>
                        <option value="dinner">🍽️ Dinner</option>
                        <option value="snacks">🍿 Snacks</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label className="form-label">
                        <FiEdit className="label-icon" />
                        Description
                        <span className="required">*</span>
                      </label>
                      <textarea
                        name="description"
                        className="enhanced-textarea"
                        placeholder="Describe the dish ingredients, taste, and special features..."
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        required
                      />
                    </div>
                  </div>

                  {/* Availability Section */}
                  <div className="form-section-divider">
                    <h3 className="section-title">Availability Settings</h3>
                    <p className="section-subtitle">Set the availability status for this menu item</p>
                  </div>

                  <div className="availability-section">
                    <div className="availability-toggle">
                      <label className="toggle-label">
                        <input
                          type="checkbox"
                          name="availability"
                          checked={formData.availability}
                          onChange={handleInputChange}
                          className="toggle-input"
                        />
                        <div className="toggle-slider">
                          <div className="toggle-button">
                            {formData.availability ? <FiCheck /> : <FiX />}
                          </div>
                        </div>
                        <span className="toggle-text">
                          {formData.availability ? 'Available for Order' : 'Currently Unavailable'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="form-section-divider">
                    <h3 className="section-title">Menu Item Image</h3>
                    <p className="section-subtitle">Upload an appetizing image of the dish</p>
                  </div>

                  <div className="image-upload-section">
                    <div className="upload-area">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input"
                        id="menu-image"
                      />
                      <label htmlFor="menu-image" className="upload-label">
                        <div className="upload-content">
                          <FiUpload className="upload-icon" />
                          <div className="upload-text">
                            <span className="upload-title">Click to upload image</span>
                            <span className="upload-subtitle">PNG, JPG, GIF up to 5MB</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="action-btn secondary"
                      onClick={() => navigate("/admin/view-menus")}
                    >
                      <FiX />
                      <span>Cancel</span>
                    </button>

                    <button
                      type="submit"
                      className="action-btn primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <FiRefreshCw className="spinning" />
                          <span>Adding Item...</span>
                        </>
                      ) : (
                        <>
                          <FiSave />
                          <span>Add Menu Item</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Preview Section */}
            <div className="preview-section">
              <div className="preview-card">
                <div className="preview-header">
                  <h3 className="preview-title">Live Preview</h3>
                  <p className="preview-subtitle">See how your menu item will appear</p>
                </div>

                <div className="menu-item-preview">
                  <div className="preview-image-container">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Menu item preview"
                        className="preview-image"
                      />
                    ) : (
                      <div className="preview-placeholder">
                        <FiImage className="preview-icon" />
                        <p>Upload an image to see preview</p>
                      </div>
                    )}
                    <div className={`availability-badge ${formData.availability ? 'available' : 'unavailable'}`}>
                      {formData.availability ? (
                        <>
                          <FiCheck />
                          <span>Available</span>
                        </>
                      ) : (
                        <>
                          <FiX />
                          <span>Unavailable</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="preview-content">
                    <div className="preview-header-info">
                      <h4 className="item-name">{formData.name || 'Menu Item Name'}</h4>
                      <div className="item-price">
                        Rs. {formData.price ? parseInt(formData.price).toLocaleString('en-PK') : '0'}
                      </div>
                    </div>

                    <div className="item-category">
                      <FiTag className="category-icon" />
                      <span>{formData.category || 'Category'}</span>
                    </div>

                    <p className="item-description">
                      {formData.description || 'Menu item description will appear here. Add details about ingredients, taste, and special features.'}
                    </p>

                    <div className="preview-actions">
                      <button className="preview-btn primary">
                        <FiPackage />
                        <span>Order Now</span>
                      </button>
                      <button className="preview-btn secondary">
                        <FiStar />
                        <span>Add to Favorites</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="preview-details">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{formData.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Category:</span>
                    <span className="detail-value">{formData.category || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">
                      {formData.price ? `Rs. ${parseInt(formData.price).toLocaleString('en-PK')}` : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      {formData.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddMenu; 