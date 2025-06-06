import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiCalendar, FiUsers, FiHome, FiDollarSign, FiCreditCard } from "react-icons/fi";
import "./EditBooking.css";

const EditBooking = ({ bookingId, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [room, setRoom] = useState(null);
  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    payment: "card"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState({
    isChecking: false,
    isAvailable: true,
    message: ""
  });
  const [bookingSummary, setBookingSummary] = useState({
    nights: 0,
    basePrice: 0,
    taxAmount: 0,
    totalPrice: 0
  });

  useEffect(() => {
    const fetchBooking = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        
        console.log("Fetching booking with ID:", bookingId);
        
        const response = await axios.get(`http://localhost:8080/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const bookingData = response.data;
        console.log("Booking data received:", bookingData);
        
        setBooking(bookingData);
        setFormData({
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          guests: bookingData.guests,
          payment: bookingData.payment
        });

        // Fetch room details
        console.log("Fetching room details for roomId:", bookingData.roomId);
        const roomResponse = await axios.get(`http://localhost:8080/api/rooms/${bookingData.roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setRoom(roomResponse.data);
        updateBookingSummary(roomResponse.data.price, bookingData.checkInDate, bookingData.checkOutDate);
      } catch (error) {
        console.error("Error fetching booking:", error);
        let errorMessage = "Failed to load booking details. Please try again later.";
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Response error:", error.response.data);
          console.error("Status code:", error.response.status);
          
          if (error.response.status === 404) {
            errorMessage = "Booking not found. It may have been deleted or the ID is incorrect.";
          } else if (error.response.status === 403) {
            errorMessage = "You don't have permission to access this booking.";
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error("Request error - no response received");
          errorMessage = "Server is not responding. Please check your connection and try again.";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, navigate]);

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'checkInDate' || name === 'checkOutDate') {
      if (formData.checkInDate && formData.checkOutDate && room?.price) {
        updateBookingSummary(room.price, 
          name === 'checkInDate' ? value : formData.checkInDate, 
          name === 'checkOutDate' ? value : formData.checkOutDate);
        checkRoomAvailability();
      }
    }
  };

  const checkRoomAvailability = async () => {
    if (!booking || !room || !formData.checkInDate || !formData.checkOutDate) {
      return;
    }

    try {
      setAvailability({ ...availability, isChecking: true });
      
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/api/rooms/availability`, {
        params: {
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          excludeBookingId: bookingId // Exclude current booking from check
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const roomAvailability = response.data.find(r => r.room._id === booking.roomId);
      
      if (roomAvailability && !roomAvailability.isAvailable) {
        setAvailability({
          isChecking: false,
          isAvailable: false,
          message: "This room is already booked for the selected dates. Please choose different dates."
        });
      } else {
        setAvailability({
          isChecking: false,
          isAvailable: true,
          message: "Room is available for the selected dates!"
        });
      }
    } catch (error) {
      console.error("Error checking room availability:", error);
      setAvailability({
        isChecking: false,
        isAvailable: true,
        message: ""
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!booking || !room) return;

    // Validate dates
    const checkInDate = new Date(formData.checkInDate);
    const checkOutDate = new Date(formData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    if (checkInDate < today) {
      toast.error("Check-in date cannot be in the past");
      return;
    }
    
    if (checkOutDate <= checkInDate) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    // Check availability one more time before submitting
    await checkRoomAvailability();
    if (!availability.isAvailable) {
      toast.error(availability.message);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      const response = await axios.put(
        `http://localhost:8080/api/bookings/${bookingId}`,
        {
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          guests: parseInt(formData.guests),
          payment: formData.payment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success("Booking updated successfully!");
      if (onSuccess) {
        onSuccess(response.data.updatedBooking);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to update booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-booking-container">
        <div className="loading-spinner">Loading booking details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-booking-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!booking || !room) {
    return (
      <div className="edit-booking-container">
        <div className="error-message">Booking or room details not found</div>
      </div>
    );
  }

  return (
    <div className="edit-booking-container">
      <h2 className="edit-title">Edit Booking</h2>
      
      <div className="booking-summary">
        <h3>Current Booking Details</h3>
        <div className="summary-item">
          <span>Room:</span>
          <span>{booking.roomType} (Room {booking.roomNumber})</span>
        </div>
        <div className="summary-item">
          <span>Check-in:</span>
          <span>{new Date(booking.checkInDate).toLocaleDateString()}</span>
        </div>
        <div className="summary-item">
          <span>Check-out:</span>
          <span>{new Date(booking.checkOutDate).toLocaleDateString()}</span>
        </div>
        <div className="summary-item">
          <span>Guests:</span>
          <span>{booking.guests}</span>
        </div>
        <div className="summary-item">
          <span>Total Price:</span>
          <span>${booking.totalPrice}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="checkInDate">
            <FiCalendar className="icon" /> Check-in Date
          </label>
          <input
            type="date"
            id="checkInDate"
            name="checkInDate"
            value={formData.checkInDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="checkOutDate">
            <FiCalendar className="icon" /> Check-out Date
          </label>
          <input
            type="date"
            id="checkOutDate"
            name="checkOutDate"
            value={formData.checkOutDate}
            onChange={handleChange}
            min={formData.checkInDate || new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="guests">
            <FiUsers className="icon" /> Number of Guests
          </label>
          <input
            type="number"
            id="guests"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            min="1"
            max={room.capacity || 4}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="payment">
            <FiCreditCard className="icon" /> Payment Method
          </label>
          <select
            id="payment"
            name="payment"
            value={formData.payment}
            onChange={handleChange}
            required
          >
            <option value="card">Credit Card</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
        
        {/* Availability message */}
        {formData.checkInDate && formData.checkOutDate && (
          <div className={`availability-message ${availability.isAvailable ? 'available' : 'unavailable'}`}>
            {availability.isChecking ? (
              <span>Checking availability...</span>
            ) : (
              <span>{availability.message}</span>
            )}
          </div>
        )}
        
        {/* Updated Price Summary */}
        {bookingSummary.nights > 0 && (
          <div className="updated-price-summary">
            <h3>Updated Price Summary</h3>
            <div className="summary-item">
              <span>Room Rate:</span>
              <span>${room.price} per night</span>
            </div>
            <div className="summary-item">
              <span>Nights:</span>
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
        )}
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-button"
            disabled={loading || !availability.isAvailable || availability.isChecking}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBooking; 