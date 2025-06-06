import React from 'react';
import { FiX, FiStar, FiMapPin, FiUsers, FiHome } from 'react-icons/fi';
import { facility } from './data/Data';
import './RoomDetailsModal.css';

const RoomDetailsModal = ({ room, onClose }) => {
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <FiX size={24} />
        </button>
        
        <div className="modal-header">
          <h2 className="modal-title">{room.roomName}</h2>
          <div className="modal-rating">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className="text-warning" size={16} />
            ))}
          </div>
        </div>

        <div className="modal-image-container">
          <img 
            src={getImageUrl(room.image)} 
            alt={room.roomName} 
            className="modal-image"
            onError={(e) => {
              console.error('Error loading image:', room.image);
              e.target.src = '/images/placeholder-room.jpg';
              e.target.onerror = null;
            }}
          />
          <div className="modal-price">
            ${room.price}<small>/night</small>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-description">
            <h3>Description</h3>
            <p>{room.description}</p>
          </div>

          <div className="modal-features">
            <h3>Features</h3>
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
            <button className="btn btn-primary" onClick={() => window.location.href = `/booking-page/${room._id}`}>
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsModal; 