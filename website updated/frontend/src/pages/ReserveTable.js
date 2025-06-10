import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FiCalendar, FiUsers, FiClock, FiX, FiStar, FiHeart } from "react-icons/fi";
import Header from "../components/common/Header";
import EditReservation from "../components/User/EditReservation";
import TableRecommendations from "../components/tables/TableRecommendations";
import { tableRecommendationService } from "../services/tableRecommendationService";
import "./ReserveTable.css";

const ReserveTable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tables, setTables] = useState([]);
  const [filteredTables, setFilteredTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("recommendations");
  const [reservationData, setReservationData] = useState({
    date: "",
    time: "",
    guests: 1,
  });
  const [filters, setFilters] = useState({
    capacity: "",
    location: "",
    tableType: "",
    priceRange: "",
    availability: true
  });
  
  // Extract the edit reservation ID from URL query parameters (if it exists)
  const queryParams = new URLSearchParams(location.search);
  const editReservationId = queryParams.get('edit');

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
    fetchTables();
  }, []);

  // Filter tables based on criteria
  useEffect(() => {
    filterTables();
  }, [tables, reservationData, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterTables = async () => {
    let filtered = [...tables];

    // Filter by capacity
    if (reservationData.guests) {
      filtered = filtered.filter(table => table.capacity >= parseInt(reservationData.guests));
    }

    // Filter by location
    if (filters.location) {
      filtered = filtered.filter(table =>
        table.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filter by table type
    if (filters.tableType) {
      filtered = filtered.filter(table =>
        table.tableType?.toLowerCase() === filters.tableType.toLowerCase()
      );
    }

    // Check availability for specific date/time
    if (reservationData.date && reservationData.time && filters.availability) {
      try {
        const response = await axios.get(`http://localhost:8080/api/tables/availability`, {
          params: {
            reservationDate: reservationData.date,
            time: reservationData.time,
            endTime: calculateEndTime(reservationData.time)
          }
        });

        const availableTables = response.data
          .filter(item => item.isAvailable)
          .map(item => item.table._id);

        filtered = filtered.filter(table => availableTables.includes(table._id));
      } catch (error) {
        console.error("Error checking availability:", error);
      }
    }

    setFilteredTables(filtered);
  };

  const calculateEndTime = (startTime) => {
    if (!startTime) return "";
    const [hours, minutes] = startTime.split(':').map(Number);
    let newHours = hours + 2;
    if (newHours >= 24) newHours -= 24;
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/tables");
      setTables(response.data);
    } catch (error) {
      setError("Failed to load tables. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const recordInteraction = async (tableId, interactionType, additionalData = {}) => {
    try {
      await tableRecommendationService.recordInteraction({
        tableId,
        interactionType,
        context: {
          occasion: reservationData.occasion,
          partySize: reservationData.guests,
          timeSlot: reservationData.timeSlot
        },
        ...additionalData
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const validateReservation = () => {
    const errors = [];

    // Date validation
    if (!reservationData.date) {
      errors.push("Please select a reservation date");
    } else {
      const selectedDate = new Date(reservationData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.push("Cannot book tables for past dates");
      }

      // Check if date is too far in future (6 months)
      const maxDate = new Date();
      maxDate.setMonth(maxDate.getMonth() + 6);
      if (selectedDate > maxDate) {
        errors.push("Cannot book tables more than 6 months in advance");
      }
    }

    // Time validation
    if (!reservationData.time) {
      errors.push("Please select a reservation time");
    } else {
      const [hours] = reservationData.time.split(':').map(Number);
      if (hours < 10 || hours > 22) {
        errors.push("Reservations are only available between 10:00 AM and 10:00 PM");
      }
    }

    // Guest validation
    if (!reservationData.guests || reservationData.guests < 1) {
      errors.push("Please specify number of guests (minimum 1)");
    } else if (reservationData.guests > 20) {
      errors.push("For parties larger than 20, please call us directly");
    }

    return errors;
  };

  const handleReserveClick = async (table) => {
    // Validate reservation data
    const validationErrors = validateReservation();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      return;
    }

    // Check if table capacity is sufficient
    if (table.capacity < parseInt(reservationData.guests)) {
      setError(`This table can only accommodate ${table.capacity} guests. You selected ${reservationData.guests} guests.`);
      return;
    }

    // Check for double booking
    try {
      const response = await axios.get(`http://localhost:8080/api/tables/availability`, {
        params: {
          reservationDate: reservationData.date,
          time: reservationData.time,
          endTime: calculateEndTime(reservationData.time)
        }
      });

      const tableAvailability = response.data.find(t => t.table._id === table._id);
      if (tableAvailability && !tableAvailability.isAvailable) {
        setError("This table is already reserved for the selected time. Please choose a different time or table.");
        return;
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setError("Unable to verify table availability. Please try again.");
      return;
    }

    // Record booking interaction
    await recordInteraction(table._id, 'booking');

    // Store the selected table and reservation data in localStorage
    const reservationDetails = {
      tableId: table._id,
      tableName: table.tableName,
      tableImage: getImageUrl(table.image),
      tableCapacity: table.capacity,
      tableDescription: table.description,
      date: reservationData.date,
      time: reservationData.time,
      guests: reservationData.guests,
    };

    localStorage.setItem('reservationDetails', JSON.stringify(reservationDetails));
    setError(null); // Clear any previous errors
    navigate('/table-reservation');
  };

  const handleTableView = async (table) => {
    await recordInteraction(table._id, 'view', {
      sessionDuration: Math.floor(Math.random() * 300) + 30
    });
  };

  const handleTableFavorite = async (table) => {
    await recordInteraction(table._id, 'favorite');
  };
  
  const handleEditSuccess = () => {
    // After successful edit, go back to My Reservations
    navigate('/my-reservations');
  };

  // If in edit mode, show the EditReservation component instead
  if (editReservationId) {
    return (
      <>
        <Header />
        <div style={{
          background: '#0A192F',
          minHeight: '100vh',
          paddingTop: '80px'
        }}>
          <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <EditReservation
              reservationId={editReservationId}
              onClose={() => navigate('/my-reservations')}
              onSuccess={handleEditSuccess}
            />
          </div>
        </div>
      </>
    );
  }

  if (loading) {
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
                textShadow: '0 0 30px rgba(100, 255, 218, 0.3)'
              }}>
                Reserve a Table
              </h1>
              <p style={{
                fontSize: '1rem',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0',
                lineHeight: '1.4'
              }}>
                Loading available tables...
              </p>
            </div>

            {/* Loading Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {Array(6).fill().map((_, index) => (
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
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

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
        paddingTop: '80px' // Account for fixed header
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
              Reserve a Table
            </h1>
            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: '0',
              lineHeight: '1.4',
              animation: 'slideInUp 0.8s ease-out 0.2s both'
            }}>
              Book your perfect dining experience
            </p>
          </div>

          {/* Tabs Section */}
          <div style={{
            background: 'transparent',
            padding: '1.5rem 0',
            marginBottom: '2rem'
          }}>
            {/* Tab Navigation */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '2rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setActiveTab('recommendations')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'recommendations'
                    ? 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)'
                    : 'transparent',
                  color: activeTab === 'recommendations' ? '#0a192f' : 'rgba(255, 255, 255, 0.9)',
                  boxShadow: activeTab === 'recommendations'
                    ? '0 4px 15px rgba(100, 255, 218, 0.4)'
                    : 'none'
                }}
              >
                💝 RECOMMENDED FOR YOU
              </button>
              <button
                onClick={() => setActiveTab('all')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: activeTab === 'all'
                    ? 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)'
                    : 'transparent',
                  color: activeTab === 'all' ? '#0a192f' : 'rgba(255, 255, 255, 0.9)',
                  boxShadow: activeTab === 'all'
                    ? '0 4px 15px rgba(100, 255, 218, 0.4)'
                    : 'none'
                }}
              >
                🍽️ ALL TABLES
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'recommendations' ? (
              <div style={{
                background: 'transparent',
                padding: '0',
                textAlign: 'center'
              }}>
                <TableRecommendations />
              </div>
            ) : (
              <div>
                {/* Booking Form Container - Same style as Recommendations */}
                <div style={{
                  background: 'rgba(100, 255, 218, 0.05)',
                  borderRadius: '1rem',
                  padding: '1.2rem',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(100, 255, 218, 0.1)'
                }}>
                  <h3 style={{
                    color: '#64ffda',
                    fontSize: '1rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    textAlign: 'center'
                  }}>
                    🍽️ Find Your Perfect Table
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#fff', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                        📅 Date *
                      </label>
                      <input
                        type="date"
                        value={reservationData.date}
                        min={new Date().toISOString().split('T')[0]}
                        max={new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        onChange={(e) => {
                          setReservationData({ ...reservationData, date: e.target.value });
                          setError(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: '#0A192F',
                          border: '1px solid rgba(100, 255, 218, 0.3)',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#fff', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                        🕐 Time *
                      </label>
                      <input
                        type="time"
                        value={reservationData.time}
                        min="10:00"
                        max="22:00"
                        onChange={(e) => {
                          setReservationData({ ...reservationData, time: e.target.value });
                          setError(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: '#0A192F',
                          border: '1px solid rgba(100, 255, 218, 0.3)',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#fff', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                        👥 Guests *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={reservationData.guests}
                        onChange={(e) => {
                          setReservationData({ ...reservationData, guests: e.target.value });
                          setError(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: '#0A192F',
                          border: '1px solid rgba(100, 255, 218, 0.3)',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <div>
                      <label style={{ display: 'block', color: '#fff', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                        📍 Location
                      </label>
                      <select
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: '#0A192F',
                          border: '1px solid rgba(100, 255, 218, 0.3)',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      >
                  <option value="">Any Location</option>
                  <option value="window">Window View</option>
                  <option value="garden">Garden View</option>
                  <option value="private">Private Area</option>
                  <option value="main">Main Dining</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#fff', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                        🍽️ Table Type
                      </label>
                      <select
                        value={filters.tableType}
                        onChange={(e) => setFilters({ ...filters, tableType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: '#0A192F',
                          border: '1px solid rgba(100, 255, 218, 0.3)',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      >
                        <option value="">Any Type</option>
                        <option value="romantic">Romantic</option>
                        <option value="family">Family</option>
                        <option value="business">Business</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', color: '#fff', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.4rem' }}>
                        📊 Capacity
                      </label>
                      <select
                        value={filters.capacity}
                        onChange={(e) => setFilters({ ...filters, capacity: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          background: '#0A192F',
                          border: '1px solid rgba(100, 255, 218, 0.3)',
                          borderRadius: '0.5rem',
                          color: '#fff',
                          fontSize: '0.75rem'
                        }}
                      >
                        <option value="">Any Size</option>
                        <option value="2">2 People</option>
                        <option value="4">4 People</option>
                        <option value="6">6 People</option>
                        <option value="8">8+ People</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'end' }}>
                      <label style={{ display: 'flex', alignItems: 'center', color: '#fff', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={filters.availability}
                          onChange={(e) => setFilters({ ...filters, availability: e.target.checked })}
                          style={{ marginRight: '0.5rem' }}
                        />
                        Show only available
                      </label>
                    </div>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.9rem',
                    padding: '1rem',
                    background: 'transparent',
                    borderRadius: '0.75rem'
                  }}>
                    Showing {filteredTables.length} of {tables.length} tables
                    {reservationData.date && reservationData.time && (
                      <span style={{ marginLeft: '0.5rem' }}>
                        for {new Date(reservationData.date).toLocaleDateString()} at {reservationData.time}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 87, 87, 0.1)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#fff',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}>
              <FiX />
              {error}
            </div>
          )}

          {/* Tables Grid */}
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
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    height: '500px',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}
                />
              ))
            ) : filteredTables.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '4rem 2rem',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                <FiCalendar size={64} style={{ color: 'rgba(255, 255, 255, 0.4)', marginBottom: '1.5rem' }} />
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#fff',
                  marginBottom: '0.5rem'
                }}>
                  No tables available
                </h3>
                <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Try adjusting your filters or selecting a different date/time
                </p>
              </div>
            ) : (
              filteredTables.map((table) => (
                <div
                  key={table._id}
                  style={{
                    background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.8) 0%, rgba(26, 35, 50, 0.6) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '1.5rem',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    handleTableView(table);
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(100, 255, 218, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                  }}
                >
                  {/* Table Image */}
                  <div style={{ position: 'relative', paddingTop: '60%', overflow: 'hidden' }}>
                    <img
                      src={getImageUrl(table.image)}
                      alt={table.tableName}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        e.target.src = "/images/placeholder-table.jpg";
                        e.target.onerror = null;
                      }}
                    />

                    {/* Capacity Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
                      color: '#0a192f',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '2rem',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}>
                      <FiUsers size={14} />
                      {table.capacity} seats
                    </div>

                    {/* Rating Badge */}
                    {table.avgRating && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        background: 'rgba(255, 193, 7, 0.9)',
                        color: '#fff',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '2rem',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                      }}>
                        <FiStar size={14} />
                        {table.avgRating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '1.5rem' }}>
                    {/* Header with Title and Favorite */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <h3 style={{
                        color: '#64ffda',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        margin: 0,
                        lineHeight: '1.2'
                      }}>
                        {table.tableName}
                      </h3>
                      <button
                        onClick={() => handleTableFavorite(table)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255, 107, 157, 0.8)',
                          padding: '0.5rem',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FiHeart size={16} />
                      </button>
                    </div>

                    {/* Description */}
                    <p style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.9rem',
                      lineHeight: '1.4',
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {table.description}
                    </p>

                    {/* Location */}
                    {table.location && (
                      <div style={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        📍 {table.location}
                      </div>
                    )}

                    {/* Features */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.85rem',
                        padding: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '0.5rem'
                      }}>
                        <FiClock size={16} style={{ color: '#64ffda' }} />
                        <span>Available for booking</span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '0.85rem',
                        padding: '0.5rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '0.5rem'
                      }}>
                        <FiUsers size={16} style={{ color: '#64ffda' }} />
                        <span>Max {table.capacity} guests</span>
                      </div>
                    </div>

                    {/* Reserve Button */}
                    <button
                      onClick={() => handleReserveClick(table)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
                        color: '#0a192f',
                        border: 'none',
                        borderRadius: '0.75rem',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(100, 255, 218, 0.3)'
                      }}
                    >
                      Reserve Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ReserveTable;