import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./MenuManagement.css";

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    availability: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

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
      setError("Error fetching menu items. Please try again later.");
      toast.error("Failed to fetch menu items");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.price || !newItem.category) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("description", newItem.description);
      formData.append("price", newItem.price);
      formData.append("category", newItem.category);
      formData.append("availability", newItem.availability);
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.post("http://localhost:8080/api/menus", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMenuItems([...menuItems, response.data]);
      setNewItem({
        name: "",
        description: "",
        price: "",
        category: "",
        availability: true,
      });
      setImage(null);
      setImagePreview(null);
      toast.success("Menu item added successfully");
    } catch (error) {
      toast.error("Error adding menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (id) => {
    if (!editingItem.name || !editingItem.description || !editingItem.price || !editingItem.category) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", editingItem.name);
      formData.append("description", editingItem.description);
      formData.append("price", editingItem.price);
      formData.append("category", editingItem.category);
      formData.append("availability", editingItem.availability);
      if (image) {
        formData.append("image", image);
      }

      const response = await axios.put(`http://localhost:8080/api/menus/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMenuItems(menuItems.map(item => item._id === id ? response.data : item));
      setEditingItem(null);
      setImage(null);
      setImagePreview(null);
      toast.success("Menu item updated successfully");
    } catch (error) {
      toast.error("Error updating menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      setLoading(true);
      try {
        await axios.delete(`http://localhost:8080/api/menus/${id}`);
        setMenuItems(menuItems.filter(item => item._id !== id));
        toast.success("Menu item deleted successfully");
      } catch (error) {
        toast.error("Error deleting menu item");
      } finally {
        setLoading(false);
      }
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
    if (!imagePath) return "https://via.placeholder.com/150";
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:8080${imagePath}`;
  };

  return (
    <div className="menu-management cosmic-container">
      <h2 className="cosmic-title">Menu Management</h2>
      {loading && <div className="cosmic-loading">Loading...</div>}
      {error && <div className="alert cosmic-alert cosmic-alert-danger">{error}</div>}

      {/* Category Filter */}
      <div className="category-filter mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-control cosmic-input"
        >
          <option value="all">All Categories</option>
          <option value="appetizers">Appetizers</option>
          <option value="main-course">Main Course</option>
          <option value="desserts">Desserts</option>
          <option value="beverages">Beverages</option>
        </select>
      </div>

      <table className="table cosmic-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Availability</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((item) => (
            <tr key={item._id}>
              <td>
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="menu-thumbnail"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>${parseFloat(item.price).toFixed(2)}</td>
              <td>{item.category}</td>
              <td>
                <span className={`availability-badge ${item.availability ? "available" : "unavailable"}`}>
                  {item.availability ? "Available" : "Unavailable"}
                </span>
              </td>
              <td>
                <button
                  className="btn cosmic-btn-warning btn-sm"
                  onClick={() => handleAvailabilityToggle(item._id, item.availability)}
                >
                  {item.availability ? "Set Unavailable" : "Set Available"}
                </button>
                <button
                  className="btn cosmic-btn-info btn-sm ms-2"
                  onClick={() => {
                    setEditingItem(item);
                    setNewItem({ ...item });
                  }}
                >
                  <i className="fas fa-edit fa-sm"></i>
                </button>
                <button
                  className="btn cosmic-btn-danger btn-sm ms-2"
                  onClick={() => handleDeleteItem(item._id)}
                >
                  <i className="fas fa-trash-alt fa-sm"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="cosmic-subtitle">
        {editingItem ? "Update Item" : "Add New Item"}
      </h3>
      <div className="cosmic-form">
        <div className="image-upload mb-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="form-control cosmic-input"
          />
          {(imagePreview || editingItem?.image) && (
            <img
              src={imagePreview || getImageUrl(editingItem?.image)}
              alt="Preview"
              className="image-preview mt-2"
            />
          )}
        </div>
        <input
          type="text"
          placeholder="Name"
          value={editingItem ? editingItem.name : newItem.name}
          onChange={(e) =>
            editingItem
              ? setEditingItem({ ...editingItem, name: e.target.value })
              : setNewItem({ ...newItem, name: e.target.value })
          }
          className="form-control cosmic-input mb-2"
        />
        <input
          type="text"
          placeholder="Description"
          value={editingItem ? editingItem.description : newItem.description}
          onChange={(e) =>
            editingItem
              ? setEditingItem({ ...editingItem, description: e.target.value })
              : setNewItem({ ...newItem, description: e.target.value })
          }
          className="form-control cosmic-input mb-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={editingItem ? editingItem.price : newItem.price}
          onChange={(e) =>
            editingItem
              ? setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })
              : setNewItem({ ...newItem, price: parseFloat(e.target.value) })
          }
          className="form-control cosmic-input mb-2"
        />
        <select
          value={editingItem ? editingItem.category : newItem.category}
          onChange={(e) =>
            editingItem
              ? setEditingItem({ ...editingItem, category: e.target.value })
              : setNewItem({ ...newItem, category: e.target.value })
          }
          className="form-control cosmic-input mb-2"
        >
          <option value="">Select Category</option>
          <option value="appetizers">Appetizers</option>
          <option value="main-course">Main Course</option>
          <option value="desserts">Desserts</option>
          <option value="beverages">Beverages</option>
        </select>
        <button
          className="btn cosmic-button"
          onClick={editingItem ? () => handleUpdateItem(editingItem._id) : handleAddItem}
          disabled={loading}
        >
          {loading
            ? editingItem
              ? "Updating..."
              : "Adding..."
            : editingItem
            ? "Update Menu Item"
            : "Add Menu Item"}
        </button>
        {editingItem && (
          <button
            className="btn cosmic-button-secondary ms-2"
            onClick={() => {
              setEditingItem(null);
              setNewItem({
                name: "",
                description: "",
                price: "",
                category: "",
                availability: true,
              });
              setImage(null);
              setImagePreview(null);
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuManagement;
