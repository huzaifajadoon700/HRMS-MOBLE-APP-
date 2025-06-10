import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { FiHome, FiCalendar, FiShoppingBag, FiStar, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import TestimonialPage from './TestimonialPage';
import Slider from '../components/home/Slider';
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import { recommendationHelpers } from '../api/recommendations';
import './Home.css';

const Home = () => {
  return (
    <PageLayout>
      {/* Hero Section */}
      <div className="modern-hero-section">
        <div
          className="hero-background"
          style={{
            backgroundImage: `linear-gradient(rgba(11, 20, 38, 0.7), rgba(17, 34, 64, 0.8)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '20px',
            padding: '4rem 2rem',
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="hero-content text-center">
            <h1 className="modern-hero-title">
              Welcome to <span className="gradient-text">Luxury Hotel</span>
            </h1>
            <p className="modern-hero-subtitle">
              Experience world-class hospitality with our premium rooms, exquisite dining, and personalized service
            </p>
            <div className="hero-stats">
              <div className="stat-item">
                <FiStar className="stat-icon" />
                <span className="stat-number">4.9</span>
                <span className="stat-label">Rating</span>
              </div>
              <div className="stat-item">
                <FiUsers className="stat-icon" />
                <span className="stat-number">10K+</span>
                <span className="stat-label">Happy Guests</span>
              </div>
              <div className="stat-item">
                <FiTrendingUp className="stat-icon" />
                <span className="stat-number">95%</span>
                <span className="stat-label">Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <Container fluid className="px-0">
        <div className="section-header text-center mb-5">
          <h2 className="section-title">Our Premium Services</h2>
          <p className="section-subtitle">Choose from our range of luxury services designed for your comfort</p>
        </div>

        <Row className="g-4 mb-5">
          <Col lg={4} md={6}>
            <Card className="modern-service-card room-service">
              <div className="service-image-container">
                <img
                  src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Luxury Room"
                  className="service-image"
                />
                <div className="service-overlay">
                  <FiHome className="service-icon" size={48} />
                </div>
              </div>
              <Card.Body className="service-content">
                <h3 className="service-title">Luxury Rooms</h3>
                <p className="service-description">
                  Experience ultimate comfort in our beautifully designed rooms with premium amenities and stunning views.
                </p>
                <div className="service-features">
                  <span className="feature-tag">🛏️ King Size Beds</span>
                  <span className="feature-tag">🌊 Ocean View</span>
                  <span className="feature-tag">📶 Free WiFi</span>
                </div>
                <Link to="/rooms" className="service-btn">
                  Book Now
                  <FiHome className="btn-icon" />
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={6}>
            <Card className="modern-service-card dining-service">
              <div className="service-image-container">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Fine Dining"
                  className="service-image"
                />
                <div className="service-overlay">
                  <FiCalendar className="service-icon" size={48} />
                </div>
              </div>
              <Card.Body className="service-content">
                <h3 className="service-title">Fine Dining</h3>
                <p className="service-description">
                  Reserve your table for an unforgettable culinary journey with our award-winning chefs and sommelier.
                </p>
                <div className="service-features">
                  <span className="feature-tag">👨‍🍳 Master Chefs</span>
                  <span className="feature-tag">🍷 Wine Pairing</span>
                  <span className="feature-tag">🌟 Michelin Guide</span>
                </div>
                <Link to="/reserve-table" className="service-btn">
                  Reserve Table
                  <FiCalendar className="btn-icon" />
                </Link>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={6}>
            <Card className="modern-service-card food-service">
              <div className="service-image-container">
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Gourmet Food"
                  className="service-image"
                />
                <div className="service-overlay">
                  <FiShoppingBag className="service-icon" size={48} />
                </div>
              </div>
              <Card.Body className="service-content">
                <h3 className="service-title">Room Service</h3>
                <p className="service-description">
                  Order from our extensive menu featuring Pakistani specialties and international cuisine, delivered to your room.
                </p>
                <div className="service-features">
                  <span className="feature-tag">🍛 Pakistani Cuisine</span>
                  <span className="feature-tag">🚚 24/7 Delivery</span>
                  <span className="feature-tag">⭐ Premium Quality</span>
                </div>
                <Link to="/order-food" className="service-btn">
                  Order Now
                  <FiShoppingBag className="btn-icon" />
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* AI-Powered Food Recommendations */}
      <div className="recommendations-section">
        <PersonalizedRecommendations
          maxItems={8}
          onAddToCart={(menuItem) => {
            console.log('Add to cart:', menuItem);
          }}
          onRate={(menuItemId, rating) => {
            console.log('Rate item:', menuItemId, rating);
          }}
        />
      </div>
    </PageLayout>
  );
};

export default Home; 