import React, { useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'My App',
    adminEmail: 'admin@example.com',
    siteStatus: true,
    notifications: true,
    maxUsers: 100,
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);  // for success or error messages

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
      setFeedback({
        type: 'danger',
        message: 'Please fill out all fields.',
      });
      return;
    }

    // Simulate saving process
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFeedback({
        type: 'success',
        message: 'Settings saved successfully!',
      });

      // Save settings logic (e.g., send a POST request to your backend)
      console.log('Settings saved:', settings);
    }, 1500);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Admin Settings</h1>

      {/* Feedback Message */}
      {feedback && (
        <Alert variant={feedback.type} className="mb-4">
          {feedback.message}
        </Alert>
      )}

      {/* Site Settings Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>Site Information</h3>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <label htmlFor="siteName" className="form-label">
              Site Name
            </label>
            <input
              type="text"
              className="form-control"
              id="siteName"
              name="siteName"
              value={settings.siteName}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="adminEmail" className="form-label">
              Admin Email
            </label>
            <input
              type="email"
              className="form-control"
              id="adminEmail"
              name="adminEmail"
              value={settings.adminEmail}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* General Settings Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h3>General Settings</h3>
        </div>
        <div className="card-body">
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="siteStatus"
              name="siteStatus"
              checked={settings.siteStatus}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="siteStatus">
              Enable Site
            </label>
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="notifications"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="notifications">
              Enable Notifications
            </label>
          </div>
          <div className="mb-3">
            <label htmlFor="maxUsers" className="form-label">
              Max Users
            </label>
            <input
              type="number"
              className="form-control"
              id="maxUsers"
              name="maxUsers"
              value={settings.maxUsers}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-center">
        <button
          className="btn btn-success"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" /> Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
