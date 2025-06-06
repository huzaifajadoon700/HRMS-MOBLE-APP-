import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add your reservations data fetching logic here
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

  if (reservations.length === 0) {
    return (
      <PageLayout>
        <div className="empty-state">
          <FiCalendar className="empty-state-icon" />
          <h3 className="empty-state-title">No Reservations Yet</h3>
          <p className="empty-state-text">
            You haven't made any table reservations yet. Book a table now!
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">My Reservations</h1>
        <p className="page-subtitle">Manage your table reservations</p>
      </div>

      <div className="reservations-container">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="card">
            <div className="reservation-header">
              <div className="reservation-info">
                <h3 className="reservation-id">Reservation #{reservation.id}</h3>
                <p className="reservation-date">{reservation.date}</p>
              </div>
              <div className={`reservation-status ${reservation.status.toLowerCase()}`}>
                {reservation.status === 'Pending' && <FiClock />}
                {reservation.status === 'Confirmed' && <FiCheckCircle />}
                {reservation.status === 'Cancelled' && <FiXCircle />}
                <span>{reservation.status}</span>
              </div>
            </div>

            <div className="reservation-details">
              <div className="detail-item">
                <span className="detail-label">Table</span>
                <span className="detail-value">{reservation.table}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Time</span>
                <span className="detail-value">{reservation.time}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Guests</span>
                <span className="detail-value">{reservation.guests}</span>
              </div>
            </div>

            <div className="reservation-actions">
              {reservation.status === 'Pending' && (
                <button className="btn btn-outline">Cancel Reservation</button>
              )}
              <button className="btn btn-primary">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

export default MyReservations; 