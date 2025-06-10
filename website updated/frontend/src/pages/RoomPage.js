import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiStar,
  FiInfo,
  FiShoppingCart,
  FiEye,
  FiHeart,
  FiTrendingUp,
  FiUser,
  FiFilter,
  FiCalendar,
  FiUsers,
  FiSearch,
  FiSliders
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import RoomDetailsModal from '../components/RoomDetailsModal';

const RoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [recommendedRooms, setRecommendedRooms] = useState([]);
  const [popularRooms, setPopularRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    priceRange: '',
    roomType: '',
    capacity: '',
    amenities: [],
    bedType: '',
    floor: '',
    petFriendly: false,
    smokingAllowed: false
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [user, setUser] = useState(null);
  const [bookingValidation, setBookingValidation] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    errors: []
  });

  // Helper function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/placeholder-room.jpg';
    
    try {
      if (imagePath.startsWith('http')) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, '');
      if (cleanPath.includes('uploads')) {
        return `http://localhost:8080/${cleanPath}`;
      }
      return `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error('Error formatting image URL:', error);
      return '/images/placeholder-room.jpg';
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setUser({ id: userId, token });
    }
  }, []);

  // Fetch all rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/rooms');
        setRooms(response.data);
      } catch (error) {
        setError('Failed to load rooms. Please try again.');
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Fetch popular rooms
  useEffect(() => {
    const fetchPopularRooms = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/rooms/popular?count=6');
        if (response.data.success) {
          setPopularRooms(response.data.popularRooms);
        }
      } catch (error) {
        console.error('Error fetching popular rooms:', error);
      }
    };

    fetchPopularRooms();
  }, []);

  // Fetch personalized recommendations for logged-in users
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id || !user?.token) return;

      setRecommendationsLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8080/api/rooms/recommendations/${user.id}?count=8`,
          {
            headers: { Authorization: `Bearer ${user.token}` }
          }
        );

        if (response.data.success) {
          setRecommendedRooms(response.data.recommendations);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // Record room interaction when user views details
  const recordInteraction = async (roomId, interactionType, additionalData = {}) => {
    if (!user?.id || !user?.token) return;

    try {
      await axios.post(
        'http://localhost:8080/api/rooms/interactions',
        {
          userId: user.id,
          roomId,
          interactionType,
          ...additionalData
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const handleViewDetails = (room, roomItem = null) => {
    setSelectedRoom(room);
    const roomId = room._id || (roomItem && roomItem.roomId);
    if (roomId) {
      recordInteraction(roomId, 'view');
    }
  };

  const handleCloseModal = () => {
    setSelectedRoom(null);
  };

  // Filter rooms based on active filters
  const getFilteredRooms = (roomList) => {
    return roomList.filter(room => {
      const roomData = room.roomDetails || room;

      // Price range filter
      if (filters.priceRange) {
        const price = roomData.price;
        switch (filters.priceRange) {
          case 'budget':
            if (price > 5000) return false;
            break;
          case 'standard':
            if (price < 5001 || price > 10000) return false;
            break;
          case 'premium':
            if (price < 10001 || price > 20000) return false;
            break;
          case 'luxury':
            if (price < 20001) return false;
            break;
          default:
            // No price filter applied
            break;
        }
      }

      // Room type filter
      if (filters.roomType && roomData.roomType !== filters.roomType) {
        return false;
      }

      // Capacity filter
      if (filters.capacity) {
        const capacity = roomData.capacity || 2;
        if (capacity < parseInt(filters.capacity)) return false;
      }

      // Bed type filter
      if (filters.bedType && roomData.bedType !== filters.bedType) {
        return false;
      }

      // Floor filter
      if (filters.floor && roomData.floor !== parseInt(filters.floor)) {
        return false;
      }

      // Amenities filter
      if (filters.amenities.length > 0) {
        const roomAmenities = roomData.amenities || [];
        const hasAllAmenities = filters.amenities.every(amenity =>
          roomAmenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }

      // Pet friendly filter
      if (filters.petFriendly && !roomData.petFriendly) {
        return false;
      }

      // Smoking allowed filter
      if (filters.smokingAllowed && !roomData.smokingAllowed) {
        return false;
      }

      return true;
    });
  };

  // Handle amenity filter changes
  const handleAmenityFilter = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      priceRange: '',
      roomType: '',
      capacity: '',
      amenities: [],
      bedType: '',
      floor: '',
      petFriendly: false,
      smokingAllowed: false
    });
  };

  // Comprehensive booking validation
  const validateBooking = (room, checkInDate, checkOutDate, guests) => {
    const errors = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Date validations
    if (!checkInDate) {
      errors.push("Please select a check-in date");
    } else {
      const checkIn = new Date(checkInDate);
      if (checkIn < today) {
        errors.push("Check-in date cannot be in the past");
      }

      // Check if date is too far in future (1 year)
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (checkIn > maxDate) {
        errors.push("Cannot book rooms more than 1 year in advance");
      }
    }

    if (!checkOutDate) {
      errors.push("Please select a check-out date");
    } else if (checkInDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      if (checkOut <= checkIn) {
        errors.push("Check-out date must be after check-in date");
      }

      // Maximum stay validation (30 days)
      const daysDiff = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      if (daysDiff > 30) {
        errors.push("Maximum stay is 30 days. For longer stays, please contact us directly");
      }

      if (daysDiff < 1) {
        errors.push("Minimum stay is 1 night");
      }
    }

    // Guest validation
    if (!guests || guests < 1) {
      errors.push("Please specify number of guests (minimum 1)");
    } else if (guests > (room.capacity || 4)) {
      errors.push(`This room can accommodate maximum ${room.capacity || 4} guests`);
    } else if (guests > 10) {
      errors.push("For groups larger than 10, please contact us directly");
    }

    // Room availability validation
    if (room.status && room.status !== 'Available') {
      errors.push("This room is currently not available for booking");
    }

    return errors;
  };

  // Check for double booking
  const checkRoomAvailability = async (roomId, checkInDate, checkOutDate) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/rooms/availability`, {
        params: {
          roomId,
          checkInDate,
          checkOutDate
        }
      });

      return response.data.isAvailable;
    } catch (error) {
      console.error("Error checking room availability:", error);
      throw new Error("Unable to verify room availability. Please try again.");
    }
  };

  // Enhanced room booking handler with validation
  const handleBookRoom = async (room) => {
    const { checkInDate, checkOutDate, guests } = bookingValidation;

    // Validate booking data
    const validationErrors = validateBooking(room, checkInDate, checkOutDate, guests);
    if (validationErrors.length > 0) {
      setBookingValidation(prev => ({ ...prev, errors: validationErrors }));
      return;
    }

    try {
      // Check for double booking
      const isAvailable = await checkRoomAvailability(room._id, checkInDate, checkOutDate);
      if (!isAvailable) {
        setBookingValidation(prev => ({
          ...prev,
          errors: ["This room is already booked for the selected dates. Please choose different dates."]
        }));
        return;
      }

      // Record booking interaction
      await recordInteraction(room._id, 'booking', {
        checkInDate,
        checkOutDate,
        guests,
        roomType: room.roomType,
        price: room.price
      });

      // Clear validation errors
      setBookingValidation(prev => ({ ...prev, errors: [] }));

      // Navigate to booking page with room details
      const bookingData = {
        roomId: room._id,
        roomName: room.roomName || `Room ${room.roomNumber}`,
        roomType: room.roomType,
        roomImage: getImageUrl(room.image),
        price: room.price,
        capacity: room.capacity,
        amenities: room.amenities,
        checkInDate,
        checkOutDate,
        guests
      };

      localStorage.setItem('roomBookingData', JSON.stringify(bookingData));
      window.location.href = `/book-room/${room._id}`;

    } catch (error) {
      console.error("Error during booking process:", error);
      setBookingValidation(prev => ({
        ...prev,
        errors: [error.message || "An error occurred while processing your booking. Please try again."]
      }));
    }
  };

  // Get current rooms to display based on active tab
  const getCurrentRooms = () => {
    switch (activeTab) {
      case 'recommended':
        return getFilteredRooms(recommendedRooms);
      case 'popular':
        return getFilteredRooms(popularRooms);
      default:
        return getFilteredRooms(rooms);
    }
  };

  // Get price in Pakistani Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Get recommendation reason badge
  const getRecommendationBadge = (reason, confidence) => {
    const badges = {
      collaborative_filtering: { text: 'Similar Users', color: 'success', icon: <FiUser size={12} /> },
      content_based: { text: 'Your Taste', color: 'info', icon: <FiHeart size={12} /> },
      popularity: { text: 'Trending', color: 'warning', icon: <FiTrendingUp size={12} /> },
      hybrid: { text: 'Perfect Match', color: 'primary', icon: <FiStar size={12} /> }
    };

    const badge = badges[reason] || badges.popularity;
    return (
      <span className={`badge bg-${badge.color} d-flex align-items-center gap-1`}>
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  return (
    <>
      <Header />
      <div style={{
        background: '#0A192F',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        margin: 0,
        padding: 0,
        paddingTop: '80px'
      }}>

        {/* Main Content */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          margin: '0',
          padding: '60px 1.5rem 1.5rem'
        }}>
          {/* Hero Section */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
            padding: '1rem 0'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ffffff 0%, #64ffda 30%, #bb86fc 70%, #ff6b9d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.5rem',
              lineHeight: '1.1',
              textShadow: '0 0 30px rgba(100, 255, 218, 0.3)',
              animation: 'slideInUp 0.8s ease-out'
            }}>
              Luxury Accommodations
            </h1>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0',
              lineHeight: '1.4',
              animation: 'slideInUp 0.8s ease-out 0.2s both'
            }}>
              Experience unparalleled comfort and elegance in our premium rooms
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              background: 'rgba(255, 107, 157, 0.1)',
              border: '1px solid rgba(255, 107, 157, 0.3)',
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#ff6b9d',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiInfo />
              {error}
            </div>
          )}

          {/* Modern Filters and Tabs */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            animation: 'slideInUp 0.8s ease-out 0.4s both'
          }}>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '0.5rem 1rem',
                  background: activeTab === 'all'
                    ? 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: activeTab === 'all' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: activeTab === 'all' ? '#0a0a0a' : '#fff',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <FiFilter size={14} />
                All Rooms ({rooms.length})
              </button>

              {user && (
                <button
                  onClick={() => setActiveTab('recommended')}
                  style={{
                    padding: '0.5rem 1rem',
                    background: activeTab === 'recommended'
                      ? 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: activeTab === 'recommended' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    color: activeTab === 'recommended' ? '#0a0a0a' : '#fff',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <FiHeart size={14} />
                  For You ({recommendedRooms.length})
                  {recommendationsLoading && (
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab('popular')}
                style={{
                  padding: '0.5rem 1rem',
                  background: activeTab === 'popular'
                    ? 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: activeTab === 'popular' ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '0.75rem',
                  color: activeTab === 'popular' ? '#0a0a0a' : '#fff',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <FiTrendingUp size={14} />
                Popular ({popularRooms.length})
              </button>
            </div>

            {/* Quick Filters */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              alignItems: 'end'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="">All Prices</option>
                  <option value="budget">Budget (≤ Rs. 5,000)</option>
                  <option value="standard">Standard (Rs. 5,001-10,000)</option>
                  <option value="premium">Premium (Rs. 10,001-20,000)</option>
                  <option value="luxury">Luxury (Rs. 20,001+)</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  Room Type
                </label>
                <select
                  value={filters.roomType}
                  onChange={(e) => setFilters({...filters, roomType: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="">All Types</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Twin">Twin</option>
                  <option value="Suite">Suite</option>
                  <option value="Family">Family</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Presidential">Presidential</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  style={{
                    padding: '0.6rem 1rem',
                    background: 'rgba(100, 255, 218, 0.1)',
                    border: '1px solid rgba(100, 255, 218, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#64ffda',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <FiSliders size={14} />
                  {showAdvancedFilters ? 'Less' : 'More'}
                </button>

                {(Object.values(filters).some(v => v && (Array.isArray(v) ? v.length > 0 : true))) && (
                  <button
                    onClick={clearFilters}
                    style={{
                      padding: '0.6rem 1rem',
                      background: 'rgba(255, 107, 157, 0.1)',
                      border: '1px solid rgba(255, 107, 157, 0.3)',
                      borderRadius: '0.5rem',
                      color: '#ff6b9d',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recommendation Info */}
          {activeTab === 'recommended' && user && (
            <div style={{
              background: 'rgba(100, 255, 218, 0.1)',
              border: '1px solid rgba(100, 255, 218, 0.3)',
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#64ffda',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiUser />
              <div>
                <strong>Personalized for You!</strong> These recommendations are based on your preferences and booking history.
              </div>
            </div>
          )}

          {!user && activeTab === 'recommended' && (
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '1rem',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#ffc107',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FiInfo />
              <div>
                <strong>Login Required:</strong> Please <Link to="/login" style={{ color: '#ffc107', textDecoration: 'underline' }}>login</Link> to see personalized room recommendations.
              </div>
            </div>
          )}

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div style={{
              background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '1.5rem',
              padding: '2rem',
              marginBottom: '3rem',
              animation: 'slideInUp 0.8s ease-out 0.6s both'
            }}>
              <h3 style={{
                color: '#64ffda',
                marginBottom: '1.5rem',
                fontSize: '1.25rem',
                fontWeight: '700'
              }}>
                Advanced Filters
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    Capacity
                  </label>
                  <select
                    value={filters.capacity}
                    onChange={(e) => setFilters({...filters, capacity: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="">Any Capacity</option>
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3+ Guests</option>
                    <option value="4">4+ Guests</option>
                    <option value="6">6+ Guests</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    Bed Type
                  </label>
                  <select
                    value={filters.bedType}
                    onChange={(e) => setFilters({...filters, bedType: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="">Any Bed Type</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Queen">Queen</option>
                    <option value="King">King</option>
                    <option value="Twin">Twin</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    Floor
                  </label>
                  <select
                    value={filters.floor}
                    onChange={(e) => setFilters({...filters, floor: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="">Any Floor</option>
                    <option value="1">1st Floor</option>
                    <option value="2">2nd Floor</option>
                    <option value="3">3rd Floor</option>
                    <option value="4">4th Floor</option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    Special Requirements
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={filters.petFriendly}
                        onChange={(e) => setFilters({...filters, petFriendly: e.target.checked})}
                        style={{ accentColor: '#64ffda' }}
                      />
                      Pet Friendly
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="checkbox"
                        checked={filters.smokingAllowed}
                        onChange={(e) => setFilters({...filters, smokingAllowed: e.target.checked})}
                        style={{ accentColor: '#64ffda' }}
                      />
                      Smoking Allowed
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '1rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  Amenities
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {['WiFi', 'AC', 'TV', 'Minibar', 'Balcony', 'Sea View', 'City View', 'Room Service', 'Jacuzzi', 'Kitchen', 'Workspace', 'Parking'].map(amenity => (
                    <label
                      key={amenity}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        background: filters.amenities.includes(amenity)
                          ? 'rgba(100, 255, 218, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '0.5rem',
                        border: filters.amenities.includes(amenity)
                          ? '1px solid rgba(100, 255, 218, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityFilter(amenity)}
                        style={{ accentColor: '#64ffda' }}
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Booking Validation Form */}
          <div style={{
            background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            animation: 'slideInUp 0.8s ease-out 0.8s both'
          }}>
            <h3 style={{
              color: '#64ffda',
              marginBottom: '1rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}>
              <FiCalendar size={16} />
              Check Availability & Book
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '0.75rem',
              alignItems: 'end',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  Check-in Date *
                </label>
                <input
                  type="date"
                  value={bookingValidation.checkInDate}
                  min={new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onChange={(e) => setBookingValidation(prev => ({
                    ...prev,
                    checkInDate: e.target.value,
                    errors: []
                  }))}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  Check-out Date *
                </label>
                <input
                  type="date"
                  value={bookingValidation.checkOutDate}
                  min={bookingValidation.checkInDate || new Date().toISOString().split('T')[0]}
                  max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onChange={(e) => setBookingValidation(prev => ({
                    ...prev,
                    checkOutDate: e.target.value,
                    errors: []
                  }))}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.4rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.8rem',
                  fontWeight: '500'
                }}>
                  Number of Guests *
                </label>
                <input
                  type="number"
                  value={bookingValidation.guests}
                  min="1"
                  max="10"
                  onChange={(e) => setBookingValidation(prev => ({
                    ...prev,
                    guests: parseInt(e.target.value) || 1,
                    errors: []
                  }))}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.8rem'
                  }}
                />
                <small style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>Max 10 guests</small>
              </div>

              <button
                onClick={() => {
                  if (bookingValidation.checkInDate && bookingValidation.checkOutDate) {
                    setFilters(prev => ({ ...prev }));
                  }
                }}
                style={{
                  padding: '0.6rem 1rem',
                  background: 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#0a0a0a',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem'
                }}
              >
                <FiSearch size={14} />
                Check Availability
              </button>
            </div>

            {/* Validation Errors */}
            {bookingValidation.errors.length > 0 && (
              <div style={{
                background: 'rgba(255, 107, 157, 0.1)',
                border: '1px solid rgba(255, 107, 157, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1rem',
                color: '#ff6b9d'
              }}>
                <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                  {bookingValidation.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Booking Summary */}
            {bookingValidation.checkInDate && bookingValidation.checkOutDate && bookingValidation.errors.length === 0 && (
              <div style={{
                background: 'rgba(100, 255, 218, 0.1)',
                border: '1px solid rgba(100, 255, 218, 0.3)',
                borderRadius: '0.75rem',
                padding: '1rem',
                color: '#64ffda'
              }}>
                <strong>Booking Details:</strong> {bookingValidation.guests} guest(s) from{' '}
                {new Date(bookingValidation.checkInDate).toLocaleDateString()} to{' '}
                {new Date(bookingValidation.checkOutDate).toLocaleDateString()}
                {' '}({Math.ceil((new Date(bookingValidation.checkOutDate) - new Date(bookingValidation.checkInDate)) / (1000 * 60 * 60 * 24))} night(s))
              </div>
            )}
          </div>

          {/* Rooms Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {loading ? (
              Array(6).fill().map((_, index) => (
                <div
                  key={index}
                  style={{
                    background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    height: '500px',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                >
                  <div style={{
                    height: '250px',
                    background: 'linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    animation: 'shimmer 2s ease-in-out infinite'
                  }} />
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{
                      height: '1.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      animation: 'shimmer 2s ease-in-out infinite'
                    }} />
                    <div style={{
                      height: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem',
                      width: '80%',
                      animation: 'shimmer 2s ease-in-out infinite'
                    }} />
                    <div style={{
                      height: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      width: '60%',
                      animation: 'shimmer 2s ease-in-out infinite'
                    }} />
                  </div>
                </div>
              ))
            ) : (
              getCurrentRooms().map((roomItem, index) => {
                const room = roomItem.roomDetails || roomItem;
                const isRecommended = activeTab === 'recommended';
                const isPopular = activeTab === 'popular';

                return (
                  <div
                    key={room._id || roomItem.roomId}
                    style={{
                      background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: isRecommended
                        ? '1px solid rgba(100, 255, 218, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '1.5rem',
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      animation: `slideInUp 0.8s ease-out ${1 + index * 0.1}s both`,
                      position: 'relative',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    {/* Image Section */}
                    <div style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
                      <img
                        src={getImageUrl(room.image)}
                        alt={room.roomNumber || room.roomName}
                        onError={(e) => {
                          console.error('Error loading image:', room.image);
                          e.target.src = '/images/placeholder-room.jpg';
                          e.target.onerror = null;
                        }}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.4s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                      />

                      {/* Price Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)',
                        color: '#0a0a0a',
                        padding: '0.5rem 1rem',
                        borderRadius: '1rem',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        boxShadow: '0 4px 15px rgba(100, 255, 218, 0.3)'
                      }}>
                        {formatPrice(room.price)}<small style={{ fontSize: '0.7rem' }}>/night</small>
                      </div>

                      {/* Recommendation Badge */}
                      {isRecommended && roomItem.reason && (
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          left: '1rem'
                        }}>
                          {getRecommendationBadge(roomItem.reason, roomItem.confidence)}
                        </div>
                      )}

                      {/* Score Badge */}
                      {(isRecommended || isPopular) && roomItem.score && (
                        <div style={{
                          position: 'absolute',
                          bottom: '1rem',
                          left: '1rem',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: '#fff',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          backdropFilter: 'blur(10px)'
                        }}>
                          <FiStar size={12} style={{ fill: '#ffc107', color: '#ffc107' }} />
                          {roomItem.score.toFixed(1)}
                        </div>
                      )}
                    </div>
                    {/* Card Content */}
                    <div style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '250px'
                    }}>
                      {/* Header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#fff',
                            marginBottom: '0.25rem',
                            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}>
                            Room {room.roomNumber || room.roomName}
                          </h3>
                          <span style={{
                            fontSize: '0.85rem',
                            color: '#64ffda',
                            fontWeight: '500'
                          }}>
                            {room.roomType}
                          </span>
                        </div>

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              size={14}
                              style={{
                                fill: i < (room.averageRating || 4) ? '#ffc107' : 'none',
                                color: i < (room.averageRating || 4) ? '#ffc107' : 'rgba(255, 255, 255, 0.3)'
                              }}
                            />
                          ))}
                          {room.totalRatings > 0 && (
                            <span style={{
                              fontSize: '0.8rem',
                              color: 'rgba(255, 255, 255, 0.7)',
                              marginLeft: '0.25rem'
                            }}>
                              ({room.totalRatings})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p style={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1
                      }}>
                        {room.description}
                      </p>

                      {/* Amenities */}
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        marginBottom: '1.5rem'
                      }}>
                        {room.amenities && room.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: 'rgba(100, 255, 218, 0.1)',
                              border: '1px solid rgba(100, 255, 218, 0.3)',
                              borderRadius: '1rem',
                              fontSize: '0.75rem',
                              color: '#64ffda',
                              fontWeight: '500'
                            }}
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.capacity && (
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(187, 134, 252, 0.1)',
                            border: '1px solid rgba(187, 134, 252, 0.3)',
                            borderRadius: '1rem',
                            fontSize: '0.75rem',
                            color: '#bb86fc',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <FiUsers size={10} />
                            {room.capacity} guests
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{
                        display: 'flex',
                        gap: '0.75rem',
                        marginTop: 'auto'
                      }}>
                        <button
                          onClick={() => handleBookRoom(room)}
                          disabled={!bookingValidation.checkInDate || !bookingValidation.checkOutDate}
                          style={{
                            flex: 1,
                            padding: '0.75rem 1rem',
                            background: (!bookingValidation.checkInDate || !bookingValidation.checkOutDate)
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)',
                            border: 'none',
                            borderRadius: '0.75rem',
                            color: (!bookingValidation.checkInDate || !bookingValidation.checkOutDate)
                              ? 'rgba(255, 255, 255, 0.5)'
                              : '#0a0a0a',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: (!bookingValidation.checkInDate || !bookingValidation.checkOutDate)
                              ? 'not-allowed'
                              : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <FiShoppingCart size={14} />
                          {!bookingValidation.checkInDate || !bookingValidation.checkOutDate ? 'Select Dates' : 'Book Now'}
                        </button>

                        <button
                          onClick={() => handleViewDetails(room, roomItem)}
                          style={{
                            padding: '0.75rem 1rem',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.75rem',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          <FiEye size={14} />
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* No Rooms Found */}
          {!loading && rooms.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              <FiInfo size={64} style={{ color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1.5rem' }} />
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#fff',
                marginBottom: '0.5rem'
              }}>
                No rooms found
              </h3>
              <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                Please try adjusting your filters or try again later
              </p>
            </div>
          )}

          {/* Room Details Modal */}
          {selectedRoom && (
            <RoomDetailsModal
              room={selectedRoom}
              onClose={handleCloseModal}
            />
          )}
        </div>


      </div>
    </>
  );
};

export default RoomPage;
