  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import { toast } from "react-toastify";
  import {
    FiImage, FiPlus, FiHome, FiDollarSign, FiUsers, FiMapPin,
    FiWifi, FiTv, FiCoffee, FiTruck, FiEye, FiCheck, FiX,
    FiUpload, FiSave, FiRefreshCw, FiEdit, FiLayers
  } from "react-icons/fi";
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
    }, [navigate]);

    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    };

    const handleAmenityChange = (amenity) => {
      setFormData((prev) => ({
        ...prev,
        amenities: prev.amenities.includes(amenity)
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
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
      
      if (!formData.roomNumber || !formData.roomType || !formData.price || !formData.description || !formData.capacity) {
        toast.error("Please fill in all required fields (Room Number, Type, Price, Description, Capacity)");
        return;
      }

      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'amenities') {
            submitData.append(key, JSON.stringify(formData[key]));
          } else {
            submitData.append(key, formData[key]);
          }
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
          capacity: "",
          amenities: [],
          floor: "",
          size: "",
          bedType: "",
          smokingAllowed: false,
          petFriendly: false
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
      <div className="enhanced-admin-add-room">
        <div className="enhanced-add-room-header">
          <div className="header-content">
            <div className="title-section">
              <div className="title-wrapper">
                <div className="title-icon">
                  <FiPlus />
                </div>
                <div className="title-text">
                  <h1 className="page-title">Add New Room</h1>
                  <p className="page-subtitle">Create a new room listing with detailed information</p>
                </div>
              </div>

              <div className="header-actions">
                <button
                  className="action-btn secondary"
                  onClick={() => window.history.back()}
                >
                  <FiX />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="enhanced-add-room-content">
          <div className="content-container">
            <div className="form-section">
              <div className="form-card">
                <div className="form-header">
                  <h2 className="form-title">Room Details</h2>
                  <p className="form-subtitle">Enter the basic information for the new room</p>
                </div>

                <form className="enhanced-room-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        <FiHome className="label-icon" />
                        Room Number
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="roomNumber"
                        className="enhanced-input"
                        placeholder="e.g., 101, A-205"
                        value={formData.roomNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiHome className="label-icon" />
                        Room Type
                        <span className="required">*</span>
                      </label>
                      <select
                        name="roomType"
                        className="enhanced-select"
                        value={formData.roomType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Room Type</option>
                        <option value="Single">Single Room</option>
                        <option value="Double">Double Room</option>
                        <option value="Twin">Twin Room</option>
                        <option value="Suite">Suite</option>
                        <option value="Deluxe">Deluxe Room</option>
                        <option value="Family">Family Room</option>
                        <option value="Presidential">Presidential Suite</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiDollarSign className="label-icon" />
                        Price per Night (PKR)
                        <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        className="enhanced-input"
                        placeholder="Enter price in Pakistani Rupees"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="1000"
                        step="100"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiUsers className="label-icon" />
                        Capacity (Guests)
                        <span className="required">*</span>
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        className="enhanced-input"
                        placeholder="Maximum number of guests"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        min="1"
                        max="10"
                        required
                      />
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
                        placeholder="Describe the room features, amenities, and unique selling points..."
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        required
                      />
                    </div>
                  </div>

                  {/* Additional Details Section */}
                  <div className="form-section-divider">
                    <h3 className="section-title">Additional Details</h3>
                    <p className="section-subtitle">Optional information to enhance the room listing</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        <FiMapPin className="label-icon" />
                        Floor
                      </label>
                      <input
                        type="number"
                        name="floor"
                        className="enhanced-input"
                        placeholder="Floor number"
                        value={formData.floor}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiHome className="label-icon" />
                        Room Size (sq ft)
                      </label>
                      <input
                        type="number"
                        name="size"
                        className="enhanced-input"
                        placeholder="Room size in square feet"
                        value={formData.size}
                        onChange={handleInputChange}
                        min="100"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiHome className="label-icon" />
                        Bed Type
                      </label>
                      <select
                        name="bedType"
                        className="enhanced-select"
                        value={formData.bedType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Bed Type</option>
                        <option value="Single">Single Bed</option>
                        <option value="Double">Double Bed</option>
                        <option value="Queen">Queen Bed</option>
                        <option value="King">King Bed</option>
                        <option value="Twin">Twin Beds</option>
                        <option value="Sofa Bed">Sofa Bed</option>
                      </select>
                    </div>
                  </div>

                  {/* Amenities Section */}
                  <div className="form-section-divider">
                    <h3 className="section-title">Amenities & Features</h3>
                    <p className="section-subtitle">Select available amenities for this room</p>
                  </div>

                  <div className="amenities-section">
                    <div className="amenities-grid">
                      {[
                        { name: 'WiFi', icon: FiWifi },
                        { name: 'AC', icon: FiHome },
                        { name: 'TV', icon: FiTv },
                        { name: 'Minibar', icon: FiCoffee },
                        { name: 'Balcony', icon: FiHome },
                        { name: 'Sea View', icon: FiEye },
                        { name: 'City View', icon: FiEye },
                        { name: 'Room Service', icon: FiHome },
                        { name: 'Jacuzzi', icon: FiHome },
                        { name: 'Kitchen', icon: FiCoffee },
                        { name: 'Workspace', icon: FiHome },
                        { name: 'Parking', icon: FiTruck }
                      ].map(amenity => {
                        const IconComponent = amenity.icon;
                        return (
                          <label key={amenity.name} className="amenity-checkbox">
                            <input
                              type="checkbox"
                              checked={formData.amenities.includes(amenity.name)}
                              onChange={() => handleAmenityChange(amenity.name)}
                              className="checkbox-input"
                            />
                            <div className="checkbox-custom">
                              <FiCheck className="check-icon" />
                            </div>
                            <IconComponent className="amenity-icon" />
                            <span className="amenity-text">{amenity.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                <div className="form-group">
                  <div style={{display: 'flex', gap: '20px'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '5px', color: 'white'}}>
                      <input
                        type="checkbox"
                        name="smokingAllowed"
                        checked={formData.smokingAllowed}
                        onChange={handleInputChange}
                      />
                      Smoking Allowed
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '5px', color: 'white'}}>
                      <input
                        type="checkbox"
                        name="petFriendly"
                        checked={formData.petFriendly}
                        onChange={handleInputChange}
                      />
                      Pet Friendly
                    </label>
                  </div>
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
                    <span>{formData.price ? `Rs. ${parseInt(formData.price).toLocaleString('en-PK')}/night` : 'N/A'}</span>
                  </div>
                  <div className="preview-item">
                    <span>Capacity:</span>
                    <span>{formData.capacity ? `${formData.capacity} guests` : 'N/A'}</span>
                  </div>
                  <div className="preview-item">
                    <span>Bed Type:</span>
                    <span>{formData.bedType || 'N/A'}</span>
                  </div>
                  <div className="preview-item">
                    <span>Floor:</span>
                    <span>{formData.floor || 'N/A'}</span>
                  </div>
                  {formData.amenities.length > 0 && (
                    <div className="preview-item">
                      <span>Amenities:</span>
                      <span>{formData.amenities.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default AdminAddRoom;
