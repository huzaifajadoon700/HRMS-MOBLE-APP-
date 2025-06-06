import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiCalendar, FiUsers, FiCreditCard, FiInfo } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';
import EditBooking from '../components/User/EditBooking';
import '../styles/theme.css';

const BookRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    name: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  
  // Extract the edit booking ID from URL query parameters (if it exists)
  const queryParams = new URLSearchParams(location.search);
  const editBookingId = queryParams.get('edit');

  useEffect(() => {
    // If we're editing a booking, don't fetch room details
    if (editBookingId) {
      setLoading(false);
      return;
    }
    
    // Fetch room details based on roomId
    const fetchRoomDetails = async () => {
      try {
        // Add your API call here
        setRoom({
          id: roomId,
          name: 'Deluxe Room',
          price: 150,
          description: 'Spacious room with city view and modern amenities',
          image: '/images/room1.jpg'
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching room details:', error);
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId, editBookingId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add your booking API call here
      console.log('Booking submitted:', { roomId, ...formData });
      navigate('/booking-confirmation');
    } catch (error) {
      console.error('Error submitting booking:', error);
    }
  };
  
  const handleEditSuccess = () => {
    // After successful edit, go back to My Bookings
    navigate('/my-bookings');
  };

  // If in edit mode, show the EditBooking component instead
  if (editBookingId) {
    return (
      <PageLayout>
        <div className="page-header animate-fade-in">
          <h1 className="page-title">Edit Your Booking</h1>
          <p className="page-subtitle">Modify your current reservation</p>
        </div>
        
        <div className="booking-container">
          <EditBooking 
            bookingId={editBookingId} 
            onClose={() => navigate('/my-bookings')}
            onSuccess={handleEditSuccess}
          />
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="loading-state">
          <div className="loading-spinner" />
        </div>
      </PageLayout>
    );
  }

  if (!room) {
    return (
      <PageLayout>
        <div className="error-state">
          <FiInfo className="error-icon" />
          <h3>Room not found</h3>
          <p>Please check the room ID and try again.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Book Your Stay</h1>
        <p className="page-subtitle">
          Complete your reservation for {room.name}
        </p>
      </div>

      <div className="booking-container">
        <div className="booking-content">
          <div className="room-details">
            <div className="room-image">
              <img src={room.image} alt={room.name} />
            </div>
            <div className="room-info">
              <h2>{room.name}</h2>
              <p className="room-description">{room.description}</p>
              <div className="room-price">
                <span className="price-amount">${room.price}</span>
                <span className="price-period">/night</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="checkIn">
                <FiCalendar />
                Check-in Date
              </label>
              <input
                type="date"
                id="checkIn"
                name="checkIn"
                value={formData.checkIn}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="checkOut">
                <FiCalendar />
                Check-out Date
              </label>
              <input
                type="date"
                id="checkOut"
                name="checkOut"
                value={formData.checkOut}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="guests">
                <FiUsers />
                Number of Guests
              </label>
              <input
                type="number"
                id="guests"
                name="guests"
                min="1"
                max="4"
                value={formData.guests}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="specialRequests">Special Requests</label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows="4"
              />
            </div>

            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-item">
                <span>Room Price</span>
                <span>${room.price}/night</span>
              </div>
              <div className="summary-item">
                <span>Number of Nights</span>
                <span>Calculating...</span>
              </div>
              <div className="summary-item total">
                <span>Total Amount</span>
                <span>Calculating...</span>
              </div>
            </div>

            <button type="submit" className="submit-button">
              <FiCreditCard />
              Complete Booking
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default BookRoom;