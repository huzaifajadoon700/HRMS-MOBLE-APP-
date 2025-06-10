import React, { useState } from 'react';
import { Card, Badge, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FiStar, FiShoppingCart, FiHeart, FiInfo, FiClock, FiAward } from 'react-icons/fi';
import { recommendationHelpers } from '../../api/recommendations';
import './RecommendationCard.css';

const RecommendationCard = ({ 
  recommendation, 
  onAddToCart, 
  onRate, 
  showReason = true,
  showConfidence = true,
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [isRating, setIsRating] = useState(false);

  const {  score, reason, confidence } = recommendation;
  // Now all recommendations have a clean, consistent structure
  const menuItem = recommendation;



  // Ensure we have valid menu item data
  if (!menuItem || !menuItem.name) {
    console.warn('Invalid menu item data:', recommendation);
    return null; // Don't render if no valid data
  }

  // Format data for display
  const spiceInfo = recommendationHelpers.formatSpiceLevel(menuItem.spiceLevel);
  const dietaryTags = recommendationHelpers.formatDietaryTags(menuItem.dietaryTags || []);
  const confidenceInfo = recommendationHelpers.formatConfidence(confidence);
  const reasonText = recommendationHelpers.formatReason(reason);
  const starRating = recommendationHelpers.getStarRating(score || menuItem.averageRating || 4.5);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(menuItem);
    }
  };

  const handleRating = (rating) => {
    setCurrentRating(rating);
    if (onRate) {
      onRate(menuItem._id, rating);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder-food.jpg";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `http://localhost:8080${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
  };

  return (
    <Card 
      className={`recommendation-card ${className} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="recommendation-image-container">
        <img
          src={getImageUrl(menuItem.image)}
          alt={menuItem.name}
          className="recommendation-image"
          onError={(e) => {
            e.target.src = "/placeholder-food.jpg";
            e.target.onerror = null;
          }}
        />
        
        {/* Overlay Badges */}
        <div className="image-overlay">
          {/* Confidence Badge */}
          {showConfidence && (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{confidenceInfo.text}</Tooltip>}
            >
              <Badge 
                className="confidence-badge"
                style={{ backgroundColor: confidenceInfo.color }}
              >
                {confidenceInfo.icon}
              </Badge>
            </OverlayTrigger>
          )}

          {/* Score Badge */}
          <div className="score-badge">
            <FiStar className="star-icon" />
            {starRating.rating}
          </div>

          {/* Price Badge */}
          <div className="price-badge">
            Rs. {menuItem.price?.toFixed(0)}
          </div>
        </div>

        {/* Availability Overlay */}
        {!menuItem.availability && (
          <div className="unavailable-overlay">
            <span>Currently Unavailable</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <Card.Body className="recommendation-body">
        {/* Header */}
        <div className="recommendation-header">
          <h5 className="recommendation-title">{menuItem.name}</h5>
          {showReason && (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>{reasonText}</Tooltip>}
            >
              <FiInfo className="reason-icon" />
            </OverlayTrigger>
          )}
        </div>

        {/* Description */}
        <p className="recommendation-description">
          {menuItem.description || "Delicious Pakistani cuisine prepared with authentic spices and fresh ingredients."}
        </p>

        {/* Tags Row */}
        <div className="tags-row">
          {/* Cuisine Badge */}
          <Badge variant="outline-primary" className="cuisine-badge">
            🍛 {menuItem.cuisine || 'Pakistani'}
          </Badge>

          {/* Spice Level */}
          <Badge 
            variant="outline-warning" 
            className="spice-badge"
            style={{ color: spiceInfo.color, borderColor: spiceInfo.color }}
          >
            {spiceInfo.emoji} {spiceInfo.text}
          </Badge>

          {/* Preparation Time */}
          {menuItem.preparationTime && (
            <Badge variant="outline-info" className="time-badge">
              <FiClock size={12} /> {menuItem.preparationTime}min
            </Badge>
          )}
        </div>

        {/* Dietary Tags */}
        {dietaryTags.length > 0 && (
          <div className="dietary-tags">
            {dietaryTags.map((tag, index) => (
              <Badge 
                key={index}
                variant="outline-success" 
                className="dietary-badge"
                style={{ color: tag.color, borderColor: tag.color }}
              >
                {tag.emoji} {tag.text}
              </Badge>
            ))}
          </div>
        )}

        {/* Star Rating Display */}
        <div className="star-rating-display">
          {[...Array(starRating.full)].map((_, i) => (
            <FiStar key={i} className="star filled" />
          ))}
          {starRating.half > 0 && <FiStar className="star half" />}
          {[...Array(starRating.empty)].map((_, i) => (
            <FiStar key={i + starRating.full + starRating.half} className="star empty" />
          ))}
          <span className="rating-text">
            ({menuItem.totalRatings || 0} reviews)
          </span>
        </div>

        {/* Interactive Rating */}
        {isRating && (
          <div className="interactive-rating">
            <span>Rate this dish:</span>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`rating-star ${star <= currentRating ? 'active' : ''}`}
                  onClick={() => handleRating(star)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="recommendation-actions">
          <Button
            variant="primary"
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={!menuItem.availability}
          >
            <FiShoppingCart className="btn-icon" />
            Add to Cart
          </Button>

          <Button
            variant="outline-secondary"
            className="rate-btn"
            onClick={() => setIsRating(!isRating)}
          >
            <FiStar className="btn-icon" />
            Rate
          </Button>

          <Button
            variant="outline-danger"
            className="favorite-btn"
            size="sm"
          >
            <FiHeart />
          </Button>
        </div>

        {/* Recommendation Reason */}
        {showReason && (
          <div className="recommendation-reason">
            <small className="text-muted">
              <FiAward className="reason-icon" />
              {reasonText}
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecommendationCard;
