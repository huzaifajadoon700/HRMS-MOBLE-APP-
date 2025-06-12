const Room = require('../Models/Room');
const Booking = require('../Models/Booking');
const UserRoomInteraction = require('../Models/UserRoomInteraction');
const RoomRecommendation = require('../Models/RoomRecommendation');
const { spawn } = require('child_process');
const path = require('path');

// Add a new room
exports.addRoom = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      price,
      status,
      description,
      capacity,
      amenities,
      floor,
      size,
      bedType,
      smokingAllowed,
      petFriendly
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Parse amenities if it's a string
    let parsedAmenities = [];
    if (amenities) {
      try {
        parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
      } catch (e) {
        parsedAmenities = [];
      }
    }

    const newRoom = new Room({
      roomNumber,
      roomType,
      price: parseFloat(price),
      status: status || 'Available',
      description,
      image,
      capacity: parseInt(capacity),
      amenities: parsedAmenities,
      floor: floor ? parseInt(floor) : undefined,
      size: size ? parseFloat(size) : undefined,
      bedType: bedType || undefined,
      smokingAllowed: smokingAllowed === 'true' || smokingAllowed === true,
      petFriendly: petFriendly === 'true' || petFriendly === true
    });

    await newRoom.save();
    res.status(201).json({
      message: 'Room added successfully!',
      room: newRoom,
    });
  } catch (error) {
    console.error('Error adding room:', error);
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

    console.log('Checking room availability for:', { checkInDate, checkOutDate, excludeBookingId });

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
            // Case 1: New booking starts during an existing booking
            {
              checkInDate: { $lt: checkInDate },
              checkOutDate: { $gt: checkInDate }
            },
            // Case 2: New booking ends during an existing booking
            {
              checkInDate: { $lt: checkOutDate },
              checkOutDate: { $gt: checkOutDate }
            },
            // Case 3: New booking completely encompasses an existing booking
            {
              checkInDate: { $gte: checkInDate },
              checkOutDate: { $lte: checkOutDate }
            },
            // Case 4: Existing booking completely encompasses new booking
            {
              checkInDate: { $lte: checkInDate },
              checkOutDate: { $gte: checkOutDate }
            }
          ]
        };
        
        // If we're excluding a booking (for editing purposes), add that to the query
        if (excludeBookingId) {
          bookingQuery._id = { $ne: excludeBookingId };
        }
        
        const bookings = await Booking.find(bookingQuery);

        console.log(`Room ${room.roomNumber} (${room._id}): Found ${bookings.length} conflicting bookings`);
        if (bookings.length > 0) {
          console.log('Conflicting bookings:', bookings.map(b => ({
            checkIn: b.checkInDate,
            checkOut: b.checkOutDate
          })));
        }

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

// ========== ROOM RECOMMENDATION SYSTEM ==========

// Record user interaction with rooms (booking, rating, viewing)
exports.recordRoomInteraction = async (req, res) => {
  try {
    const { userId, roomId, interactionType, rating, bookingDuration, groupSize } = req.body;

    // Validate required fields
    if (!userId || !roomId || !interactionType) {
      return res.status(400).json({
        success: false,
        message: 'userId, roomId, and interactionType are required'
      });
    }

    // Create interaction record
    const interaction = new UserRoomInteraction({
      userId,
      roomId,
      interactionType,
      rating,
      bookingDuration,
      groupSize,
      timestamp: new Date()
    });

    await interaction.save();

    // Update room statistics if it's a rating
    if (interactionType === 'rating' && rating) {
      await exports.updateRoomRating(roomId, rating);
    }

    res.status(201).json({
      success: true,
      message: 'Room interaction recorded successfully',
      interaction
    });

  } catch (error) {
    console.error('Error recording room interaction:', error);
    res.status(500).json({
      success: false,
      message: 'Error recording room interaction',
      error: error.message
    });
  }
};

