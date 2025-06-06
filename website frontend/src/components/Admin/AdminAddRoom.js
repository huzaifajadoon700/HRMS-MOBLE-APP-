  import React, { useState, useEffect } from "react";
  import { Card, Form, Button, Spinner, Container, Row, Col } from "react-bootstrap";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import { toast } from "react-toastify";
  import { FiPlus, FiImage, FiDollarSign, FiHome, FiInfo, FiTag, FiHash, FiType, FiFileText, FiLoader } from "react-icons/fi";
  import "./AdminManageRooms.css";

  const AdminAddRoom = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
      roomNumber: "",
      roomType: "",
      price: "",
      status: "Available",
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
    }, [navigate]);

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
      
      if (!formData.roomNumber || !formData.roomType || !formData.price || !formData.description) {
        toast.error("Please fill in all required fields");
        return;
      }

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "http://localhost:8080/api/rooms",
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("Room added successfully!");
        setFormData({
          roomNumber: "",
          roomType: "",
          price: "",
          status: "Available",
          description: "",
          image: null,
        });
        setImagePreview(null);
        
        // Reset the file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          fileInput.value = "";
        }
      } catch (error) {
        console.error("Error adding room:", error);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        
        const errorMessage = error.response?.data?.error || error.response?.data?.message || "Failed to add room";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="admin-add-room">
        <div className="add-room-container">
          <div className="add-room-header">
            <h2>Add New Room</h2>
            <p>Fill in the details to add a new room to the system</p>
          </div>

          <div className="add-room-content">
            <div className="room-form-section">
              <form className="room-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Room Number</label>
                  <input
                    type="text"
                    name="roomNumber"
                    className="cosmic-input"
                    placeholder="Enter room number"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Room Type</label>
                  <select
                    name="roomType"
                    className="cosmic-input"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Room Type</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Super Deluxe">Super Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price</label>
                  <input
                    type="number"
                    name="price"
                    className="cosmic-input"
                    placeholder="Enter price per night"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    className="cosmic-input"
                    placeholder="Enter room description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Room Image</label>
                  <input
                    type="file"
                    name="image"
                    className="cosmic-input"
                    onChange={handleImageChange}
                    accept="image/*"
                    required
                  />
                </div>

                <button type="submit" className="cosmic-button" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      <span>Adding Room...</span>
                    </>
                  ) : (
                    <span>Add Room</span>
                  )}
                </button>
              </form>
            </div>

            <div className="room-preview-section">
              <div className="preview-card">
                <h3>Room Preview</h3>
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Room Preview" />
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <FiImage className="preview-icon" />
                    <p>Upload an image to see preview</p>
                  </div>
                )}
                <div className="preview-details">
                  <div className="preview-item">
                    <span>Room Number:</span>
                    <span>{formData.roomNumber || 'N/A'}</span>
                  </div>
                  <div className="preview-item">
                    <span>Type:</span>
                    <span>{formData.roomType || 'N/A'}</span>
                  </div>
                  <div className="preview-item">
                    <span>Price:</span>
                    <span>{formData.price ? `$${formData.price}` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default AdminAddRoom;
