import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Container, Row, Col, Button, Modal, Form } from "react-bootstrap";
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from "react-icons/fa";
import {
  FiCoffee, FiSearch, FiFilter, FiGrid, FiList, FiRefreshCw,
  FiEye, FiEdit, FiTrash, FiToggleLeft, FiToggleRight, FiPlus,
  FiDollarSign, FiStar, FiClock, FiCheck, FiX, FiTrendingUp
} from "react-icons/fi";
import "./AdminManageRooms.css";

const AdminViewMenus = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');

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
      // If it's already a full URL (Unsplash, etc.), return as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      // If it's a local upload path
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

  // Filter and sort menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price': return a.price - b.price;
      case 'name': return a.name.localeCompare(b.name);
      case 'category': return a.category.localeCompare(b.category);
      default: return 0;
    }
  });

  return (
    <div className="enhanced-admin-menus">
      <div className="enhanced-menus-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiCoffee />
              </div>
              <div className="title-text">
                <h1 className="page-title">Menu Management</h1>
                <p className="page-subtitle">Manage food items and categories</p>
              </div>
            </div>

            <div className="header-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiCoffee />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{menuItems.length}</span>
                  <span className="stat-label">Total Items</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FiCheck />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{menuItems.filter(item => item.availability).length}</span>
                  <span className="stat-label">Available</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FiTrendingUp />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{new Set(menuItems.map(item => item.category)).size}</span>
                  <span className="stat-label">Categories</span>
                </div>
              </div>
            </div>
          </div>

          <div className="controls-section">
            <div className="search-controls">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-controls">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  <option value="appetizers">Appetizers</option>
                  <option value="main-course">Main Course</option>
                  <option value="desserts">Desserts</option>
                  <option value="beverages">Beverages</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="category">Sort by Category</option>
                </select>
              </div>
            </div>

            <div className="view-controls">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
              <button
                className="refresh-btn"
                onClick={fetchMenuItems}
              >
                <FiRefreshCw />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="enhanced-content">
        <div className={`menus-container ${viewMode}-view`}>
          {loading ? (
            <div className="enhanced-loading">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <p className="loading-text">Loading menu items...</p>
            </div>
          ) : filteredMenuItems.length > 0 ? (
            <div className="enhanced-menus-grid">
              {filteredMenuItems.map((item) => (
                <div key={item._id} className={`enhanced-menu-card ${viewMode}-card`}>
                  <div className="menu-image-container">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="menu-image"
                      onError={(e) => {
                        e.target.src = "/images/placeholder-menu.jpg";
                        e.target.onerror = null;
                      }}
                    />
                    <div className="image-overlay">
                      <div className="overlay-actions">
                        <button className="action-btn view-btn">
                          <FiEye />
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => window.location.href = `/admin/update-menu/${item._id}`}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => {
                            setItemToDelete(item);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FiTrash />
                        </button>
                      </div>
                    </div>

                    <div className="menu-badges">
                      <span className={`status-badge ${item.availability ? 'available' : 'unavailable'}`}>
                        {item.availability ? 'Available' : 'Unavailable'}
                      </span>
                      <span className="category-badge">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="menu-content">
                    <div className="menu-header">
                      <div className="menu-title">
                        <h3 className="menu-name">{item.name}</h3>
                        <span className="menu-category">{item.category}</span>
                      </div>
                      <div className="menu-price">
                        <span className="price-amount">Rs. {parseFloat(item.price).toFixed(0)}</span>
                      </div>
                    </div>

                    <p className="menu-description">{item.description}</p>

                    <div className="menu-actions">
                      <button
                        className={`availability-toggle ${item.availability ? 'available' : 'unavailable'}`}
                        onClick={() => handleAvailabilityToggle(item._id, item.availability)}
                      >
                        {item.availability ? <FiToggleRight /> : <FiToggleLeft />}
                        <span>{item.availability ? 'Available' : 'Unavailable'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="enhanced-empty-state">
              <div className="empty-icon">
                <FiCoffee />
              </div>
              <div className="empty-content">
                <h3 className="empty-title">No menu items found</h3>
                <p className="empty-description">
                  {selectedCategory === "all"
                    ? searchQuery
                      ? 'Try adjusting your search criteria or filters'
                      : 'Add some menu items to get started'
                    : `No items found in ${selectedCategory} category`}
                </p>
                {!searchQuery && selectedCategory === 'all' && (
                  <button className="empty-action-btn">
                    <FiPlus />
                    Add New Menu Item
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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