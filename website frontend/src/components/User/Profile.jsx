import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiSave, FiX, FiEdit2, FiPhone } from "react-icons/fi";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState({ name: "", email: "", phone: "", role: "" });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        setError("Error fetching profile data");
      }
    };

    fetchProfile();
  }, [navigate]);

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:8080/api/user/profile",
        { name: user.name, email: user.email, phone: user.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Profile updated successfully");
      setEditMode(false);
    } catch (error) {
      setError("Error updating profile");
    }
  };

  // Handle password update
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    const { currentPassword, newPassword } = user;
    if (!currentPassword || !newPassword) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      const response = await axios.put(
        "http://localhost:8080/api/user/password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Password updated successfully");
      setUser({ ...user, currentPassword: "", newPassword: "" });
    } catch (error) {
      setError("Error updating password: " + (error.response?.data?.message || "Unknown error"));
    }
  };
  

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h2 className="profile-title">My Profile</h2>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="profile-section">
          <div className="section-header">
            <h3>Personal Information</h3>
            {!editMode ? (
              <button className="edit-button" onClick={() => setEditMode(true)}>
                <FiEdit2 className="me-2" /> Edit Profile
              </button>
            ) : (
              <div className="button-group">
                <button className="save-button" onClick={handleUpdateProfile}>
                  <FiSave className="me-2" /> Save Changes
                </button>
                <button className="cancel-button" onClick={() => setEditMode(false)}>
                  <FiX className="me-2" /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="profile-info">
            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label>
                    <FiUser className="me-2" /> Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FiMail className="me-2" /> Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FiPhone className="me-2" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    value={user.phone || ""}
                    onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    className="form-input"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <FiUser className="me-2" /> Role
                  </label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="form-input disabled"
                  />
                </div>
              </form>
            ) : (
              <div className="info-display">
                <div className="info-item">
                  <FiUser className="info-icon" />
                  <div className="info-content">
                    <label>Name</label>
                    <span>{user.name}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiMail className="info-icon" />
                  <div className="info-content">
                    <label>Email</label>
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiPhone className="info-icon" />
                  <div className="info-content">
                    <label>Phone</label>
                    <span>{user.phone || "Not provided"}</span>
                  </div>
                </div>
                <div className="info-item">
                  <FiUser className="info-icon" />
                  <div className="info-content">
                    <label>Role</label>
                    <span>{user.role}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h3>Change Password</h3>
          </div>
          <form onSubmit={handleUpdatePassword} className="password-form">
            <div className="form-group">
              <label>
                <FiLock className="me-2" /> Current Password
              </label>
              <input
                type="password"
                value={user.currentPassword || ""}
                onChange={(e) => setUser({ ...user, currentPassword: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>
                <FiLock className="me-2" /> New Password
              </label>
              <input
                type="password"
                value={user.newPassword || ""}
                onChange={(e) => setUser({ ...user, newPassword: e.target.value })}
                className="form-input"
              />
            </div>
            <button type="submit" className="update-password-button">
              <FiLock className="me-2" /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;