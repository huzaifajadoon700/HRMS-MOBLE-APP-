import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiUser, FiMail, FiLock, FiEdit2, FiTrash2, FiSearch, FiFilter, FiToggleLeft, FiToggleRight, FiUserPlus, FiUserCheck, FiUserX } from "react-icons/fi";
import { toast } from "react-toastify";
import "./UserProfileTable.css";

const UserProfileManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to access this page");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
        return;
      }
      const response = await axios.get("http://localhost:8080/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      handleError(error);
      setLoading(false);
    }
  };

  const handleError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (error.response.status === 403) {
        toast.error("You don't have permission to access this page.");
      } else {
        toast.error(error.response.data.message || "Failed to fetch users");
        if (error.response.data.details) {
          toast.info(error.response.data.details);
        }
      }
    } else if (error.request) {
      toast.error("No response from server. Please check your connection.");
    } else {
      toast.error("Error: " + error.message);
    }
  };

  const handleEditUser = (user) => {
    setEditUser({ ...user });
    setEditMode(true);
  };

  const handleUpdateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8080/api/admin/users/${editUser._id}`,
        editUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || "User updated successfully");
      fetchUsers();
      setEditMode(false);
      setEditUser(null);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.delete(
          `http://localhost:8080/api/admin/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(response.data.message || "User deleted successfully");
        fetchUsers();
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:8080/api/admin/users/${userId}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(response.data.message || `User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  const filteredUsers = sortedUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="dash-loading-container">
        <div className="dash-loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-content">
          <h1 className="admin-title">User Management</h1>
          <p className="admin-subtitle">Manage and monitor user profiles</p>
        </div>
        <div className="admin-actions">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <FiFilter className="filter-icon" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
      </div>

      <div className="users-stats">
        <div className="stat-card">
          <FiUserCheck className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{users.filter(u => u.isActive).length}</span>
            <span className="stat-label">Active Users</span>
          </div>
        </div>
        <div className="stat-card">
          <FiUserX className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{users.filter(u => !u.isActive).length}</span>
            <span className="stat-label">Inactive Users</span>
          </div>
        </div>
        <div className="stat-card">
          <FiUserPlus className="stat-icon" />
          <div className="stat-info">
            <span className="stat-value">{users.filter(u => u.role === 'admin').length}</span>
            <span className="stat-label">Administrators</span>
          </div>
        </div>
      </div>

      <div className="users-grid">
        {filteredUsers.map((user) => (
          <div key={user._id} className="user-card">
            <div className="user-header">
              <div className="user-avatar">
                <FiUser className="avatar-icon" />
              </div>
              <div className="user-info">
                <h3>{user.name}</h3>
                <div className="user-badges">
                  <span className={`role-badge ${user.role}`}>{user.role}</span>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="user-details">
              <div className="detail-item">
                <FiMail className="detail-icon" />
                <span>{user.email}</span>
              </div>
              <div className="detail-item">
                <FiLock className="detail-icon" />
                <span>••••••••</span>
              </div>
            </div>

            <div className="user-actions">
              <button
                className="edit-button"
                onClick={() => handleEditUser(user)}
                title="Edit User"
              >
                <FiEdit2 /> Edit
              </button>
              <button
                className="toggle-button"
                onClick={() => handleToggleStatus(user._id, user.isActive)}
                title={user.isActive ? 'Deactivate User' : 'Activate User'}
              >
                {user.isActive ? <FiToggleLeft /> : <FiToggleRight />}
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteUser(user._id)}
                title="Delete User"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editMode && editUser && (
        <div className="edit-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="close-button" onClick={() => setEditMode(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="form-input"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editUser.isActive ? "active" : "inactive"}
                  onChange={(e) => setEditUser({ ...editUser, isActive: e.target.value === "active" })}
                  className="form-input"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <button className="save-button" onClick={handleUpdateUser}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileManagement;
