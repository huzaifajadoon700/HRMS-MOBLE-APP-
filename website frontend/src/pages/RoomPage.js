import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiStar, FiInfo, FiShoppingCart, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { facility } from '../components/data/Data';
import RoomDetailsModal from '../components/RoomDetailsModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RoomPage.css';

const RoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

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

  const handleViewDetails = (room) => {
    setSelectedRoom(room);
  };

  const handleCloseModal = () => {
    setSelectedRoom(null);
  };

  return (
    <PageLayout>
      <div className="rooms-container" style={{marginTop:"-60px"}}>
        <div className="section-header text-center">
          <h2 className="section-title">Our Accommodations</h2>
          <p className="section-subtitle">Experience Luxury and Comfort</p>
        </div>
        
        {error && (
          <div className="alert alert-warning d-flex align-items-center mb-4">
            <FiInfo className="me-2" />
            {error}
          </div>
        )}

        <div className="rooms-grid">
          {loading ? (
            Array(10).fill().map((_, index) => (
              <div key={index} className="card h-100">
                <div className="card-img-top placeholder-glow" style={{ height: '200px' }}>
                  <div className="placeholder w-100 h-100"></div>
                </div>
                <div className="card-body">
                  <h5 className="card-title placeholder-glow">
                    <span className="placeholder col-8"></span>
                  </h5>
                  <p className="card-text placeholder-glow">
                    <span className="placeholder col-12"></span>
                    <span className="placeholder col-10"></span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            rooms.map((room) => (
              <div key={room._id} className="card h-100">
                <div className="position-relative">
                  <img
                    src={getImageUrl(room.image)}
                    className="card-img-top"
                    alt={room.roomName}
                    onError={(e) => {
                      console.error('Error loading image:', room.image);
                      e.target.src = '/images/placeholder-room.jpg';
                      e.target.onerror = null;
                    }}
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-primary">
                      ${room.price}<small className="ms-1">/night</small>
                    </span>
                  </div>
                </div>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title text-white mb-0">{room.roomName}</h5>
                    <div className="d-flex">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="text-warning" style={{ fill: '#ffc107' }} size={14} />
                      ))}
                    </div>
                  </div>
                  <p className="card-text text-white-75 small mb-2" style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {room.description}
                  </p>
                  <div className="mt-auto">
                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {facility.map((fac, index) => (
                        <span key={index} className="badge bg-light text-white small">
                          {fac.icon} {fac.quantity} {fac.facility}
                        </span>
                      ))}
                    </div>
                    <div className="d-flex gap-2">
                      <Link 
                        to={`/booking-page/${room._id}`} 
                        className="btn btn-primary btn-sm flex-grow-1"
                      >
                        <FiShoppingCart className="me-1" size={14} />
                        Book Now
                      </Link>
                      <button 
                        onClick={() => handleViewDetails(room)}
                        className="btn btn-outline-primary btn-sm details-btn"
                      >
                        <FiEye className="me-1" size={14} />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!loading && rooms.length === 0 && (
          <div className="text-center py-5">
            <FiInfo size={48} className="text-muted mb-3" />
            <h3 className="h5">No rooms found</h3>
            <p className="text-muted">Please try again later</p>
          </div>
        )}

        {selectedRoom && (
          <RoomDetailsModal 
            room={selectedRoom} 
            onClose={handleCloseModal}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default RoomPage;