// Get personalized room recommendations
exports.getRoomRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { count = 10, checkInDate, checkOutDate, groupSize } = req.query;

    // Check for cached recommendations (1 hour cache)
    const cachedRecommendations = await RoomRecommendation.findOne({
      userId,
      generatedAt: { $gte: new Date(Date.now() - 3600000) }
    }).populate('recommendedRooms.roomId');

    if (cachedRecommendations) {
      // Enrich cached recommendations with room details
      const enrichedCachedRecs = await Promise.all(
        cachedRecommendations.recommendedRooms.map(async (rec) => {
          const room = await Room.findById(rec.roomId);
          return {
            ...rec.toObject(),
            roomDetails: room ? {
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              price: room.price,
              description: room.description,
              image: room.image,
              averageRating: room.averageRating,
              totalRatings: room.totalRatings
            } : null
          };
        })
      );

      return res.json({
        success: true,
        recommendations: enrichedCachedRecs,
        preferences: cachedRecommendations.userPreferences,
        cached: true,
        generatedAt: cachedRecommendations.generatedAt
      });
    }

    // Generate new recommendations
    const recommendations = await exports.generateRoomRecommendations(userId, {
      count: parseInt(count),
      checkInDate,
      checkOutDate,
      groupSize: groupSize ? parseInt(groupSize) : null
    });

    // Format recommendations to match model schema (for database storage)
    const formattedRooms = recommendations.rooms.map((room, index) => ({
      roomId: room.roomId,
      score: room.score || 3.5,
      reason: room.reason || 'hybrid',
      confidence: room.confidence || 'medium',
      rank: index + 1
    }));

    // Cache the recommendations
    const roomRecommendation = new RoomRecommendation({
      userId,
      recommendedRooms: formattedRooms,
      userPreferences: recommendations.preferences,
      generatedAt: new Date()
    });

    await roomRecommendation.save();

    // Enrich recommendations with room details for frontend (use original data)
    const enrichedRecommendations = formattedRooms.map((rec, index) => {
      const originalRoom = recommendations.rooms[index];
      return {
        ...rec,
        roomDetails: originalRoom.roomDetails || null
      };
    });

    res.json({
      success: true,
      recommendations: enrichedRecommendations,
      preferences: recommendations.preferences,
      cached: false
    });

  } catch (error) {
    console.error('Error getting room recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating room recommendations',
      error: error.message
    });
  }
};

