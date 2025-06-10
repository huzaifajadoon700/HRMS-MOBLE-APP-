import React, { useEffect } from 'react';
import { FiX, FiStar, FiMapPin, FiUsers, FiHome } from 'react-icons/fi';
import { facility } from './data/Data';
import axios from 'axios';
import './RoomDetailsModal.css';

const RoomDetailsModal = ({ room, onClose }) => {
  // Record room interaction when modal opens
  useEffect(() => {
    if (!room) return;

    const recordInteraction = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) return;

      try {
        await axios.post(
          'http://localhost:8080/api/rooms/interactions',
          {
            userId,
            roomId: room._id,
            interactionType: 'view'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } catch (error) {
        console.error('Error recording room interaction:', error);
      }
    };

    recordInteraction();
  }, [room]);

  if (!room) return null;

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

  // Format price in Pakistani Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FiX size={24} />
        </button>
        
        <div className="modal-header">
          <h2 className="modal-title">
            Room {room.roomNumber || room.roomName}
            <small className="text-muted ms-2">({room.roomType})</small>
          </h2>
          <div className="modal-rating">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`${i < (room.averageRating || 4) ? 'text-warning' : 'text-muted'}`}
                style={{ fill: i < (room.averageRating || 4) ? '#ffc107' : 'none' }}
                size={16}
              />
            ))}
            {room.totalRatings > 0 && (
              <small className="text-muted ms-2">({room.totalRatings} reviews)</small>
            )}
          </div>
        </div>

        <div className="modal-image-container">
          <img
            src={getImageUrl(room.image)}
            alt={room.roomNumber || room.roomName}
            className="modal-image"
            onError={(e) => {
              console.error('Error loading image:', room.image);
              e.target.src = '/images/placeholder-room.jpg';
              e.target.onerror = null;
            }}
          />
          <div className="modal-price">
            {formatPrice(room.price)}<small>/night</small>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-description">
            <h3>Description</h3>
            <p>{room.description}</p>
          </div>

          {/* Room Details */}
          <div className="modal-details mb-4">
            <h3>Room Details</h3>
            <div className="row">
              <div className="col-md-6">
                <div className="detail-item">
                  <FiHome className="me-2" />
                  <strong>Room Type:</strong> {room.roomType}
                </div>
                {room.capacity && (
                  <div className="detail-item">
                    <FiUsers className="me-2" />
                    <strong>Capacity:</strong> {room.capacity} guests
                  </div>
                )}
                {room.size && (
                  <div className="detail-item">
                    <FiMapPin className="me-2" />
                    <strong>Size:</strong> {room.size} sq ft
                  </div>
                )}
              </div>
              <div className="col-md-6">
                {room.bedType && (
                  <div className="detail-item">
                    <strong>Bed Type:</strong> {room.bedType}
                  </div>
                )}
                {room.floor && (
                  <div className="detail-item">
                    <strong>Floor:</strong> {room.floor}
                  </div>
                )}
                <div className="detail-item">
                  <strong>Status:</strong>
                  <span className={`badge ms-2 ${room.status === 'Available' ? 'bg-success' : 'bg-warning'}`}>
                    {room.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Room Amenities */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="modal-amenities mb-4">
              <h3>Amenities</h3>
              <div className="amenities-grid">
                {room.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    <span className="badge bg-secondary">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Features */}
          <div className="modal-features">
            <h3>Standard Features</h3>
            <div className="features-grid">
              {facility.map((fac, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-icon">{fac.icon}</span>
                  <span className="feature-text">{fac.quantity} {fac.facility}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                // Record booking interaction
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                if (token && userId) {
                  axios.post(
                    'http://localhost:8080/api/rooms/interactions',
                    {
                      userId,
                      roomId: room._id,
                      interactionType: 'booking'
                    },
                    {
                      headers: { Authorization: `Bearer ${token}` }
                    }
                  ).catch(error => console.error('Error recording booking interaction:', error));
                }
                window.location.href = `/booking-page/${room._id}`;
              }}
            >
              Book Now - {formatPrice(room.price)}/night
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal; 