const Room = require('../Models/Room');
const Booking = require('../Models/Booking');

// Add a new room
exports.addRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, price, status, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newRoom = new Room({
      roomNumber,
      roomType,
      price,
      status: status || 'Available',
      description,
      image,
    });

    await newRoom.save();
    res.status(201).json({
      message: 'Room added successfully!',
      room: newRoom,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json(room);
  } catch (error) {
    console.error("Error getting room by ID:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid room ID format" });
    }
    res.status(500).json({ error: error.message });
  }
};

// Check room availability for specific dates
exports.checkRoomAvailability = async (req, res) => {
  try {
    const { checkInDate, checkOutDate, excludeBookingId } = req.query;
    
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ error: "Check-in and check-out dates are required" });
    }

    // Get all rooms
    const rooms = await Room.find();
    
    // Check bookings for each room
    const availabilityResults = await Promise.all(
      rooms.map(async (room) => {
        // Create the base query
        let bookingQuery = {
          roomId: room._id,
          $or: [
            // Check if the requested check-in date falls within an existing booking
            { 
              checkInDate: { $lte: checkInDate },
              checkOutDate: { $gte: checkInDate }
            },
            // Check if the requested check-out date falls within an existing booking
            { 
              checkInDate: { $lte: checkOutDate },
              checkOutDate: { $gte: checkOutDate }
            },
            // Check if the requested booking completely encompasses an existing booking
            { 
              checkInDate: { $gte: checkInDate },
              checkOutDate: { $lte: checkOutDate }
            }
          ]
        };
        
        // If we're excluding a booking (for editing purposes), add that to the query
        if (excludeBookingId) {
          bookingQuery._id = { $ne: excludeBookingId };
        }
        
        const bookings = await Booking.find(bookingQuery);
        
        const isAvailable = bookings.length === 0;
        
        return {
          room: {
            _id: room._id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            price: room.price,
            description: room.description,
            image: room.image
          },
          isAvailable,
          status: isAvailable ? 'Available' : 'Booked',
          bookings: isAvailable ? [] : bookings.map(b => ({
            checkInDate: b.checkInDate,
            checkOutDate: b.checkOutDate
          }))
        };
      })
    );
    
    res.status(200).json(availabilityResults);
  } catch (error) {
    console.error("Error checking room availability:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a room
exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, roomType, price, status, description } = req.body;
    const updateData = {
      roomNumber,
      roomType,
      price,
      status,
      description,
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a room
exports.deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 