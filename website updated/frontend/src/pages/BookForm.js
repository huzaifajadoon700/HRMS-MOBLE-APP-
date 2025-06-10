import React, { useState, useEffect } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const BookForm = ({ room, onClose, refreshBookings }) => {
  const [bookingDetails, setBookingDetails] = useState({
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
    payment: "card",
  });
  const [availability, setAvailability] = useState({
    isChecking: false,
    isAvailable: true,
    message: ""
  });

  const checkRoomAvailability = async (checkIn, checkOut) => {
    if (!checkIn || !checkOut || !room?._id) return;
    
    try {
      setAvailability({ ...availability, isChecking: true });
      
      const response = await axios.get(`http://localhost:8080/api/rooms/availability`, {
        params: {
          checkInDate: checkIn,
          checkOutDate: checkOut
        }
      });
      
      const roomAvailability = response.data.find(r => r.room._id === room._id);
      
      if (roomAvailability && !roomAvailability.isAvailable) {
        setAvailability({
          isChecking: false,
          isAvailable: false,
          message: "This room is already booked for the selected dates. Please choose different dates or select another room."
        });
        return false;
      } else {
        setAvailability({
          isChecking: false,
          isAvailable: true,
          message: "Room is available for the selected dates!"
        });
        return true;
      }
    } catch (error) {
      console.error("Error checking room availability:", error);
      setAvailability({
        isChecking: false,
        isAvailable: true,
        message: ""
      });
      return true; // Default to available if check fails
    }
  };

  // Check availability when dates change
  useEffect(() => {
    const { checkInDate, checkOutDate } = bookingDetails;
    if (checkInDate && checkOutDate) {
      checkRoomAvailability(checkInDate, checkOutDate);
    }
  }, [bookingDetails.checkInDate, bookingDetails.checkOutDate]);

  const handleBookingSubmit = async () => {
    if (!room) return;

    // Validate dates
    const checkIn = new Date(bookingDetails.checkInDate);
    const checkOut = new Date(bookingDetails.checkOutDate);
    const today = new Date();
    
    // Reset time part for comparison
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      toast.warning("Check-in date cannot be in the past.");
      return;
    }
    
    if (checkOut <= checkIn) {
      toast.warning("Check-out date must be after check-in date.");
      return;
    }

    // Check availability one more time before submitting
    const isAvailable = await checkRoomAvailability(bookingDetails.checkInDate, bookingDetails.checkOutDate);
    if (!isAvailable) {
      toast.error("This room is not available for the selected dates.");
      return;
    }

    // Calculate total price
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    const totalPrice = nights * room.price;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to book a room");
        return;
      }

      const response = await axios.post(
        "http://localhost:8080/api/bookings",
        {
          roomId: room._id,
          roomType: room.roomType,
          roomNumber: room.roomNumber || "N/A",
          checkInDate: bookingDetails.checkInDate,
          checkOutDate: bookingDetails.checkOutDate,
          guests: bookingDetails.guests,
          payment: bookingDetails.payment,
          totalPrice: totalPrice,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Room booked successfully!");
      onClose();
      if (refreshBookings) refreshBookings();
    } catch (error) {
      console.error("Error booking room:", error);
      toast.error(error.response?.data?.message || "Failed to book room. Please try again.");
    }
  };

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Check-in Date</Form.Label>
        <Form.Control
          type="date"
          value={bookingDetails.checkInDate}
          onChange={(e) => setBookingDetails({ ...bookingDetails, checkInDate: e.target.value })}
          min={new Date().toISOString().split('T')[0]}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Check-out Date</Form.Label>
        <Form.Control
          type="date"
          value={bookingDetails.checkOutDate}
          onChange={(e) => setBookingDetails({ ...bookingDetails, checkOutDate: e.target.value })}
          min={bookingDetails.checkInDate || new Date().toISOString().split('T')[0]}
        />
      </Form.Group>

      {/* Availability message */}
      {bookingDetails.checkInDate && bookingDetails.checkOutDate && (
        <>
          {availability.isChecking ? (
            <Alert variant="info">Checking availability...</Alert>
          ) : (
            <Alert variant={availability.isAvailable ? "success" : "danger"}>
              {availability.message}
            </Alert>
          )}
        </>
      )}

      <Form.Group className="mb-3">
        <Form.Label>Number of Guests</Form.Label>
        <Form.Control
          type="number"
          min="1"
          max={room.capacity || 4}
          value={bookingDetails.guests}
          onChange={(e) => setBookingDetails({ ...bookingDetails, guests: parseInt(e.target.value) })}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Payment Method</Form.Label>
        <Form.Select
          value={bookingDetails.payment}
          onChange={(e) => setBookingDetails({ ...bookingDetails, payment: e.target.value })}
        >
          <option value="card">Credit Card</option>
          <option value="paypal">PayPal</option>
        </Form.Select>
      </Form.Group>

      <div className="d-flex justify-content-between align-items-center">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleBookingSubmit}
          disabled={!availability.isAvailable || availability.isChecking}
        >
          Confirm Booking
        </Button>
      </div>
    </Form>
  );
};

export default BookForm;
