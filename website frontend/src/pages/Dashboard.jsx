import React, { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiShoppingBag, FiDollarSign } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBookings: 0,
    pendingOrders: 0,
    totalRevenue: 0,
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
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your hotel management system</p>
      </div>

      <div className="content-grid">
        <div className="card">
          <FiUsers className="card-icon" size={32} />
          <h3 className="card-title">Total Users</h3>
          <p className="card-text">{stats.totalUsers}</p>
        </div>

        <div className="card">
          <FiCalendar className="card-icon" size={32} />
          <h3 className="card-title">Active Bookings</h3>
          <p className="card-text">{stats.activeBookings}</p>
        </div>

        <div className="card">
          <FiShoppingBag className="card-icon" size={32} />
          <h3 className="card-title">Pending Orders</h3>
          <p className="card-text">{stats.pendingOrders}</p>
        </div>

        <div className="card">
          <FiDollarSign className="card-icon" size={32} />
          <h3 className="card-title">Total Revenue</h3>
          <p className="card-text">${stats.totalRevenue}</p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard; 