import React, { useState, useEffect } from 'react';
import { FiHome, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add your bookings data fetching logic here
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

  if (bookings.length === 0) {
    return (
      <PageLayout>
        <div className="empty-state">
          <FiHome className="empty-state-icon" />
          <h3 className="empty-state-title">No Bookings Yet</h3>
          <p className="empty-state-text">
            You haven't made any room bookings yet. Book a room now!
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Manage your room bookings</p>
      </div>

      <div className="bookings-container">
        {bookings.map((booking) => (
          <div key={booking.id} className="card">
            <div className="booking-header">
              <div className="booking-info">
                <h3 className="booking-id">Booking #{booking.id}</h3>
                <p className="booking-date">{booking.date}</p>
              </div>
              <div className={`booking-status ${booking.status.toLowerCase()}`}>
                {booking.status === 'Pending' && <FiClock />}
                {booking.status === 'Confirmed' && <FiCheckCircle />}
                {booking.status === 'Cancelled' && <FiXCircle />}
                <span>{booking.status}</span>
              </div>
            </div>

            <div className="booking-details">
              <div className="detail-item">
                <span className="detail-label">Room</span>
                <span className="detail-value">{booking.room}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Check-in</span>
                <span className="detail-value">{booking.checkIn}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Check-out</span>
                <span className="detail-value">{booking.checkOut}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Guests</span>
                <span className="detail-value">{booking.guests}</span>
              </div>
            </div>

            <div className="booking-summary">
              <div className="summary-item">
                <span>Total Nights</span>
                <span>{booking.nights}</span>
              </div>
              <div className="summary-item">
                <span>Price per Night</span>
                <span>${booking.pricePerNight}</span>
              </div>
              <div className="summary-item total">
                <span>Total Amount</span>
                <span>${booking.totalAmount}</span>
              </div>
            </div>

            <div className="booking-actions">
              {booking.status === 'Pending' && (
                <button className="btn btn-outline">Cancel Booking</button>
              )}
              <button className="btn btn-primary">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default MyBookings; 