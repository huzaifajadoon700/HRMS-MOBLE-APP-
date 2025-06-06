import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./StaffManagement.css";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    status: "active"
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/staff", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data);
    } catch (error) {
      toast.error("Failed to fetch staff members");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
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
        status: "active"
      });
      toast.success("Staff member added successfully");
    } catch (error) {
      toast.error("Failed to add staff member");
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
        toast.success("Staff member deleted successfully");
      } catch (error) {
        toast.error("Failed to delete staff member");
      }
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "all" || member.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-management-container">
      <div className="staff-header">
        <h2>Staff Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search staff members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="form-control role-select"
          >
            <option value="all">All Roles</option>
            <option value="manager">Manager</option>
            <option value="chef">Chef</option>
            <option value="waiter">Waiter</option>
            <option value="host">Host</option>
          </select>
          <button
            className="btn btn-primary add-staff-btn"
            onClick={() => setShowAddModal(true)}
          >
            Add Staff Member
          </button>
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