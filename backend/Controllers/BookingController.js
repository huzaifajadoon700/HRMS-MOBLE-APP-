const Booking = require("../Models/Booking");
const Room = require("../Models/Room");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { roomId, roomType, roomNumber, checkInDate, checkOutDate, guests, payment, totalPrice, fullName, email, phone, specialRequests, paymentMethodId } = req.body;
    const userId = req.user._id;

    if (!roomId || !checkInDate || !checkOutDate || !guests || !payment || !totalPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the room is already booked for the requested dates
    const overlappingBooking = await Booking.findOne({
      roomId,
      $or: [
        { 
          checkInDate: { $lte: checkInDate },
          checkOutDate: { $gte: checkInDate }
        },
        { 
          checkInDate: { $lte: checkOutDate },
          checkOutDate: { $gte: checkOutDate }
        },
        { 
          checkInDate: { $gte: checkInDate },
          checkOutDate: { $lte: checkOutDate }
        }
      ]
    });

    if (overlappingBooking) {
      return res.status(400).json({ 
        error: "Room is already booked for the selected dates",
        message: "This room is not available for the selected dates. Please choose different dates or select another room."
      });
    }

    // Process payment with Stripe
    let paymentIntent;
    if (payment === 'card' && paymentMethodId) {
      try {
        // First create the payment intent
        paymentIntent = await stripe.paymentIntents.create({
          amount: totalPrice * 100, // Convert to cents
          currency: 'usd',
          payment_method_types: ['card'],
          metadata: {
            roomId,
            roomNumber,
            checkInDate,
            checkOutDate,
            guests
          }
        });

        // Then confirm the payment intent with the payment method
        paymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: paymentMethodId
        });

        if (paymentIntent.status !== 'succeeded') {
          throw new Error('Payment failed: ' + paymentIntent.status);
        }
      } catch (error) {
        console.error('Stripe payment error:', error);
        return res.status(400).json({ 
          error: 'Payment failed',
          message: error.message 
        });
      }
    }

    const booking = new Booking({
      roomId,
      roomType,
      roomNumber,
      checkInDate,
      checkOutDate,
      guests,
      payment,
      totalPrice,
      userId,
      fullName,
      email,
      phone,
      specialRequests,
      paymentIntentId: paymentIntent?.id,
      paymentStatus: paymentIntent?.status || 'pending'
    });

    await booking.save();
    
    // Update room status to 'Booked'
    await Room.findByIdAndUpdate(roomId, { status: 'Booked' });
    
    res.status(201).json({ 
      message: "Booking confirmed", 
      booking,
      paymentIntent: paymentIntent
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ error: error.message });
  }
};

// Fetch all bookings for the logged-in user
exports.getBookingsByUser = async (req, res) => {
  try {
    const userId = req.user._id; // Get the user ID from the authenticated request
    const bookings = await Booking.find({ userId }).populate("roomId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Error fetching bookings" });
  }
};

// Fetch all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("roomId");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Error fetching bookings" });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id; // Get the user ID from the authenticated request
    const isAdmin = req.user.isAdmin || req.user.role === 'admin'; // Check if user is admin

    // Ensure the booking belongs to the logged-in user
    const booking = await Booking.findOne({ _id: bookingId, userId });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found or unauthorized" });
    }

    // Check if check-in date is in the past
    const checkInDate = new Date(booking.checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today

    if (checkInDate < today && !isAdmin) {
      return res.status(400).json({ 
        error: "Cannot modify past booking",
        message: "Bookings for past dates cannot be modified"
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        checkInDate: req.body.checkInDate,
        checkOutDate: req.body.checkOutDate,
        guests: req.body.guests,
        payment: req.body.payment,
      },
      { new: true } // Return the updated booking
    );

    res.status(200).json({ message: "Booking updated", updatedBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Error updating booking" });
  }
};

// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id; // Get the user ID from the authenticated request
    const isAdmin = req.user.isAdmin || req.user.role === 'admin'; // Check if user is admin
    
    console.log("Attempting to delete booking with ID:", bookingId);

    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    // First check if booking exists
    const existingBooking = await Booking.findById(bookingId);
    if (!existingBooking) {
      console.log("Booking not found with ID:", bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if check-in date is in the past
    const checkInDate = new Date(existingBooking.checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today

    if (checkInDate < today && !isAdmin) {
      return res.status(400).json({ 
        error: "Cannot cancel past booking",
        message: "Bookings for past dates cannot be canceled"
      });
    }

    // Check if user owns this booking or is an admin
    if (!isAdmin && existingBooking.userId.toString() !== userId.toString()) {
      console.log("User not authorized to delete this booking");
      return res.status(403).json({ message: "You are not authorized to delete this booking" });
    }

    // Get the roomId before deleting the booking
    const roomId = existingBooking.roomId;

    // Attempt to delete the booking
    const result = await Booking.deleteOne({ _id: bookingId });
    console.log("Delete operation result:", result);

    if (result.deletedCount === 0) {
      console.log("No booking was deleted");
      return res.status(404).json({ message: "Failed to delete booking" });
    }

    // Check if there are any other active bookings for this room
    const otherActiveBookings = await Booking.findOne({ 
      roomId,
      // Active bookings have checkout date in the future
      checkOutDate: { $gte: new Date().toISOString().split('T')[0] }
    });

    // If no other active bookings, update room status to 'Available'
    if (!otherActiveBookings) {
      await Room.findByIdAndUpdate(roomId, { status: 'Available' });
    }

    console.log("Successfully deleted booking with ID:", bookingId);
    res.status(200).json({ 
      success: true,
      message: "Booking deleted successfully",
      deletedBooking: existingBooking
    });

  } catch (error) {
    console.error("Error in deleteBooking:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ 
        success: false,
        message: "Invalid booking ID format" 
      });
    }
    res.status(500).json({ 
      success: false,
      message: "Error deleting booking",
      error: error.message 
    });
  }
};

// Get a booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.isAdmin || req.user.role === 'admin';
    
    console.log("Fetching booking with ID:", bookingId);
    console.log("User making request:", userId);
    
    // Find the booking by ID
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      console.log("Booking not found with ID:", bookingId);
      return res.status(404).json({ error: "Booking not found" });
    }
    
    console.log("Found booking:", booking);
    
    // Check if the booking belongs to the user or the user is an admin
    if (!isAdmin && booking.userId.toString() !== userId.toString()) {
      console.log("User not authorized to access this booking");
      console.log("Booking user ID:", booking.userId);
      console.log("Current user ID:", userId);
      return res.status(403).json({ error: "You don't have permission to access this booking" });
    }
    
    res.status(200).json(booking);
  } catch (error) {
    console.error("Error getting booking by ID:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid booking ID format" });
    }
    res.status(500).json({ error: "Error retrieving booking" });
  }
};