// Generate room recommendations using hybrid approach
exports.generateRoomRecommendations = async (userId, options = {}) => {
  try {
    const { count = 10, checkInDate, checkOutDate, groupSize } = options;

    // Get user's room interaction history (last 30 days)
    const userInteractions = await UserRoomInteraction.find({
      userId,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).populate('roomId');

    if (userInteractions.length === 0) {
      // New user - return popularity-based recommendations
      const popularRooms = await exports.getPopularityBasedRoomRecommendations(count, { checkInDate, checkOutDate, groupSize });
      return {
        rooms: popularRooms,
        preferences: { newUser: true, totalInteractions: 0 }
      };
    }

    // Analyze user preferences
    const userPreferences = exports.analyzeUserRoomPreferences(userInteractions);

    // Generate collaborative filtering recommendations (60%)
    const collaborativeRecs = await exports.getCollaborativeRoomRecommendations(userId, userPreferences, Math.ceil(count * 0.6));

    // Generate content-based recommendations (30%)
    const contentRecs = await exports.getContentBasedRoomRecommendations(userPreferences, Math.ceil(count * 0.3), { checkInDate, checkOutDate, groupSize });

    // Add popular rooms (10%)
    const popularRecs = await exports.getPopularityBasedRoomRecommendations(Math.ceil(count * 0.1), { checkInDate, checkOutDate, groupSize });

    // Combine and deduplicate
    const allRecommendations = [...collaborativeRecs, ...contentRecs, ...popularRecs];
    const uniqueRecommendations = exports.deduplicateRoomRecommendations(allRecommendations);

    return {
      rooms: uniqueRecommendations.slice(0, count),
      preferences: userPreferences
    };

  } catch (error) {
    console.error('Error generating room recommendations:', error);
    // Fallback to popularity-based
    const popularRooms = await exports.getPopularityBasedRoomRecommendations(count, options);
    return {
      rooms: popularRooms,
      preferences: { fallback: true, error: error.message }
    };
  }
};

// Analyze user room preferences from interaction history
exports.analyzeUserRoomPreferences = (interactions) => {
  const preferences = {
    avgRating: 0,
    totalInteractions: interactions.length,
    preferredRoomTypes: {},
    preferredPriceRanges: {},
    avgGroupSize: 0,
    avgBookingDuration: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  };

  let totalRating = 0;
  let ratingCount = 0;
  let totalGroupSize = 0;
  let groupSizeCount = 0;
  let totalDuration = 0;
  let durationCount = 0;

  interactions.forEach(interaction => {
    if (interaction.rating) {
      totalRating += interaction.rating;
      ratingCount++;
      preferences.ratingDistribution[interaction.rating]++;
    }

    if (interaction.groupSize) {
      totalGroupSize += interaction.groupSize;
      groupSizeCount++;
    }

    if (interaction.bookingDuration) {
      totalDuration += interaction.bookingDuration;
      durationCount++;
    }

    if (interaction.roomId) {
      const room = interaction.roomId;

      // Count room type preferences
      if (room.roomType) {
        preferences.preferredRoomTypes[room.roomType] = (preferences.preferredRoomTypes[room.roomType] || 0) + 1;
      }

      // Count price range preferences
      if (room.price) {
        const priceRange = exports.getPriceRange(room.price);
        preferences.preferredPriceRanges[priceRange] = (preferences.preferredPriceRanges[priceRange] || 0) + 1;
      }
    }
  });

  preferences.avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;
  preferences.avgGroupSize = groupSizeCount > 0 ? totalGroupSize / groupSizeCount : 0;
  preferences.avgBookingDuration = durationCount > 0 ? totalDuration / durationCount : 0;

  return preferences;
};

// Get price range category
exports.getPriceRange = (price) => {
  if (price <= 5000) return 'Budget';
  if (price <= 10000) return 'Standard';
  if (price <= 20000) return 'Premium';
  return 'Luxury';
};

// Get popularity-based room recommendations
exports.getPopularityBasedRoomRecommendations = async (count, options = {}) => {
  try {
    const { checkInDate, checkOutDate, groupSize } = options;

    // Build query for available rooms
    let query = { status: 'Available' };

    // Filter by group size if provided
    if (groupSize) {
      // Assume room types have capacity info
      // This would need to be adjusted based on your room schema
    }

    let rooms = await Room.find(query)
      .sort({ averageRating: -1, totalRatings: -1, price: 1 })
      .limit(count * 2); // Get more to filter for availability

    // Filter by availability if dates provided
    if (checkInDate && checkOutDate) {
      const availableRooms = [];
      for (const room of rooms) {
        const bookings = await Booking.find({
          roomId: room._id,
          $or: [
            { checkInDate: { $lt: checkInDate }, checkOutDate: { $gt: checkInDate } },
            { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkOutDate } },
            { checkInDate: { $gte: checkInDate }, checkOutDate: { $lte: checkOutDate } },
            { checkInDate: { $lte: checkInDate }, checkOutDate: { $gte: checkOutDate } }
          ]
        });

        if (bookings.length === 0) {
          availableRooms.push(room);
        }
      }
      rooms = availableRooms.slice(0, count);
    } else {
      rooms = rooms.slice(0, count);
    }

    return rooms.map(room => ({
      roomId: room._id,
      score: room.averageRating || 3.5,
      reason: 'popularity',
      confidence: 'medium',
      roomDetails: room,
      // Include room properties directly for easier access
      _id: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: room.price,
      description: room.description,
      image: room.image,
      status: room.status,
      capacity: room.capacity,
      amenities: room.amenities,
      floor: room.floor,
      size: room.size,
      bedType: room.bedType,
      smokingAllowed: room.smokingAllowed,
      petFriendly: room.petFriendly,
      averageRating: room.averageRating,
      totalRatings: room.totalRatings,
      popularityScore: room.popularityScore
    }));

  } catch (error) {
    console.error('Error getting popular room recommendations:', error);
    return [];
  }
};

// Get collaborative filtering recommendations
exports.getCollaborativeRoomRecommendations = async (userId, userPreferences, count) => {
  try {
    // Find similar users based on room preferences
    const similarUserInteractions = await UserRoomInteraction.find({
      userId: { $ne: userId },
      rating: { $gte: 4 } // Users who rated rooms highly
    }).populate('roomId');

    // Get highly rated rooms from similar users
    const recommendedRooms = [];
    const seenRooms = new Set();

    similarUserInteractions.forEach(interaction => {
      if (!seenRooms.has(interaction.roomId._id.toString()) &&
          interaction.roomId.status === 'Available') {
        const room = interaction.roomId;
        recommendedRooms.push({
          roomId: room._id,
          score: interaction.rating,
          reason: 'collaborative_filtering',
          confidence: 'high',
          roomDetails: room,
          // Include room properties directly for easier access
          _id: room._id,
          roomNumber: room.roomNumber,
          roomType: room.roomType,
          price: room.price,
          description: room.description,
          image: room.image,
          status: room.status,
          capacity: room.capacity,
          amenities: room.amenities,
          floor: room.floor,
          size: room.size,
          bedType: room.bedType,
          smokingAllowed: room.smokingAllowed,
          petFriendly: room.petFriendly,
          averageRating: room.averageRating,
          totalRatings: room.totalRatings,
          popularityScore: room.popularityScore
        });
        seenRooms.add(interaction.roomId._id.toString());
      }
    });

    return recommendedRooms.slice(0, count);

  } catch (error) {
    console.error('Error getting collaborative room recommendations:', error);
    return [];
  }
};

