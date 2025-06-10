import React, { useState } from 'react';
import {
  FiMessageSquare,
  FiStar,
  FiThumbsUp,
  FiHeart,
  FiCheckCircle,
  FiUser,
  FiTrendingUp,
  FiAward,
  FiSmile
} from 'react-icons/fi';
import './Feedback.css';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    visitDate: '',
    rating: 0,
    category: 'general',
    comment: '',
    recommend: null,
    anonymous: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);

  const feedbackCategories = [
    { value: 'general', label: 'General Experience', icon: <FiSmile />, color: '#64ffda' },
    { value: 'room', label: 'Room & Accommodation', icon: <FiUser />, color: '#4CAF50' },
    { value: 'service', label: 'Service Quality', icon: <FiAward />, color: '#2196F3' },
    { value: 'food', label: 'Food & Dining', icon: <FiHeart />, color: '#FF9800' },
    { value: 'facilities', label: 'Facilities & Amenities', icon: <FiTrendingUp />, color: '#9C27B0' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your feedback submission logic here
    console.log('Feedback submitted:', formData);
    setSubmitted(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleStarClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleStarHover = (rating) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return texts[rating] || 'Rate your experience';
  };

  if (submitted) {
    return (
      <div className="feedback-success-page">
        <div className="success-container">
          <div className="success-animation">
            <FiCheckCircle className="success-icon" />
          </div>
          <h1>Thank You for Your Feedback!</h1>
          <p>Your valuable feedback has been submitted successfully. We truly appreciate you taking the time to share your experience with us.</p>
          <div className="success-stats">
            <div className="stat-item">
              <FiThumbsUp className="stat-icon" />
              <span>Your rating: {formData.rating}/5 stars</span>
            </div>
            <div className="stat-item">
              <FiMessageSquare className="stat-icon" />
              <span>Category: {feedbackCategories.find(cat => cat.value === formData.category)?.label}</span>
            </div>
          </div>
          <div className="success-actions">
            <button onClick={() => setSubmitted(false)} className="btn-primary">
              Submit Another Feedback
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-feedback-page">
      {/* Hero Section */}
      <section className="feedback-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Share Your Experience</h1>
          <p className="hero-subtitle">
            Your feedback helps us improve and provide better service.
            We value every opinion and suggestion.
          </p>
        </div>
      </section>

      {/* Feedback Form Section */}
      <section className="feedback-form-section">
        <div className="container-fluid">
          <div className="feedback-content-grid">
            {/* Main Feedback Form */}
            <div className="feedback-form-container">
              <div className="form-header">
                <h2>Tell Us About Your Experience</h2>
                <p>Your honest feedback helps us serve you better</p>
              </div>

              <form onSubmit={handleSubmit} className="modern-feedback-form">
                {/* Personal Information */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FiUser className="section-icon" />
                    Contact Information
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="form-control"
                        required={!formData.anonymous}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className="form-control"
                        required={!formData.anonymous}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="visitDate">Visit Date</label>
                      <input
                        type="date"
                        id="visitDate"
                        name="visitDate"
                        value={formData.visitDate}
                        onChange={handleInputChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="anonymous"
                        checked={formData.anonymous}
                        onChange={handleInputChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-custom"></span>
                      Submit feedback anonymously
                    </label>
                  </div>
                </div>

                {/* Rating Section */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FiStar className="section-icon" />
                    Overall Rating
                  </h3>

                  <div className="rating-container">
                    <div className="rating-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${
                            (hoveredStar || formData.rating) >= star ? 'active' : ''
                          }`}
                          onClick={() => handleStarClick(star)}
                          onMouseEnter={() => handleStarHover(star)}
                          onMouseLeave={handleStarLeave}
                        >
                          <FiStar />
                        </button>
                      ))}
                    </div>
                    <div className="rating-text">
                      {getRatingText(hoveredStar || formData.rating)}
                    </div>
                  </div>
                </div>

                {/* Category Selection */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FiMessageSquare className="section-icon" />
                    Feedback Category
                  </h3>

                  <div className="category-grid">
                    {feedbackCategories.map((category) => (
                      <label
                        key={category.value}
                        className={`category-option ${
                          formData.category === category.value ? 'selected' : ''
                        }`}
                        style={{ '--category-color': category.color }}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={formData.category === category.value}
                          onChange={handleInputChange}
                          className="category-input"
                        />
                        <div className="category-content">
                          <div className="category-icon">
                            {category.icon}
                          </div>
                          <span className="category-label">{category.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Detailed Feedback */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FiMessageSquare className="section-icon" />
                    Your Detailed Feedback
                  </h3>

                  <div className="form-group">
                    <label htmlFor="comment">Share your thoughts and suggestions</label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      placeholder="Tell us about your experience, what you liked, and how we can improve..."
                      className="form-control"
                      rows="6"
                      required
                    />
                  </div>
                </div>

                {/* Recommendation */}
                <div className="form-section">
                  <h3 className="section-title">
                    <FiThumbsUp className="section-icon" />
                    Would you recommend us?
                  </h3>

                  <div className="recommendation-options">
                    <label className={`recommend-option ${formData.recommend === true ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="recommend"
                        value="true"
                        checked={formData.recommend === true}
                        onChange={() => setFormData(prev => ({ ...prev, recommend: true }))}
                        className="recommend-input"
                      />
                      <div className="recommend-content">
                        <FiThumbsUp className="recommend-icon" />
                        <span>Yes, I would recommend</span>
                      </div>
                    </label>

                    <label className={`recommend-option ${formData.recommend === false ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="recommend"
                        value="false"
                        checked={formData.recommend === false}
                        onChange={() => setFormData(prev => ({ ...prev, recommend: false }))}
                        className="recommend-input"
                      />
                      <div className="recommend-content">
                        <FiMessageSquare className="recommend-icon" />
                        <span>No, needs improvement</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <button type="submit" className="submit-feedback-btn">
                    <FiCheckCircle className="btn-icon" />
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>

            {/* Feedback Info Sidebar */}
            <div className="feedback-info-sidebar">
              <div className="info-card">
                <div className="info-header">
                  <FiHeart className="info-icon" />
                  <h3>Why Your Feedback Matters</h3>
                </div>
                <p>Your feedback helps us understand what we're doing well and where we can improve. Every review makes a difference in enhancing our service quality.</p>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <FiAward className="info-icon" />
                  <h3>Our Commitment</h3>
                </div>
                <ul className="commitment-list">
                  <li>We read every feedback personally</li>
                  <li>Response within 24 hours</li>
                  <li>Continuous service improvement</li>
                  <li>Your privacy is protected</li>
                </ul>
              </div>

              <div className="info-card">
                <div className="info-header">
                  <FiTrendingUp className="info-icon" />
                  <h3>Recent Improvements</h3>
                </div>
                <p>Based on customer feedback, we've recently upgraded our room amenities, enhanced our dining menu, and improved our booking system.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Feedback;