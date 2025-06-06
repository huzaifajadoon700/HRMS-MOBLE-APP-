import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCalendar, FiUser, FiMail, FiPhone, FiCreditCard, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import PageLayout from '../components/layout/PageLayout';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './BookingPage.css';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RQDO0QHBrXA72xgYssbECOe9bubZ2bWHA4m0T6EY6AvvmAfCzIDmKUCkRjpwVVIJ4IMaOiQBUawECn5GD8ADHbn00GRVmjExI');

// Payment Form Component
const PaymentForm = ({ onPaymentSuccess, totalPrice, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      await onPaymentSuccess(paymentMethod.id);
    } catch (err) {
      setError('An unexpected error occurred.');
      setProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <h3>Payment Details</h3>
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true
            }}
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="payment-buttons">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!stripe || processing}
          >
            {processing ? 'Processing...' : `Pay $${totalPrice}`}
          </button>
        </div>
      </form>
    </div>
  );
};

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    fullName: '',
    email: '',
    phone: '',
    specialRequests: '',
    payment: 'card'
  });
  const [bookingSummary, setBookingSummary] = useState({
    nights: 0,
    basePrice: 0,
    taxAmount: 0,
    totalPrice: 0
  });
  const [showPayment, setShowPayment] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-room.jpg';
    try {
      if (imagePath.startsWith('http')) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, '');
      return cleanPath.includes('uploads') 
        ? `http://localhost:8080/${cleanPath}`
        : `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error('Error formatting image URL:', error);
      return '/images/placeholder-room.jpg';
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { state: { from: `/rooms/${id}` } });
      return;
    }

    const fetchUserAndRoomDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch room details
        const roomResponse = await axios.get('http://localhost:8080/api/rooms', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch user profile data to pre-fill the form
        const userResponse = await axios.get('http://localhost:8080/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(error => {
          console.warn('Could not fetch user profile:', error);
          return { data: {} }; // Return empty data if profile fetch fails
        });

        // Update form with user data if available
        if (userResponse.data) {
          setFormData(prev => ({
            ...prev,
            fullName: userResponse.data.name || '',
            email: userResponse.data.email || '',
            phone: userResponse.data.phone || ''
          }));
        }

        if (roomResponse.data) {
          const roomData = roomResponse.data.find(room => room._id === id);
          if (roomData) {
            setRoom(roomData);
            updateBookingSummary(roomData.price, formData.checkInDate, formData.checkOutDate);
          } else {
            throw new Error('Room not found');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login", { state: { from: `/rooms/${id}` } });
          return;
        }
        setError(err.response?.data?.message || err.message || 'Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndRoomDetails();
  }, [id, navigate]);

  const updateBookingSummary = (roomPrice, checkIn, checkOut) => {
    if (!roomPrice || !checkIn || !checkOut) {
      setBookingSummary({
        nights: 0,
        basePrice: 0,
        taxAmount: 0,
        totalPrice: 0
      });
      return;
    }

    const nights = calculateNights(checkIn, checkOut);
    const basePrice = roomPrice * nights;
    const taxRate = 0.1; // 10% tax
    const taxAmount = basePrice * taxRate;
    const totalPrice = basePrice + taxAmount;

    setBookingSummary({
      nights,
      basePrice,
      taxAmount,
      totalPrice
    });
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update booking summary when dates change
    if (name === 'checkInDate' || name === 'checkOutDate') {
      updateBookingSummary(
        room?.price,
        name === 'checkInDate' ? value : formData.checkInDate,
        name === 'checkOutDate' ? value : formData.checkOutDate
      );
    }
  };

  const validateBooking = () => {
    const errors = [];

    // Check dates
    if (!formData.checkInDate || !formData.checkOutDate) {
      errors.push('Please select both check-in and check-out dates');
    } else {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        errors.push('Check-in date cannot be in the past');
      }

      if (checkOut <= checkIn) {
        errors.push('Check-out date must be after check-in date');
      }

      // Check if booking is within reasonable range (e.g., max 30 days)
      const daysDiff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      if (daysDiff > 30) {
        errors.push('Booking duration cannot exceed 30 days');
      }
    }

    // Validate guests
    if (!formData.guests || formData.guests < 1) {
      errors.push('Number of guests must be at least 1');
    } else if (room && formData.guests > room.maxGuests) {
      errors.push(`Maximum ${room.maxGuests} guests allowed for this room`);
    }

    // Validate personal information
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      errors.push('Please enter a valid full name (minimum 2 characters)');
    }

    if (!formData.email) {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
      }
    }

    if (!formData.phone) {
      errors.push('Phone number is required');
    } else {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        errors.push('Please enter a valid phone number (minimum 10 digits)');
      }
    }

    // Validate payment method
    if (!formData.payment || !['card', 'paypal'].includes(formData.payment)) {
      errors.push('Please select a valid payment method');
    }

    // Special requests length check (optional field)
    if (formData.specialRequests && formData.specialRequests.length > 500) {
      errors.push('Special requests cannot exceed 500 characters');
    }

    // Display all errors if any
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }

    return true;
  };

  const handlePaymentSuccess = async (paymentMethodId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error('Please log in to continue with your booking');
        navigate("/login", { state: { from: `/rooms/${id}` } });
        return;
      }

      const bookingData = {
        roomId: id,
        roomType: room.roomType,
        roomNumber: room.roomNumber,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guests: parseInt(formData.guests),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        specialRequests: formData.specialRequests.trim(),
        payment: 'card',
        paymentMethodId: paymentMethodId,
        totalPrice: bookingSummary.totalPrice,
        basePrice: bookingSummary.basePrice,
        taxAmount: bookingSummary.taxAmount,
        numberOfNights: bookingSummary.nights
      };

      const response = await axios.post('http://localhost:8080/api/bookings', bookingData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data) {
        toast.success('Booking created successfully!');
        navigate('/booking-confirmation', { 
          state: { 
            booking: {
              ...response.data,
              roomType: room.roomType,
              roomNumber: room.roomNumber,
              checkInDate: formData.checkInDate,
              checkOutDate: formData.checkOutDate,
              totalPrice: bookingSummary.totalPrice.toFixed(2),
              basePrice: bookingSummary.basePrice.toFixed(2),
              taxAmount: bookingSummary.taxAmount.toFixed(2),
              numberOfNights: bookingSummary.nights,
              fullName: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              guests: formData.guests,
              payment: 'card',
              specialRequests: formData.specialRequests.trim()
            }
          }
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="booking-page">
          <div className="container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading room details...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="booking-page">
          <div className="container">
            <div className="error-message">{error}</div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (showPayment) {
    return (
      <PageLayout>
        <div className="booking-page">
          <div className="container">
            <Elements stripe={stripePromise}>
              <PaymentForm 
                onPaymentSuccess={handlePaymentSuccess}
                totalPrice={bookingSummary.totalPrice.toFixed(2)}
                onCancel={() => setShowPayment(false)}
              />
            </Elements>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="booking-page">
        <div className="container">
          <div className="booking-container">
            {/* Room Details Card - Made more compact */}
            <div className="room-details-card">
              <div className="room-image-container" style={{ maxHeight: '300px' }}>
                <img
                  src={getImageUrl(room?.image)}
                  alt={room?.roomType}
                  className="room-image"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-room.jpg';
                    e.target.onerror = null;
                  }}
                />
                <div className="price-badge">
                  ${room?.price}<small>/night</small>
                </div>
              </div>
              
              <div className="room-info">
                <h1 className="room-title">{room?.roomType}</h1>
                <div className="room-rating">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="star-icon" />
                  ))}
                </div>
                <p className="room-description">{room?.description}</p>
              </div>
            </div>

            {/* Booking Form Card - Made more compact */}
            <div className="booking-form-card">
              <h2>Book Your Stay</h2>
              <form>
                <div className="form-grid">
                  <div className="form-group">
                    <label><FiCalendar /> Check-in Date *</label>
                    <input
                      type="date"
                      name="checkInDate"
                      value={formData.checkInDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FiCalendar /> Check-out Date *</label>
                    <input
                      type="date"
                      name="checkOutDate"
                      value={formData.checkOutDate}
                      onChange={handleChange}
                      min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FiUser /> Number of Guests *</label>
                    <input
                      type="number"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      min="1"
                      max={room?.maxGuests || 4}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FiUser /> Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FiMail /> Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label><FiPhone /> Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    name="payment"
                    value={formData.payment}
                    onChange={handleChange}
                    required
                  >
                    <option value="card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleChange}
                    placeholder="Any special requests or requirements?"
                    rows="2"
                  />
                </div>

                <div className="booking-summary">
                  <h3>Booking Summary</h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span>Room Type:</span>
                      <span>{room?.roomType}</span>
                    </div>
                    <div className="summary-item">
                      <span>Price per Night:</span>
                      <span>${room?.price}</span>
                    </div>
                    <div className="summary-item">
                      <span>Number of Nights:</span>
                      <span>{bookingSummary.nights}</span>
                    </div>
                    <div className="summary-item">
                      <span>Base Price:</span>
                      <span>${bookingSummary.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Tax (10%):</span>
                      <span>${bookingSummary.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="summary-item total">
                      <span>Total Price:</span>
                      <span>${bookingSummary.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="book-button"
                  onClick={() => {
                    if (validateBooking()) {
                      setShowPayment(true);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCreditCard /> Proceed to Payment
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BookingPage;
