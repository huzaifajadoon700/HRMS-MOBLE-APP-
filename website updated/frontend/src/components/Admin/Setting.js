import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiSettings, FiSave, FiRefreshCw, FiGlobe, FiMail, FiUsers,
  FiBell, FiShield, FiDatabase, FiServer, FiLock, FiEye,
  FiToggleLeft, FiToggleRight, FiCheck, FiX, FiEdit,
  FiMonitor, FiSmartphone, FiTablet, FiWifi, FiClock
} from 'react-icons/fi';
import './AdminManageRooms.css';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    siteName: 'Hotel Management System',
    adminEmail: 'admin@hotelms.com',
    siteStatus: true,
    notifications: true,
    emailNotifications: true,
    smsNotifications: false,
    maxUsers: 100,
    maxRooms: 50,
    currency: 'PKR',
    timezone: 'Asia/Karachi',
    language: 'en',
    theme: 'dark',
    maintenanceMode: false,
    backupFrequency: 'daily',
    sessionTimeout: 30,
    passwordPolicy: true,
    twoFactorAuth: false,
    apiAccess: true
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Handle change in input fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle save button click
  const handleSave = () => {
    // Basic validation
    if (!settings.siteName || !settings.adminEmail || !settings.maxUsers) {
      toast.error('Please fill out all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.adminEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    // Simulate saving process
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Settings saved successfully!');

      // Save settings logic (e.g., send a POST request to your backend)
      console.log('Settings saved:', settings);
    }, 1500);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        siteName: 'Hotel Management System',
        adminEmail: 'admin@hotelms.com',
        siteStatus: true,
        notifications: true,
        emailNotifications: true,
        smsNotifications: false,
        maxUsers: 100,
        maxRooms: 50,
        currency: 'PKR',
        timezone: 'Asia/Karachi',
        language: 'en',
        theme: 'dark',
        maintenanceMode: false,
        backupFrequency: 'daily',
        sessionTimeout: 30,
        passwordPolicy: true,
        twoFactorAuth: false,
        apiAccess: true
      });
      toast.success('Settings reset to default values!');
    }
  };

  return (
    <div className="enhanced-admin-settings">
      {/* Enhanced Header */}
      <div className="enhanced-settings-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiSettings />
              </div>
              <div className="title-text">
                <h1 className="page-title">System Settings</h1>
                <p className="page-subtitle">Configure and manage your hotel management system</p>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="action-btn secondary"
                onClick={handleReset}
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'spinning' : ''} />
                <span>Reset to Default</span>
              </button>

              <button
                className="action-btn primary"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FiRefreshCw className="spinning" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="enhanced-settings-content">
        <div className="content-container">
          <div className="settings-layout">
            {/* Settings Navigation */}
            <div className="settings-nav">
              <div className="nav-header">
                <h3>Settings Categories</h3>
              </div>
              <div className="nav-items">
                <button
                  className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveTab('general')}
                >
                  <FiGlobe className="nav-icon" />
                  <span>General</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}
                >
                  <FiBell className="nav-icon" />
                  <span>Notifications</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <FiShield className="nav-icon" />
                  <span>Security</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'system' ? 'active' : ''}`}
                  onClick={() => setActiveTab('system')}
                >
                  <FiServer className="nav-icon" />
                  <span>System</span>
                </button>
                <button
                  className={`nav-item ${activeTab === 'appearance' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appearance')}
                >
                  <FiMonitor className="nav-icon" />
                  <span>Appearance</span>
                </button>
              </div>
            </div>

            {/* Settings Content */}
            <div className="settings-content">
              {activeTab === 'general' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>General Settings</h2>
                    <p>Basic configuration for your hotel management system</p>
                  </div>

                  <div className="settings-grid">
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiGlobe className="label-icon" />
                        Site Name
                        <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="enhanced-input"
                        name="siteName"
                        value={settings.siteName}
                        onChange={handleChange}
                        placeholder="Enter site name"
                      />
                    </div>

                    <div className="setting-group">
                      <label className="setting-label">
                        <FiMail className="label-icon" />
                        Admin Email
                        <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        className="enhanced-input"
                        name="adminEmail"
                        value={settings.adminEmail}
                        onChange={handleChange}
                        placeholder="Enter admin email"
                      />
                    </div>

                    <div className="setting-group">
                      <label className="setting-label">
                        <FiUsers className="label-icon" />
                        Maximum Users
                      </label>
                      <input
                        type="number"
                        className="enhanced-input"
                        name="maxUsers"
                        value={settings.maxUsers}
                        onChange={handleChange}
                        min="1"
                        max="1000"
                      />
                    </div>

                    <div className="setting-group">
                      <label className="setting-label">
                        <FiGlobe className="label-icon" />
                        Maximum Rooms
                      </label>
                      <input
                        type="number"
                        className="enhanced-input"
                        name="maxRooms"
                        value={settings.maxRooms}
                        onChange={handleChange}
                        min="1"
                        max="500"
                      />
                    </div>

                    <div className="setting-group">
                      <label className="setting-label">
                        <FiGlobe className="label-icon" />
                        Currency
                      </label>
                      <select
                        className="enhanced-select"
                        name="currency"
                        value={settings.currency}
                        onChange={handleChange}
                      >
                        <option value="PKR">Pakistani Rupee (PKR)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="GBP">British Pound (GBP)</option>
                      </select>
                    </div>

                    <div className="setting-group">
                      <label className="setting-label">
                        <FiGlobe className="label-icon" />
                        Timezone
                      </label>
                      <select
                        className="enhanced-select"
                        name="timezone"
                        value={settings.timezone}
                        onChange={handleChange}
                      >
                        <option value="Asia/Karachi">Asia/Karachi</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                        <option value="Europe/London">Europe/London</option>
                      </select>
                    </div>
                  </div>

                  <div className="toggle-settings">
                    <div className="toggle-group">
                      <div className="toggle-info">
                        <h4>Site Status</h4>
                        <p>Enable or disable the entire website</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          name="siteStatus"
                          checked={settings.siteStatus}
                          onChange={handleChange}
                        />
                        <span className="toggle-slider">
                          <span className="toggle-button">
                            {settings.siteStatus ? <FiCheck /> : <FiX />}
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="toggle-group">
                      <div className="toggle-info">
                        <h4>Maintenance Mode</h4>
                        <p>Put the site in maintenance mode</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          name="maintenanceMode"
                          checked={settings.maintenanceMode}
                          onChange={handleChange}
                        />
                        <span className="toggle-slider">
                          <span className="toggle-button">
                            {settings.maintenanceMode ? <FiCheck /> : <FiX />}
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Notification Settings</h2>
                    <p>Configure how and when notifications are sent</p>
                  </div>

                  <div className="toggle-settings">
                    <div className="toggle-group">
                      <div className="toggle-info">
                        <h4>General Notifications</h4>
                        <p>Enable or disable all notifications</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          name="notifications"
                          checked={settings.notifications}
                          onChange={handleChange}
                        />
                        <span className="toggle-slider">
                          <span className="toggle-button">
                            {settings.notifications ? <FiCheck /> : <FiX />}
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="toggle-group">
                      <div className="toggle-info">
                        <h4>Email Notifications</h4>
                        <p>Send notifications via email</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={settings.emailNotifications}
                          onChange={handleChange}
                        />
                        <span className="toggle-slider">
                          <span className="toggle-button">
                            {settings.emailNotifications ? <FiCheck /> : <FiX />}
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="toggle-group">
                      <div className="toggle-info">
                        <h4>SMS Notifications</h4>
                        <p>Send notifications via SMS</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          name="smsNotifications"
                          checked={settings.smsNotifications}
                          onChange={handleChange}
                        />
                        <span className="toggle-slider">
                          <span className="toggle-button">
                            {settings.smsNotifications ? <FiCheck /> : <FiX />}
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Security Settings</h2>
                    <p>Configure security and authentication options</p>
                  </div>

                  <div className="settings-grid">
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiClock className="label-icon" />
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        className="enhanced-input"
                        name="sessionTimeout"
                        value={settings.sessionTimeout}
                        onChange={handleChange}
                        min="5"
                        max="120"
                      />
                    </div>
                  </div>

                  <div className="toggle-settings">
                    <div className="toggle-group">
                      <div className="toggle-info">
                        <h4>Password Policy</h4>
                        <p>Enforce strong password requirements</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          name="passwordPolicy"
                          checked={settings.passwordPolicy}
                          onChange={handleChange}
                        />
                        <span className="toggle-slider">
                          <span className="toggle-button">
                            {settings.passwordPolicy ? <FiCheck /> : <FiX />}
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="toggle-group">
                      <div className="toggle-info">
                        <h4>Two-Factor Authentication</h4>
                        <p>Require 2FA for admin accounts</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          name="twoFactorAuth"
                          checked={settings.twoFactorAuth}
                          onChange={handleChange}
                        />
                        <span className="toggle-slider">
                          <span className="toggle-button">
                            {settings.twoFactorAuth ? <FiCheck /> : <FiX />}
                          </span>
                        </span>
                      </label>
                    </div>

                    <div className="toggle-group">
                      <div className="toggle-info">
                        <h4>API Access</h4>
                        <p>Allow external API access</p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          name="apiAccess"
                          checked={settings.apiAccess}
                          onChange={handleChange}
                        />
                        <span className="toggle-slider">
                          <span className="toggle-button">
                            {settings.apiAccess ? <FiCheck /> : <FiX />}
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>System Settings</h2>
                    <p>Configure system-level options and maintenance</p>
                  </div>

                  <div className="settings-grid">
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiDatabase className="label-icon" />
                        Backup Frequency
                      </label>
                      <select
                        className="enhanced-select"
                        name="backupFrequency"
                        value={settings.backupFrequency}
                        onChange={handleChange}
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="setting-group">
                      <label className="setting-label">
                        <FiGlobe className="label-icon" />
                        Language
                      </label>
                      <select
                        className="enhanced-select"
                        name="language"
                        value={settings.language}
                        onChange={handleChange}
                      >
                        <option value="en">English</option>
                        <option value="ur">Urdu</option>
                        <option value="ar">Arabic</option>
                        <option value="es">Spanish</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="settings-section">
                  <div className="section-header">
                    <h2>Appearance Settings</h2>
                    <p>Customize the look and feel of your system</p>
                  </div>

                  <div className="settings-grid">
                    <div className="setting-group">
                      <label className="setting-label">
                        <FiMonitor className="label-icon" />
                        Theme
                      </label>
                      <select
                        className="enhanced-select"
                        name="theme"
                        value={settings.theme}
                        onChange={handleChange}
                      >
                        <option value="light">Light Theme</option>
                        <option value="dark">Dark Theme</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                  </div>

                  <div className="theme-preview">
                    <h4>Theme Preview</h4>
                    <div className="preview-cards">
                      <div className={`preview-card ${settings.theme}`}>
                        <div className="preview-header">
                          <div className="preview-title">Sample Card</div>
                          <div className="preview-actions">
                            <div className="preview-btn"></div>
                            <div className="preview-btn"></div>
                          </div>
                        </div>
                        <div className="preview-content">
                          <div className="preview-text"></div>
                          <div className="preview-text short"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
