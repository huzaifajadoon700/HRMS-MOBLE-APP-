import React, { useState, useEffect } from 'react';
import {
  FiHome,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiMapPin,
  FiRefreshCw,
  FiEye,
  FiEdit,
  FiX,
  FiWifi,
  FiTv,
  FiCoffee
} from 'react-icons/fi';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    // Sample data for demonstration
    const sampleBookings = [
      {
        id: 'BK001',
        roomType: 'Deluxe Suite',
        roomNumber: '205',
        checkIn: '2024-01-15',
        checkOut: '2024-01-18',
        guests: 2,
        nights: 3,
        pricePerNight: 15000,
        totalAmount: 45000,
        status: 'Confirmed',
        amenities: ['WiFi', 'TV', 'Coffee'],
        bookingDate: '2024-01-10'
      },
      {
        id: 'BK002',
        roomType: 'Standard Room',
        roomNumber: '102',
        checkIn: '2024-01-20',
        checkOut: '2024-01-22',
        guests: 1,
        nights: 2,
        pricePerNight: 8000,
        totalAmount: 16000,
        status: 'Pending',
        amenities: ['WiFi', 'TV'],
        bookingDate: '2024-01-12'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setBookings(sampleBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const isUpcoming = (checkIn) => {
    return new Date(checkIn) >= new Date();
  };

  const filteredBookings = bookings.filter(booking =>
    activeTab === 'upcoming' ? isUpcoming(booking.checkIn) : !isUpcoming(booking.checkIn)
  );

  if (loading) {
    return (
      <div className="modern-bookings-page">
        <div className="loading-section">
          <div className="loading-spinner">
            <FiRefreshCw className="spinning" size={32} />
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-bookings-page">
      {/* Hero Section */}
      <section className="bookings-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <FiHome size={48} />
          </div>
          <h1 className="hero-title">My Bookings</h1>
          <p className="hero-subtitle">Manage your room reservations</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bookings-stats">
        <div className="container-fluid">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FiHome />
              </div>
              <div className="stat-content">
                <h3>{bookings.length}</h3>
                <p>Total Bookings</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiClock />
              </div>
              <div className="stat-content">
                <h3>{bookings.filter(b => isUpcoming(b.checkIn)).length}</h3>
                <p>Upcoming</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiCheckCircle />
              </div>
              <div className="stat-content">
                <h3>{bookings.filter(b => !isUpcoming(b.checkIn)).length}</h3>
                <p>Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiDollarSign />
              </div>
              <div className="stat-content">
                <h3>Rs. {bookings.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString('en-PK')}</h3>
                <p>Total Spent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls Section */}
      <section className="bookings-controls">
        <div className="container-fluid">
          <div className="controls-grid">
            <div className="tab-section">
              <button
                className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                <FiClock className="tab-icon" />
                Upcoming
              </button>
              <button
                className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                <FiCheckCircle className="tab-icon" />
                Past
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bookings-content">
        <div className="container-fluid">
          {bookings.length === 0 ? (
            <div className="empty-section">
              <div className="empty-card">
                <FiHome size={64} className="empty-icon" />
                <h3>No Bookings Found</h3>
                <p>You haven't made any room bookings yet. Book a room now!</p>
                <button className="book-btn" onClick={() => window.location.href = "/rooms"}>
                  <FiHome className="btn-icon" />
                  Book Room
                </button>
              </div>
            </div>
          ) : (
            <div className="bookings-grid">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className={`modern-booking-card ${!isUpcoming(booking.checkIn) ? 'past-booking' : ''}`}>
                  <div className="booking-header">
                    <div className="booking-info">
                      <h3 className="booking-id">#{booking.id}</h3>
                      <p className="booking-date">
                        <FiCalendar className="date-icon" />
                        Booked on {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`booking-status status-${booking.status.toLowerCase()}`}>
                      {booking.status === 'Pending' && <FiClock />}
                      {booking.status === 'Confirmed' && <FiCheckCircle />}
                      {booking.status === 'Cancelled' && <FiXCircle />}
                      <span>{booking.status}</span>
                    </div>
                  </div>

                  <div className="room-info">
                    <h4 className="room-title">
                      <FiMapPin className="room-icon" />
                      {booking.roomType} - Room {booking.roomNumber}
                    </h4>
                    <div className="amenities">
                      {booking.amenities.map((amenity, index) => (
                        <span key={index} className="amenity-tag">
                          {amenity === 'WiFi' && <FiWifi />}
                          {amenity === 'TV' && <FiTv />}
                          {amenity === 'Coffee' && <FiCoffee />}
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="booking-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <div className="detail-icon">
                          <FiCalendar />
                        </div>
                        <div className="detail-content">
                          <label>Check-in</label>
                          <span>{new Date(booking.checkIn).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon">
                          <FiCalendar />
                        </div>
                        <div className="detail-content">
                          <label>Check-out</label>
                          <span>{new Date(booking.checkOut).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon">
                          <FiUsers />
                        </div>
                        <div className="detail-content">
                          <label>Guests</label>
                          <span>{booking.guests} People</span>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon">
                          <FiClock />
                        </div>
                        <div className="detail-content">
                          <label>Duration</label>
                          <span>{booking.nights} Nights</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="booking-summary">
                    <div className="summary-row">
                      <span>Price per Night:</span>
                      <span>Rs. {booking.pricePerNight.toLocaleString('en-PK')}</span>
                    </div>
                    <div className="summary-total">
                      <span>Total Amount:</span>
                      <span>Rs. {booking.totalAmount.toLocaleString('en-PK')}</span>
                    </div>
                  </div>

                  <div className="booking-actions">
                    {booking.status === 'Pending' && isUpcoming(booking.checkIn) && (
                      <button className="action-btn cancel-btn">
                        <FiX className="btn-icon" />
                        Cancel
                      </button>
                    )}
                    {isUpcoming(booking.checkIn) && (
                      <button className="action-btn modify-btn">
                        <FiEdit className="btn-icon" />
                        Modify
                      </button>
                    )}
                    <button className="action-btn view-btn">
                      <FiEye className="btn-icon" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyBookings; 