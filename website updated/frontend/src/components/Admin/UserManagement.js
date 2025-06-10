import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiUsers, FiPlus, FiSearch, FiFilter, FiGrid, FiList,
  FiEdit, FiTrash2, FiMail, FiPhone, FiMapPin, FiUser,
  FiRefreshCw, FiEye, FiUserPlus, FiX, FiCheck, FiClock,
  FiStar, FiAward, FiShield, FiBriefcase, FiSave
} from "react-icons/fi";
import "./AdminManageRooms.css";

const initialUsers = [
  { id: 1, name: "John Doe", email: "johndoe@example.com", phone: "+1234567890", address: "123 Main St, Springfield" },
  { id: 2, name: "Jane Smith", email: "janesmith@example.com", phone: "+9876543210", address: "456 Elm Street, Shelbyville" },
  { id: 3, name: "Alice Johnson", email: "alicejohnson@example.com", phone: "+1029384756", address: "789 Pine Ave, Capital City" },
];

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "customer",
    status: "active"
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

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, sortBy, sortOrder]);

  // Open the Edit modal and set the current user
  const handleEditClick = (user) => {
    setCurrentUser({ ...user });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowAddModal(false);
    setCurrentUser(null);
    setNewUser({
      name: "",
      email: "",
      phone: "",
      address: "",
      role: "customer",
      status: "active"
    });
  };

  // Update user information
  const handleUserSave = () => {
    if (!currentUser.name || !currentUser.email || !currentUser.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUsers(
      users.map((user) =>
        user.id === currentUser.id
          ? { ...user, ...currentUser }
          : user
      )
    );
    toast.success("User updated successfully!");
    handleCloseModal();
  };

  // Add new user
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newId = Math.max(...users.map(u => u.id)) + 1;
    const userToAdd = { ...newUser, id: newId };
    setUsers([...users, userToAdd]);
    toast.success("User added successfully!");
    handleCloseModal();
  };

  // Delete a user after confirmation
  const handleDeleteUser = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      setUsers(users.filter((user) => user.id !== id));
      toast.success("User deleted successfully!");
    }
  };

  const getUserStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'suspended': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="enhanced-admin-users">
      {/* Enhanced Header */}
      <div className="enhanced-users-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiUsers />
              </div>
              <div className="title-text">
                <h1 className="page-title">User Management</h1>
                <p className="page-subtitle">Manage customer accounts and user information</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiUsers />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{users.length}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiCheck />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {users.filter(u => u.status === 'active' || !u.status).length}
                  </div>
                  <div className="stat-label">Active Users</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiMail />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {users.filter(u => u.email && u.email.includes('@')).length}
                  </div>
                  <div className="stat-label">Verified Emails</div>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="action-btn secondary"
                onClick={() => setFilteredUsers([...users])}
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'spinning' : ''} />
                <span>Refresh</span>
              </button>

              <button
                className="action-btn primary"
                onClick={() => setShowAddModal(true)}
              >
                <FiUserPlus />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="enhanced-users-controls">
        <div className="controls-container">
          <div className="search-section">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search users by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="name">Sort by Name</option>
                <option value="email">Sort by Email</option>
                <option value="phone">Sort by Phone</option>
                <option value="address">Sort by Address</option>
              </select>
            </div>

            <button
              className={`sort-btn ${sortOrder === 'asc' ? 'asc' : 'desc'}`}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="view-section">
            <div className="view-toggle">
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
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="enhanced-users-content">
        <div className="content-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <FiRefreshCw className="spinning" />
              </div>
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className={`users-${viewMode}`}>
              {viewMode === 'grid' ? (
                <div className="users-grid">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="user-card">
                      <div className="card-header">
                        <div className="user-avatar">
                          <FiUser />
                        </div>
                        <div className={`status-badge ${getUserStatusColor(user.status || 'active')}`}>
                          <FiCheck />
                          <span>{user.status || 'active'}</span>
                        </div>
                      </div>

                      <div className="card-content">
                        <div className="user-info">
                          <h4 className="user-name">{user.name}</h4>
                          <div className="user-role">{user.role || 'Customer'}</div>
                        </div>

                        <div className="contact-info">
                          <div className="contact-item">
                            <FiMail className="contact-icon" />
                            <span className="contact-text">{user.email}</span>
                          </div>
                          <div className="contact-item">
                            <FiPhone className="contact-icon" />
                            <span className="contact-text">{user.phone}</span>
                          </div>
                          <div className="contact-item">
                            <FiMapPin className="contact-icon" />
                            <span className="contact-text">{user.address}</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-actions">
                        <button
                          className="action-btn secondary small"
                          onClick={() => handleEditClick(user)}
                        >
                          <FiEdit />
                          <span>Edit</span>
                        </button>
                        <button className="action-btn secondary small">
                          <FiEye />
                          <span>View</span>
                        </button>
                        <button className="action-btn secondary small">
                          <FiMail />
                          <span>Contact</span>
                        </button>
                        <button
                          className="action-btn danger small"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <FiTrash2 />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="users-list">
                  <div className="list-header">
                    <div className="list-header-item">User</div>
                    <div className="list-header-item">Email</div>
                    <div className="list-header-item">Phone</div>
                    <div className="list-header-item">Address</div>
                    <div className="list-header-item">Status</div>
                    <div className="list-header-item">Actions</div>
                  </div>

                  {filteredUsers.map((user) => (
                    <div key={user.id} className="list-item">
                      <div className="list-cell">
                        <div className="user-info">
                          <div className="user-avatar small">
                            <FiUser />
                          </div>
                          <div>
                            <div className="user-name">{user.name}</div>
                            <div className="user-role">{user.role || 'Customer'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="list-cell">
                        <div className="email-info">
                          <FiMail className="email-icon" />
                          <span>{user.email}</span>
                        </div>
                      </div>

                      <div className="list-cell">
                        <div className="phone-info">
                          <FiPhone className="phone-icon" />
                          <span>{user.phone}</span>
                        </div>
                      </div>

                      <div className="list-cell">
                        <div className="address-info">
                          <span>{user.address}</span>
                        </div>
                      </div>

                      <div className="list-cell">
                        <div className={`status-badge ${getUserStatusColor(user.status || 'active')}`}>
                          <FiCheck />
                          <span>{user.status || 'active'}</span>
                        </div>
                      </div>

                      <div className="list-cell">
                        <div className="actions">
                          <button
                            className="action-btn secondary small"
                            onClick={() => handleEditClick(user)}
                          >
                            <FiEdit />
                          </button>
                          <button className="action-btn secondary small">
                            <FiEye />
                          </button>
                          <button
                            className="action-btn danger small"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FiUsers />
              </div>
              <h3>No Users Found</h3>
              <p>
                {searchTerm
                  ? "No users match your search criteria. Try adjusting your search terms."
                  : "No users have been registered yet. Users will appear here once they create accounts."}
              </p>
              {searchTerm && (
                <button
                  className="action-btn primary"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Edit Modal */}
      {showEditModal && currentUser && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="enhanced-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User Details</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <FiUser className="label-icon" />
                    Full Name
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="enhanced-input"
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiMail className="label-icon" />
                    Email Address
                    <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="enhanced-input"
                    value={currentUser.email}
                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiPhone className="label-icon" />
                    Phone Number
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="enhanced-input"
                    value={currentUser.phone}
                    onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiShield className="label-icon" />
                    User Role
                  </label>
                  <select
                    className="enhanced-select"
                    value={currentUser.role || 'customer'}
                    onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiCheck className="label-icon" />
                    Status
                  </label>
                  <select
                    className="enhanced-select"
                    value={currentUser.status || 'active'}
                    onChange={(e) => setCurrentUser({ ...currentUser, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <FiMapPin className="label-icon" />
                    Address
                  </label>
                  <textarea
                    className="enhanced-textarea"
                    value={currentUser.address}
                    onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })}
                    placeholder="Enter full address"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="action-btn secondary" onClick={handleCloseModal}>
                <FiX />
                <span>Cancel</span>
              </button>
              <button className="action-btn primary" onClick={handleUserSave}>
                <FiSave />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="enhanced-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    <FiUser className="label-icon" />
                    Full Name
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="enhanced-input"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiMail className="label-icon" />
                    Email Address
                    <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className="enhanced-input"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiPhone className="label-icon" />
                    Phone Number
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="enhanced-input"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiShield className="label-icon" />
                    User Role
                  </label>
                  <select
                    className="enhanced-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiCheck className="label-icon" />
                    Status
                  </label>
                  <select
                    className="enhanced-select"
                    value={newUser.status}
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    <FiMapPin className="label-icon" />
                    Address
                  </label>
                  <textarea
                    className="enhanced-textarea"
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                    placeholder="Enter full address"
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="action-btn secondary" onClick={handleCloseModal}>
                <FiX />
                <span>Cancel</span>
              </button>
              <button className="action-btn primary" onClick={handleAddUser}>
                <FiUserPlus />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
