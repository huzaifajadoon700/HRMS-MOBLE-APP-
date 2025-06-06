import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiUser, FiMail, FiPhone, FiClock, FiStar, FiCreditCard } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import PageLayout from '../components/layout/PageLayout';
import Heading from '../components/common/Heading';
import './TableReservationPage.css';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RQDO0QHBrXA72xgYssbECOe9bubZ2bWHA4m0T6EY6AvvmAfCzIDmKUCkRjpwVVIJ4IMaOiQBUawECn5GD8ADHbn00GRVmjExI');

// Payment Form Component
const PaymentForm = ({ onPaymentSuccess, totalPrice }) => {
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
        billing_details: {
          // Add any billing details if needed
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Call the success handler with the payment method ID
      onPaymentSuccess(paymentMethod.id);
    } catch (err) {
      setError('An unexpected error occurred.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-group">
        <label className="form-label">
          <FiCreditCard className="me-2" />
          Card Details
        </label>
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
      <button
        type="submit"
        className="btn btn-accent w-100 mt-3"
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : `Pay $${totalPrice}`}
      </button>
    </form>
  );
};

const TableReservationPage = () => {
  const navigate = useNavigate();
  const [tableDetails, setTableDetails] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    endTime: '',
    guests: 2,
    fullName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [availability, setAvailability] = useState({
    isChecking: false,
    isAvailable: true,
    message: ""
  });
  const [paymentMethodId, setPaymentMethodId] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-table.jpg";
    try {
      if (imagePath.startsWith("http")) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, "");
      return cleanPath.includes("uploads")
        ? `http://localhost:8080/${cleanPath}`
        : `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error("Error formatting image URL:", error);
      return "/images/placeholder-table.jpg";
    }
  };

  useEffect(() => {
    const storedDetails = localStorage.getItem('reservationDetails');
    if (!storedDetails) {
      toast.error('No table selected. Please select a table first.');
      navigate('/reserve-table');
      return;
    }

    const details = JSON.parse(storedDetails);
    setTableDetails(details);
    
    // Get user details from localStorage
    const userFullName = localStorage.getItem("name") || "";
    const userEmail = localStorage.getItem("email") || "";
    const userPhone = localStorage.getItem("phone") || "";
    
    console.log("User data from localStorage:", {
      name: userFullName,
      email: userEmail,
      phone: userPhone
    });

    setFormData(prev => ({
      ...prev,
      date: details.date,
      time: details.time,
      endTime: details.time ? calculateDefaultEndTime(details.time) : '',
      guests: details.guests,
      fullName: userFullName,
      email: userEmail,
      phone: userPhone
    }));
  }, [navigate]);

  const calculateDefaultEndTime = (startTime) => {
    try {
      if (startTime.includes(':')) {
        const [hours, minutes] = startTime.split(':').map(Number);
        let newHours = hours + 2;
        
        if (newHours >= 24) {
          newHours -= 24;
        }
        
        return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      return startTime;
    } catch (error) {
      console.error("Error calculating default end time:", error);
      return startTime;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'time') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        endTime: calculateDefaultEndTime(value)
      }));
    } else {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    }

    if (name === 'date' || name === 'time' || name === 'endTime') {
      if (formData.date && formData.time && formData.endTime && tableDetails?.tableId) {
        checkTableAvailability();
      }
    }
  };

  const checkTableAvailability = async () => {
    try {
      if (!formData.date || !formData.time || !formData.endTime || !tableDetails?.tableId) return;
      
      setAvailability({ ...availability, isChecking: true });
      
      const response = await axios.get(`http://localhost:8080/api/tables/availability`, {
        params: {
          reservationDate: formData.date,
          time: formData.time,
          endTime: formData.endTime
        }
      });
      
      const tableAvailability = response.data.find(t => t.table._id === tableDetails.tableId);
      
      if (tableAvailability && !tableAvailability.isAvailable) {
        setAvailability({
          isChecking: false,
          isAvailable: false,
          message: "This table is already reserved during the selected time range. Please choose a different time or select another table."
        });
      } else {
        setAvailability({
          isChecking: false,
          isAvailable: true,
          message: "Table is available for reservation!"
        });
      }
    } catch (error) {
      console.error("Error checking table availability:", error);
      setAvailability({
        isChecking: false,
        isAvailable: true,
        message: ""
      });
    }
  };

  const handlePaymentSuccess = async (paymentMethodId) => {
    try {
      setPaymentMethodId(paymentMethodId);
      await handleSubmit(null, paymentMethodId);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    }
  };

  const handleSubmit = async (e, paymentMethodId) => {
    if (e) e.preventDefault();
    
    try {
      if (formData.time >= formData.endTime) {
        toast.error("End time must be after start time");
        return;
      }

      if (!availability.isAvailable) {
        toast.error("This table is not available for the selected time range.");
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to make a reservation');
        navigate('/login');
        return;
      }

      const totalPrice = tableDetails.tableCapacity * 10;

      // Save user contact information to localStorage for future use
      if (formData.fullName) localStorage.setItem('name', formData.fullName);
      if (formData.email) localStorage.setItem('email', formData.email);
      if (formData.phone) localStorage.setItem('phone', formData.phone);

      const reservationData = {
        tableId: tableDetails.tableId,
        tableNumber: tableDetails.tableName,
        reservationDate: formData.date,
        time: formData.time,
        endTime: formData.endTime,
        guests: parseInt(formData.guests),
        payment: "card",
        totalPrice: totalPrice,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        specialRequests: formData.specialRequests,
        paymentMethodId: paymentMethodId
      };

      console.log("Sending reservation data:", reservationData);

      const response = await axios.post('http://localhost:8080/api/reservations', reservationData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        toast.success('Table reservation created successfully!');
        localStorage.removeItem('reservationDetails');
        navigate('/table-confirmation', { state: { reservation: response.data.reservation } });
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error(error.response?.data?.message || 'Failed to create reservation');
    }
  };

  if (!tableDetails) {
    return null;
  }

  return (
    <PageLayout>
      <div className="reservation-page">
        <div className="container">
          <div className="row g-3">
            {/* Left side - Table Details */}
            <div className="col-lg-6">
              <div className="reservation-form h-100">
                <div className="table-image-container">
                  <img 
                    src={getImageUrl(tableDetails.tableImage)}
                    alt={tableDetails.tableName}
                    className="img-fluid rounded"
                    onError={(e) => {
                      e.target.src = "/images/placeholder-table.jpg";
                      e.target.onerror = null;
                    }}
                  />
                </div>
                <div className="table-details">
                  <h3 className="text-accent mb-2">{tableDetails.tableName}</h3>
                  <div className="d-flex align-items-center mb-2">
                    <div className="me-2">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="text-warning" size={14} />
                      ))}
                    </div>
                    <span className="text-light small">5.0 (120 reviews)</span>
                  </div>
                  <div className="table-features">
                    <div className="feature-item">
                      <span className="text-accent">•</span>
                      <span>Capacity: {tableDetails.tableCapacity} guests</span>
                    </div>
                    <div className="feature-item">
                      <span className="text-accent">•</span>
                      <span>Private dining experience</span>
                    </div>
                    <div className="feature-item">
                      <span className="text-accent">•</span>
                      <span>Premium table service</span>
                    </div>
                  </div>
                  <p className="text-light small mb-0">{tableDetails.tableDescription}</p>
                </div>
              </div>
            </div>

            {/* Right side - Reservation Form */}
            <div className="col-lg-6">
              <div className="reservation-form">
                <h2 className="text-accent text-center mb-3 h4">Make a Reservation</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setShowPaymentForm(true);
                }}>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small">
                        <FiCalendar className="me-1" />
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="form-control theme-input"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">
                        <FiClock className="me-1" />
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="form-control theme-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mt-2">
                    <div className="col-md-6">
                      <label className="form-label small">
                        <FiClock className="me-1" />
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleChange}
                        className="form-control theme-input"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small">
                        <FiUser className="me-1" />
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        className="form-control theme-input"
                        min="1"
                        max={tableDetails.tableCapacity}
                        required
                      />
                    </div>
                  </div>

                  {/* Availability message */}
                  {formData.date && formData.time && formData.endTime && (
                    <div className="row mt-2">
                      <div className="col-12">
                        {availability.isChecking ? (
                          <div className="alert alert-info">Checking availability...</div>
                        ) : (
                          <>
                            {!availability.isAvailable && (
                              <div className="alert alert-danger">{availability.message}</div>
                            )}
                            {availability.isAvailable && availability.message && (
                              <div className="alert alert-success">{availability.message}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="row g-2 mt-2">
                    <div className="col-md-6">
                      <label className="form-label small">
                        <FiUser className="me-1" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="form-control theme-input"
                        required
                      />
                  </div>

                    <div className="col-md-6">
                      <label className="form-label small">
                        <FiMail className="me-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-control theme-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mt-2">
                    <div className="col-md-12">
                      <label className="form-label small">
                        <FiPhone className="me-1" />
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-control theme-input"
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="form-label small">Special Requests</label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      className="form-control theme-input"
                      rows="2"
                    />
                  </div>

                  <div className="reservation-summary mt-3">
                    <h3 className="text-accent h5 mb-2">Reservation Summary</h3>
                    <div className="summary-item">
                      <span>Table:</span>
                      <span>{tableDetails.tableName}</span>
                    </div>
                    <div className="summary-item">
                      <span>Date:</span>
                      <span>{formData.date || 'Not selected'}</span>
                    </div>
                    <div className="summary-item">
                      <span>Time:</span>
                      <span>{formData.time || 'Not selected'}</span>
                    </div>
                    <div className="summary-item">
                      <span>Number of Guests:</span>
                      <span>{formData.guests}</span>
                    </div>
                    <div className="summary-item">
                      <span>Total Price:</span>
                      <span>${tableDetails.tableCapacity * 10}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-accent w-100"
                      disabled={!availability.isAvailable || availability.isChecking}
                    >
                      Proceed to Payment
                  </button>
                  </div>
                </form>

                {showPaymentForm && (
                  <div className="payment-section mt-4">
                    <h3 className="text-accent h5 mb-3">Payment Details</h3>
                    <Elements stripe={stripePromise}>
                      <PaymentForm 
                        onPaymentSuccess={handlePaymentSuccess}
                        totalPrice={tableDetails.tableCapacity * 10}
                      />
                    </Elements>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TableReservationPage; 