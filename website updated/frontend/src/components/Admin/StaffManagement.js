import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FiUsers, FiPlus, FiSearch, FiFilter, FiGrid, FiList,
  FiEdit, FiTrash2, FiMail, FiPhone, FiMapPin, FiUser,
  FiRefreshCw, FiEye, FiUserPlus, FiX, FiCheck, FiClock,
  FiStar, FiAward, FiShield, FiBriefcase
} from "react-icons/fi";
import "./AdminManageRooms.css";

const StaffManagement = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grid");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    status: "active",
    salary: "",
    joinDate: "",
    address: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }

    fetchStaff();
  }, [navigate]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...staff];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone?.includes(searchQuery) ||
        member.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter(member => member.role === selectedRole);
    }

    // Department filter
    if (selectedDepartment !== "all") {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';

      if (sortBy === "joinDate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === "salary") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredStaff(filtered);
  }, [staff, searchQuery, selectedRole, selectedDepartment, sortBy, sortOrder]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/staff", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data);
      setFilteredStaff(response.data);
      toast.success("Staff data loaded successfully");
    } catch (error) {
      console.error("Error fetching staff:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error("Failed to fetch staff members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();

    if (!newStaff.name || !newStaff.email || !newStaff.phone || !newStaff.role || !newStaff.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/staff",
        newStaff,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStaff([...staff, response.data]);
      setShowAddModal(false);
      setNewStaff({
        name: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        status: "active",
        salary: "",
        joinDate: "",
        address: ""
      });
      toast.success("Staff member added successfully!");
    } catch (error) {
      console.error("Error adding staff:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to add staff member");
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8080/api/staff/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStaff(staff.filter(member => member._id !== id));
        toast.success("Staff member deleted successfully!");
      } catch (error) {
        console.error("Error deleting staff:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          toast.error("Session expired. Please login again.");
          navigate("/login");
          return;
        }
        toast.error(error.response?.data?.message || "Failed to delete staff member");
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'manager': return FiShield;
      case 'chef': return FiBriefcase;
      case 'waiter': return FiUser;
      case 'host': return FiUsers;
      default: return FiUser;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'on-leave': return 'orange';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="enhanced-admin-staff">
        <div className="loading-state">
          <div className="loading-spinner">
            <FiRefreshCw className="spinning" />
          </div>
          <p>Loading staff members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-admin-staff">
      {/* Enhanced Header */}
      <div className="enhanced-staff-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiUsers />
              </div>
              <div className="title-text">
                <h1 className="page-title">Staff Management</h1>
                <p className="page-subtitle">Manage your team members and their information</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiUsers />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{staff.length}</div>
                  <div className="stat-label">Total Staff</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiCheck />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {staff.filter(s => s.status === 'active').length}
                  </div>
                  <div className="stat-label">Active Staff</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiBriefcase />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    {[...new Set(staff.map(s => s.department))].length}
                  </div>
                  <div className="stat-label">Departments</div>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="action-btn secondary"
                onClick={fetchStaff}
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
                <span>Add Staff</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="staff-grid">
        {filteredStaff.map((member) => (
          <div key={member._id} className="staff-card">
            <div className="staff-avatar">
              <img
                src={member.avatar || "https://via.placeholder.com/100"}
                alt={member.name}
              />
            </div>
            <div className="staff-info">
              <h3>{member.name}</h3>
              <p className="role">{member.role}</p>
              <p className="department">{member.department}</p>
              <div className="contact-info">
                <p><i className="bi bi-envelope"></i> {member.email}</p>
                <p><i className="bi bi-telephone"></i> {member.phone}</p>
              </div>
              <span className={`status-badge ${member.status}`}>
                {member.status}
              </span>
            </div>
            <div className="staff-actions">
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteStaff(member._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Staff Member</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddStaff} className="add-staff-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, role: e.target.value })
                  }
                  required
                >
                  <option value="">Select Role</option>
                  <option value="manager">Manager</option>
                  <option value="chef">Chef</option>
                  <option value="waiter">Waiter</option>
                  <option value="host">Host</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={newStaff.department}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, department: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Add Staff Member
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement; 