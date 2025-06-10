import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./ShiftManagement.css";

const ShiftManagement = () => {
  const [shifts, setShifts] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [newShift, setNewShift] = useState({
    staffId: "",
    date: new Date().toISOString().split('T')[0],
    time: "",
    duration: "",
    role: "",
    status: "scheduled"
  });

  useEffect(() => {
    fetchShifts();
    fetchStaff();
  }, [selectedDate]);

  const fetchShifts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/api/shift?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShifts(response.data);
    } catch (error) {
      toast.error("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/staff", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(response.data);
    } catch (error) {
      toast.error("Failed to fetch staff members");
    }
  };

  const handleAddShift = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/shift/add",
        newShift,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShifts([...shifts, response.data]);
      setShowAddModal(false);
      setNewShift({
        staffId: "",
        date: new Date().toISOString().split('T')[0],
        time: "",
        duration: "",
        role: "",
        status: "scheduled"
      });
      toast.success("Shift added successfully");
    } catch (error) {
      toast.error("Failed to add shift");
    }
  };

  const handleUpdateShiftStatus = async (shiftId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `http://localhost:8080/api/shift/${shiftId}/toggle`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShifts(shifts.map(shift => 
        shift._id === shiftId ? response.data : shift
      ));
      toast.success("Shift status updated successfully");
    } catch (error) {
      toast.error("Failed to update shift status");
    }
  };

  const handleDeleteShift = async (shiftId) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8080/api/shift/${shiftId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setShifts(shifts.filter(shift => shift._id !== shiftId));
        toast.success("Shift deleted successfully");
      } catch (error) {
        toast.error("Failed to delete shift");
      }
    }
  };

  const getStaffName = (staffId) => {
    const staffMember = staff.find(member => member._id === staffId);
    return staffMember ? staffMember.name : "Unknown Staff";
  };

  const getStaffRole = (staffId) => {
    const staffMember = staff.find(member => member._id === staffId);
    return staffMember ? staffMember.role : "Unknown Role";
  };

  const getStaffAvatar = (staffId) => {
    const staffMember = staff.find(member => member._id === staffId);
    return staffMember?.avatar || "https://via.placeholder.com/50";
  };

  const getShiftStats = () => {
    const totalShifts = shifts.length;
    const presentShifts = shifts.filter(shift => shift.attended).length;
    const absentShifts = totalShifts - presentShifts;
    return { totalShifts, presentShifts, absentShifts };
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const stats = getShiftStats();

  return (
    <div className="shift-management-container">
      <div className="shift-header">
        <div className="header-content">
          <h2>Shift Management</h2>
          <p className="subtitle">Manage staff shifts and attendance</p>
        </div>
        <div className="header-actions">
          <div className="date-selector">
            <label>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="form-control"
            />
          </div>
          <button
            className="btn btn-primary add-shift-btn"
            onClick={() => setShowAddModal(true)}
          >
            <i className="bi bi-plus-lg"></i> Add New Shift
          </button>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="bi bi-calendar-check"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalShifts}</h3>
            <p>Total Shifts</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon present">
            <i className="bi bi-person-check"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.presentShifts}</h3>
            <p>Present</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon absent">
            <i className="bi bi-person-x"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.absentShifts}</h3>
            <p>Absent</p>
          </div>
        </div>
      </div>

      <div className="shifts-grid">
        {shifts.map((shift) => (
          <div key={shift._id} className="shift-card">
            <div className="shift-header">
              <div className="staff-avatar">
                <img src={getStaffAvatar(shift.staffId)} alt={getStaffName(shift.staffId)} />
              </div>
              <div className="staff-info">
                <h3>{getStaffName(shift.staffId)}</h3>
                <p className="role">{getStaffRole(shift.staffId)}</p>
              </div>
            </div>
            <div className="shift-details">
              <div className="detail-item">
                <i className="bi bi-clock"></i>
                <span>
                  {new Date(`2000-01-01T${shift.time}`).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} - {shift.duration} hours
                </span>
              </div>
              <div className="detail-item">
                <i className="bi bi-calendar"></i>
                <span>{new Date(shift.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="shift-status">
              <span className={`status-badge ${shift.attended ? 'present' : 'absent'}`}>
                {shift.attended ? 'Present' : 'Absent'}
              </span>
            </div>
            <div className="shift-actions">
              {!shift.attended && (
                <button
                  className="btn btn-success"
                  onClick={() => handleUpdateShiftStatus(shift._id, true)}
                >
                  <i className="bi bi-check-lg"></i> Mark Present
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteShift(shift._id)}
              >
                <i className="bi bi-trash"></i> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Shift</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddShift} className="add-shift-form">
              <div className="form-group">
                <label>Staff Member</label>
                <select
                  value={newShift.staffId}
                  onChange={(e) =>
                    setNewShift({ ...newShift, staffId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Staff Member</option>
                  {staff.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={newShift.date}
                  onChange={(e) =>
                    setNewShift({ ...newShift, date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={newShift.time}
                  onChange={(e) =>
                    setNewShift({ ...newShift, time: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Duration (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={newShift.duration}
                  onChange={(e) =>
                    setNewShift({ ...newShift, duration: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <i className="bi bi-plus-lg"></i> Add Shift
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

export default ShiftManagement; 