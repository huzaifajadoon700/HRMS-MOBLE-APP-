import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiStar, FiInfo, FiShoppingCart, FiEye, FiWifi, FiCoffee, FiTv, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Rooms.css";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-room.jpg";
    try {
      if (imagePath.startsWith("http")) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, "");
      return cleanPath.includes("uploads")
        ? `http://localhost:8080/${cleanPath}`
        : `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error("Error formatting image URL:", error);
      return "/images/placeholder-room.jpg";
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/rooms");
        setRooms(response.data);
      } catch (error) {
        setError("Failed to load rooms. Please try again.");
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 3;
      return nextIndex >= rooms.length ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 3;
      return nextIndex < 0 ? Math.max(0, rooms.length - 3) : nextIndex;
    });
  };

  const renderRoomFeatures = (room) => {
    const features = [
      { icon: <FiWifi />, label: "Free WiFi" },
      { icon: <FiCoffee />, label: "Coffee Maker" },
      { icon: <FiTv />, label: "Smart TV" }
    ];

    return (
      <div className="d-flex flex-wrap gap-2 mb-3">
        {features.map((feature, index) => (
          <span key={index} className="facility-badge">
            {feature.icon} {feature.label}
          </span>
        ))}
      </div>
    );
  };

  const renderRating = (rating = 5) => {
    return (
      <div className="d-flex align-items-center gap-1">
        {[...Array(rating)].map((_, i) => (
          <FiStar key={i} className="text-warning" style={{ fill: '#ffc107' }} />
        ))}
      </div>
    );
  };

  const visibleRooms = rooms.slice(currentIndex, currentIndex + 3);

  return (
    <section className="rooms-section">
      <div className="container">
        <div className="section-header">
          <h6 className="section-subtitle">Our Accommodations</h6>
          <h2 className="section-title">Experience Luxury and Comfort</h2>
        </div>

        {error && (
          <div className="alert alert-warning d-flex align-items-center mb-4">
            <FiInfo className="me-2" />
            {error}
          </div>
        )}

        <div className="rooms-slider">
          <button className="slider-btn prev" onClick={prevSlide}>
            <FiChevronLeft />
          </button>
          
          <div className="slider-container">
            {loading
              ? Array(3).fill().map((_, index) => (
                  <div key={index} className="card h-100">
                    <div className="skeleton-loader">
                      <div className="skeleton-image" />
                      <div className="skeleton-content">
                        <div className="skeleton-title" />
                        <div className="skeleton-text" />
                        <div className="skeleton-text" />
                      </div>
                    </div>
                  </div>
                ))
              : visibleRooms.map((room) => (
                  <div key={room._id} className="card h-100">
                    <div className="position-relative">
                      <img
                        src={getImageUrl(room.image)}
                        className="card-img-top"
                        alt={room.roomName}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/images/placeholder-room.jpg";
                          e.target.onerror = null;
                        }}
                      />
                      <div className="position-absolute top-0 end-0 m-3">
                        <span className="price-badge">
                          ${room.price}<small>/night</small>
                        </span>
                      </div>
                    </div>
                    
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title">{room.roomName}</h5>
                        {renderRating(5)}
                      </div>
                      
                      <p className="card-text">
                        {room.description?.slice(0, 100)}...
                      </p>

                      {renderRoomFeatures(room)}

                      <div className="mt-auto d-flex gap-2">
                        <Link 
                          to="/rooms" 
                          className="btn btn-primary flex-grow-1"
                        >
                          <FiShoppingCart className="me-2" />
                          Book Now
                        </Link>
                        <Link 
                          to={`/room-details/${room._id}`} 
                          className="btn btn-outline-primary"
                        >
                          <FiEye />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          <button className="slider-btn next" onClick={nextSlide}>
            <FiChevronRight />
          </button>
        </div>

        {!loading && rooms.length === 0 && (
          <div className="text-center py-5">
            <FiInfo size={48} className="text-muted mb-3" />
            <h3 className="h5">No rooms available</h3>
            <p className="text-muted">Please check back later</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Rooms;
