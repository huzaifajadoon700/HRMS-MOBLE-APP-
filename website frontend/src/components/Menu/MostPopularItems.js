import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiStar, FiInfo, FiArrowRight, FiShoppingCart, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./MostPopularItems.css";

const MostPopularItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-food.jpg";
    try {
      if (imagePath.startsWith("http")) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, "");
      return cleanPath.includes("uploads")
        ? `http://localhost:8080/${cleanPath}`
        : `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error("Error formatting image URL:", error);
      return "/images/placeholder-food.jpg";
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/menus");
      setMenuItems(response.data);
    } catch (error) {
      setError("Error fetching menu items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 3;
      return nextIndex >= menuItems.length ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 3;
      return nextIndex < 0 ? Math.max(0, menuItems.length - 3) : nextIndex;
    });
  };

  const renderRating = (rating = 4.5) => {
    return (
      <div className="rating-badge">
        <FiStar /> {rating.toFixed(1)}
      </div>
    );
  };

  const SkeletonLoader = () => (
    <div className="menu-item">
      <div className="skeleton-loader">
        <div className="skeleton-image" />
        <div className="skeleton-content">
          <div className="skeleton-title" />
          <div className="skeleton-text" />
          <div className="skeleton-text" />
        </div>
      </div>
    </div>
  );

  const visibleItems = menuItems.slice(currentIndex, currentIndex + 3);

  return (
    <section className="popular-items-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            Most Popular <span className="text-accent">Items</span>
          </h2>
          <p className="section-subtitle">Discover our chef's special selections</p>
        </div>

        {error && (
          <div className="error-alert">
            <FiInfo />
            {error}
          </div>
        )}

        <div className="items-slider">
          <button className="slider-btn prev" onClick={prevSlide}>
            <FiChevronLeft />
          </button>

          <div className="items-container">
            {loading ? (
              <>
                <SkeletonLoader />
                <SkeletonLoader />
                <SkeletonLoader />
              </>
            ) : (
              visibleItems.map((item) => (
                <div key={item._id} className="menu-item">
                  <div className="image-wrapper">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="item-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/images/placeholder-food.jpg";
                        e.target.onerror = null;
                      }}
                    />
                    <div className="image-overlay" />
                    {renderRating(item.rating || 4.5)}
                    <div className="price-badge">
                      ${item.price?.toFixed(2)}
                    </div>
                  </div>
                  <div className="item-content">
                    <div className="content-wrapper">
                      <h3 className="item-title">{item.name}</h3>
                      <p className="item-description">
                        {item.description || "Delicious menu item"}
                      </p>
                    </div>
                    <div className="item-actions">
                      <Link to="/order-food" className="btn btn-primary">
                        <FiShoppingCart className="btn-icon" />
                        Order Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="slider-btn next" onClick={nextSlide}>
            <FiChevronRight />
          </button>
        </div>

        {!loading && menuItems.length > 0 && (
          <div className="text-center mt-4">
            <Link to="/order-food" className="view-all-btn">
              View All Menu Items <FiArrowRight />
            </Link>
          </div>
        )}

        {!loading && menuItems.length === 0 && (
          <div className="empty-state">
            <FiInfo size={48} className="empty-icon" />
            <h3>No items available</h3>
            <p>Please check back later</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MostPopularItems;