// Get content-based room recommendations
exports.getContentBasedRoomRecommendations = async (userPreferences, count, options = {}) => {
  try {
    const { checkInDate, checkOutDate, groupSize } = options;

    let query = { status: 'Available' };

    // Filter by preferred room type
    const topRoomType = Object.keys(userPreferences.preferredRoomTypes)[0];
    if (topRoomType) {
      query.roomType = topRoomType;
    }

    // Filter by preferred price range
    const topPriceRange = Object.keys(userPreferences.preferredPriceRanges)[0];
    if (topPriceRange) {
      switch (topPriceRange) {
        case 'Budget':
          query.price = { $lte: 5000 };
          break;
        case 'Standard':
          query.price = { $gte: 5001, $lte: 10000 };
          break;
        case 'Premium':
          query.price = { $gte: 10001, $lte: 20000 };
          break;
        case 'Luxury':
          query.price = { $gte: 20001 };
          break;
      }
    }

    let rooms = await Room.find(query)
      .sort({ averageRating: -1, price: 1 })
      .limit(count * 2);

    // Filter by availability if dates provided
    if (checkInDate && checkOutDate) {
      const availableRooms = [];
      for (const room of rooms) {
        const bookings = await Booking.find({
          roomId: room._id,
          $or: [
            { checkInDate: { $lt: checkInDate }, checkOutDate: { $gt: checkInDate } },
            { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkOutDate } },
            { checkInDate: { $gte: checkInDate }, checkOutDate: { $lte: checkOutDate } },
            { checkInDate: { $lte: checkInDate }, checkOutDate: { $gte: checkOutDate } }
          ]
        });

        if (bookings.length === 0) {
          availableRooms.push(room);
        }
      }
      rooms = availableRooms.slice(0, count);
    } else {
      rooms = rooms.slice(0, count);
    }

    return rooms.map(room => ({
      roomId: room._id,
      score: room.averageRating || 3.5,
      reason: 'content_based',
      confidence: 'medium',
      roomDetails: room,
      // Include room properties directly for easier access
      _id: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      price: room.price,
      description: room.description,
      image: room.image,
      status: room.status,
      capacity: room.capacity,
      amenities: room.amenities,
      floor: room.floor,
      size: room.size,
      bedType: room.bedType,
      smokingAllowed: room.smokingAllowed,
      petFriendly: room.petFriendly,
      averageRating: room.averageRating,
      totalRatings: room.totalRatings,
      popularityScore: room.popularityScore
    }));

  } catch (error) {
    console.error('Error getting content-based room recommendations:', error);
    return [];
  }
};

// Update room rating statistics
exports.updateRoomRating = async (roomId, newRating) => {
  try {
    const room = await Room.findById(roomId);
    if (!room) return;

    const currentTotal = (room.averageRating || 0) * (room.totalRatings || 0);
    const newTotalRatings = (room.totalRatings || 0) + 1;
    const newAverageRating = (currentTotal + newRating) / newTotalRatings;

    await Room.findByIdAndUpdate(roomId, {
      averageRating: Math.round(newAverageRating * 100) / 100,
      totalRatings: newTotalRatings
    });

  } catch (error) {
    console.error('Error updating room rating:', error);
  }
};

// Remove duplicate room recommendations
exports.deduplicateRoomRecommendations = (recommendations) => {
  const seen = new Set();
  return recommendations.filter(rec => {
    const id = rec.roomId.toString();
    if (seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
};

// Get user's room interaction history
exports.getUserRoomHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const interactions = await UserRoomInteraction.find({
      userId,
      timestamp: { $gte: startDate }
    }).populate('roomId').sort({ timestamp: -1 });

    const preferences = exports.analyzeUserRoomPreferences(interactions);

    res.json({
      success: true,
      history: interactions,
      preferences,
      historyPeriodDays: days
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user room history',
      error: error.message
    });
  }
};

// Get popular rooms
exports.getPopularRooms = async (req, res) => {
  try {
    const { count = 10 } = req.query;
    const popularRooms = await exports.getPopularityBasedRoomRecommendations(parseInt(count));

    res.json({
      success: true,
      popularRooms
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular rooms',
      error: error.message
    });
  }
};