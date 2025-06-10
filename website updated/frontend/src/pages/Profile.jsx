import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add your data fetching logic here
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <div className="loading-state">
          <div className="loading-spinner" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      <div className="profile-container">
        <div className="card">
          <div className="profile-header">
            <div className="profile-avatar">
              <FiUser size={48} />
            </div>
            <h2 className="profile-name">{user.name}</h2>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <FiMail className="detail-icon" />
              <div>
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </div>

            <div className="detail-item">
              <FiPhone className="detail-icon" />
              <div>
                <span className="detail-label">Phone</span>
                <span className="detail-value">{user.phone}</span>
              </div>
            </div>

            <div className="detail-item">
              <FiMapPin className="detail-icon" />
              <div>
                <span className="detail-label">Address</span>
                <span className="detail-value">{user.address}</span>
              </div>
            </div>
          </div>

          <button className="btn btn-primary w-100">
            Edit Profile
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Profile; 