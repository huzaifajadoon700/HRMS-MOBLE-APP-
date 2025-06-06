import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import './MainContentCarousel.css';

const MainContentCarousel = () => {
  return (
    <div className="hero-section">
      <img
        src="https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1920"
        alt="Luxury hotel view"
        className="hero-image"
      />
      <div className="gradient-overlay" />
      <div className="hero-content">
        <p className="hero-subtitle">WELCOME TO LUXURY</p>
        <h1 className="hero-title">Experience the Ultimate in Hotel Comfort</h1>
        <p className="hero-description">Discover unparalleled luxury and comfort in our world-class accommodations</p>
        <div className="hero-buttons">
          <Link to="/rooms" className="hero-btn primary">
            Book Room
            <FiArrowRight />
          </Link>
          <Link to="/order-food" className="hero-btn primary">
            Order Food
            <FiArrowRight />
          </Link>
          <Link to="/reserve-table" className="hero-btn primary">
            Reserve Table
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainContentCarousel; 