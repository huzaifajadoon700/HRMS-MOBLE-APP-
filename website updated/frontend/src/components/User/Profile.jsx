import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiX,
  FiEdit2,
  FiPhone,
  FiSettings,
  FiShield,
  FiHeart,
  FiCalendar,

  FiStar,
  FiActivity,
  FiTrendingUp,
  FiAward,
  FiBookmark
} from "react-icons/fi";
import UserFoodPreferences from "../recommendations/UserFoodPreferences";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    joinDate: "",
    lastLogin: "",
    totalBookings: 0,
    totalOrders: 0,
    favoriteItems: [],
    loyaltyPoints: 0
  });
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('profile');
  const [stats] = useState({
    totalBookings: 0,
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    favoriteItems: []
  });
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
      await axios.put(
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
      await axios.put(
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
    <div className="modern-profile-page">
      {/* Hero Section */}
      <section className="profile-hero">
        <div className="hero-content">
          <div className="user-avatar">
            <FiUser size={48} />
          </div>
          <h1 className="hero-title">Welcome back, {user.name || 'User'}!</h1>
          <p className="hero-subtitle">Manage your profile and preferences</p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="profile-nav">
        <div className="container-fluid">
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FiUser className="tab-icon" />
              Profile
            </button>
            <button
              className={`nav-tab ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <FiShield className="tab-icon" />
              Security
            </button>
            <button
              className={`nav-tab ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <FiSettings className="tab-icon" />
              Preferences
            </button>
            <button
              className={`nav-tab ${activeTab === 'activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('activity')}
            >
              <FiActivity className="tab-icon" />
              Activity
            </button>
          </div>
        </div>
      </section>

      {/* Messages */}
      {error && (
        <div className="container-fluid">
          <div className="alert alert-error">{error}</div>
        </div>
      )}
      {message && (
        <div className="container-fluid">
          <div className="alert alert-success">{message}</div>
        </div>
      )}

      {/* Main Content */}
      <section className="profile-content">
        <div className="container-fluid">
          <div className="content-grid">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <>
                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiCalendar />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.totalBookings}</h3>
                      <p>Total Bookings</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiHeart />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.totalOrders}</h3>
                      <p>Total Orders</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiStar />
                    </div>
                    <div className="stat-content">
                      <h3>{stats.loyaltyPoints}</h3>
                      <p>Loyalty Points</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiTrendingUp />
                    </div>
                    <div className="stat-content">
                      <h3>${stats.totalSpent}</h3>
                      <p>Total Spent</p>
                    </div>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="profile-section">
                  <div className="section-header">
                    <h3>
                      <FiUser className="section-icon" />
                      Personal Information
                    </h3>
                    {!editMode ? (
                      <button className="edit-button" onClick={() => setEditMode(true)}>
                        <FiEdit2 className="btn-icon" /> Edit Profile
                      </button>
                    ) : (
                      <div className="button-group">
                        <button className="save-button" onClick={handleUpdateProfile}>
                          <FiSave className="btn-icon" /> Save
                        </button>
                        <button className="cancel-button" onClick={() => setEditMode(false)}>
                          <FiX className="btn-icon" /> Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="profile-info">
                    {editMode ? (
                      <form onSubmit={handleUpdateProfile} className="profile-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>
                              <FiUser className="form-icon" /> Name
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
                              <FiMail className="form-icon" /> Email
                            </label>
                            <input
                              type="email"
                              value={user.email}
                              onChange={(e) => setUser({ ...user, email: e.target.value })}
                              className="form-input"
                            />
                          </div>
                        </div>
                        <div className="form-row">
                          <div className="form-group">
                            <label>
                              <FiPhone className="form-icon" /> Phone Number
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
                              <FiAward className="form-icon" /> Role
                            </label>
                            <input
                              type="text"
                              value={user.role}
                              disabled
                              className="form-input disabled"
                            />
                          </div>
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
                          <FiAward className="info-icon" />
                          <div className="info-content">
                            <label>Role</label>
                            <span>{user.role}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="profile-section">
                <div className="section-header">
                  <h3>
                    <FiShield className="section-icon" />
                    Security Settings
                  </h3>
                </div>
                <form onSubmit={handleUpdatePassword} className="password-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FiLock className="form-icon" /> Current Password
                      </label>
                      <input
                        type="password"
                        value={user.currentPassword || ""}
                        onChange={(e) => setUser({ ...user, currentPassword: e.target.value })}
                        className="form-input"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <FiLock className="form-icon" /> New Password
                      </label>
                      <input
                        type="password"
                        value={user.newPassword || ""}
                        onChange={(e) => setUser({ ...user, newPassword: e.target.value })}
                        className="form-input"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>
                  <button type="submit" className="update-password-button">
                    <FiLock className="btn-icon" /> Update Password
                  </button>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="profile-section">
                <div className="section-header">
                  <h3>
                    <FiSettings className="section-icon" />
                    Food Preferences
                  </h3>
                </div>
                <UserFoodPreferences
                  userId={user._id}
                  onPreferencesUpdate={(preferences) => {
                    setMessage("Food preferences updated successfully!");
                  }}
                />
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="activity-section">
                <div className="activity-cards">
                  <div className="activity-card">
                    <div className="activity-header">
                      <FiBookmark className="activity-icon" />
                      <h4>Recent Bookings</h4>
                    </div>
                    <p>No recent bookings found.</p>
                  </div>
                  <div className="activity-card">
                    <div className="activity-header">
                      <FiHeart className="activity-icon" />
                      <h4>Recent Orders</h4>
                    </div>
                    <p>No recent orders found.</p>
                  </div>
                  <div className="activity-card">
                    <div className="activity-header">
                      <FiStar className="activity-icon" />
                      <h4>Loyalty Status</h4>
                    </div>
                    <p>You have {stats.loyaltyPoints} loyalty points.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;