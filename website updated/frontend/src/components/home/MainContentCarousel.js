import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiHome, FiCoffee, FiCalendar, FiStar } from "react-icons/fi";
import { BsShieldCheck, BsAward, BsClock } from "react-icons/bs";
import './MainContentCarousel.css';

const MainContentCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
      title: "Luxury Hotel Experience",
      subtitle: "WELCOME TO LUXURY",
      description: "Premium accommodations with Pakistani heritage"
    },
    {
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop",
      title: "Culinary Excellence Awaits",
      subtitle: "AUTHENTIC FLAVORS",
      description: "Finest Pakistani and international cuisine"
    },
    {
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop",
      title: "Elegant Dining Experience",
      subtitle: "RESERVE YOUR TABLE",
      description: "Beautiful restaurants with city views"
    }
  ];

  useEffect(() => {
    setIsLoaded(true);
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  return (
    <div className={`hero-section ${isLoaded ? 'loaded' : ''}`}>
      {/* Background Images with Parallax Effect */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`hero-background ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        />
      ))}

      {/* Enhanced Gradient Overlays */}
      <div className="gradient-overlay-primary" />
      <div className="gradient-overlay-secondary" />
      <div className="gradient-overlay-accent" />

      {/* Animated Particles */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      {/* Main Hero Content */}
      <div className="hero-content">
        <div className="hero-badge">
          <BsAward className="badge-icon" />
          <span>5-Star Luxury Hotel</span>
        </div>

        <p className="hero-subtitle">{heroSlides[currentSlide].subtitle}</p>
        <h1 className="hero-title">{heroSlides[currentSlide].title}</h1>
        <p className="hero-description">{heroSlides[currentSlide].description}</p>

        {/* Enhanced Action Buttons */}
        <div className="hero-buttons">
          <Link to="/rooms" className="hero-btn primary book-room">
            <div className="btn-icon">
              <FiHome />
            </div>
            <div className="btn-content">
              <span className="btn-title">Book Room</span>
              <span className="btn-subtitle">Luxury Stays</span>
            </div>
            <FiArrowRight className="btn-arrow" />
          </Link>

          <Link to="/order-food" className="hero-btn secondary order-food">
            <div className="btn-icon">
              <FiCoffee />
            </div>
            <div className="btn-content">
              <span className="btn-title">Order Food</span>
              <span className="btn-subtitle">Gourmet Cuisine</span>
            </div>
            <FiArrowRight className="btn-arrow" />
          </Link>

          <Link to="/reserve-table" className="hero-btn tertiary reserve-table">
            <div className="btn-icon">
              <FiCalendar />
            </div>
            <div className="btn-content">
              <span className="btn-title">Reserve Table</span>
              <span className="btn-subtitle">Fine Dining</span>
            </div>
            <FiArrowRight className="btn-arrow" />
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="trust-indicators">
          <div className="trust-item">
            <BsShieldCheck className="trust-icon" />
            <span>Secure Booking</span>
          </div>
          <div className="trust-item">
            <BsClock className="trust-icon" />
            <span>24/7 Service</span>
          </div>
          <div className="trust-item">
            <FiStar className="trust-icon" />
            <span>5-Star Rated</span>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="slide-indicators">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>


    </div>
  );
};

export default MainContentCarousel;