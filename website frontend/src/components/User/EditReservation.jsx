import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiCalendar, FiUsers, FiClock, FiDollarSign } from "react-icons/fi";
import "./EditReservation.css";

const EditReservation = ({ reservationId, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [formData, setFormData] = useState({
    reservationDate: "",
    time: "",
    endTime: "",
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

  useEffect(() => {
    const fetchReservation = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        
        console.log("Fetching reservation with ID:", reservationId);
        
        const response = await axios.get(`http://localhost:8080/api/reservations/${reservationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Parse the reservation data properly
        const reservationData = response.data.reservation || response.data;
        console.log("Reservation data received:", reservationData);

        if (!reservationData) {
          throw new Error("Invalid reservation data format");
        }
        
        setReservation(reservationData);

        // Format dates properly for form inputs
        const formattedDate = reservationData.reservationDate ? 
          new Date(reservationData.reservationDate).toISOString().split('T')[0] : 
          "";
            
        setFormData({
          reservationDate: formattedDate,
          time: reservationData.time || "",
          endTime: reservationData.endTime || calculateDefaultEndTime(reservationData.time),
          guests: reservationData.guests || 1,
          payment: reservationData.payment || "card"
        });
        
        console.log("Formatted form data:", {
          reservationDate: formattedDate,
          time: reservationData.time,
          endTime: reservationData.endTime || calculateDefaultEndTime(reservationData.time),
          guests: reservationData.guests,
          payment: reservationData.payment
        });
      } catch (error) {
        console.error("Error fetching reservation:", error);
        let errorMessage = "Failed to load reservation details. Please try again later.";
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Response error:", error.response.data);
          console.error("Status code:", error.response.status);
          
          if (error.response.status === 404) {
            errorMessage = "Reservation not found. It may have been deleted or the ID is incorrect.";
          } else if (error.response.status === 403) {
            errorMessage = "You don't have permission to access this reservation.";
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

    if (reservationId) {
      fetchReservation();
    }
  }, [reservationId, navigate]);

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

    if (name === 'reservationDate' || name === 'time' || name === 'endTime') {
      if (formData.reservationDate && formData.time && formData.endTime && reservation?.tableId) {
        checkTableAvailability();
      }
    }
  };

  const checkTableAvailability = async () => {
    if (!reservation || !formData.reservationDate || !formData.time || !formData.endTime) {
      return;
    }

    try {
      setAvailability({ ...availability, isChecking: true });
      
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/api/tables/availability`, {
        params: {
          reservationDate: formData.reservationDate,
          time: formData.time,
          endTime: formData.endTime,
          excludeReservationId: reservationId // Exclude current reservation from check
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const tableAvailability = response.data.find(t => t.table._id === reservation.tableId);
      
      if (tableAvailability && !tableAvailability.isAvailable) {
        setAvailability({
          isChecking: false,
          isAvailable: false,
          message: "This table is already reserved during the selected time range. Please choose a different time."
        });
      } else {
        setAvailability({
          isChecking: false,
          isAvailable: true,
          message: "Table is available for the selected time!"
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reservation) return;

    // Validate dates and times
    const reservationDate = new Date(formData.reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    if (reservationDate < today) {
      toast.error("Reservation date cannot be in the past");
      return;
    }
    
    if (formData.time >= formData.endTime) {
      toast.error("End time must be after start time");
      return;
    }

    // Check availability one more time before submitting
    await checkTableAvailability();
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
        `http://localhost:8080/api/reservations/${reservationId}`,
        {
          reservationDate: formData.reservationDate,
          time: formData.time,
          endTime: formData.endTime,
          guests: parseInt(formData.guests),
          payment: formData.payment
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success("Reservation updated successfully!");
      if (onSuccess) {
        onSuccess(response.data.updatedReservation);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to update reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Not specified";
    
    try {
      // If time is already in 12-hour format, return it
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
      }
      
      // Handle 24-hour format (HH:MM)
      const [hours, minutes] = timeString.split(':');
      if (!hours || !minutes) {
        return timeString;
      }
      
      // Create a date object with today's date and the specified time
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      
      // Format the time in 12-hour format
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="edit-reservation-container">
        <div className="loading-spinner">Loading reservation details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-reservation-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="edit-reservation-container">
        <div className="error-message">Reservation not found</div>
      </div>
    );
  }

  return (
    <div className="edit-reservation-container">
      <h2 className="edit-title">Edit Reservation</h2>
      
      <div className="reservation-summary">
        <h3>Current Reservation Details</h3>
        <div className="summary-item">
          <span>Table:</span>
          <span>Table {reservation.tableNumber}</span>
        </div>
        <div className="summary-item">
          <span>Date:</span>
          <span>{formatDate(reservation.reservationDate)}</span>
        </div>
        <div className="summary-item">
          <span>Time:</span>
          <span>{formatTime(reservation.time)} - {formatTime(reservation.endTime)}</span>
        </div>
        <div className="summary-item">
          <span>Guests:</span>
          <span>{reservation.guests}</span>
        </div>
        <div className="summary-item">
          <span>Name:</span>
          <span>{reservation.fullName || 'Not provided'}</span>
        </div>
        <div className="summary-item">
          <span>Email:</span>
          <span>{reservation.email || 'Not provided'}</span>
        </div>
        <div className="summary-item">
          <span>Phone:</span>
          <span>{reservation.phone || 'Not provided'}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="reservationDate">
            <FiCalendar className="icon" /> Date
          </label>
          <input
            type="date"
            id="reservationDate"
            name="reservationDate"
            value={formData.reservationDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="time">
            <FiClock className="icon" /> Start Time
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="endTime">
            <FiClock className="icon" /> End Time
          </label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
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
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="payment">
            <FiDollarSign className="icon" /> Payment Method
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
        {formData.reservationDate && formData.time && formData.endTime && (
          <div className={`availability-message ${availability.isAvailable ? 'available' : 'unavailable'}`}>
            {availability.isChecking ? (
              <span>Checking availability...</span>
            ) : (
              <span>{availability.message}</span>
            )}
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

export default EditReservation; 