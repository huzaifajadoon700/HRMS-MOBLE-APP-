import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiUsers, FiMapPin, FiClock, FiInfo, FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./TableReservation.css";

const TableReservation = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/tables");
      setTables(response.data);
    } catch (error) {
      setError("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 3;
      return nextIndex >= tables.length ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - 3;
      return nextIndex < 0 ? Math.max(0, tables.length - 3) : nextIndex;
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-table.jpg";
    try {
      if (imagePath.startsWith("http")) return imagePath;
      const cleanPath = imagePath.replace(/^\/+/, "");
      return cleanPath.includes("uploads")
        ? `http://localhost:8080/${cleanPath}`
        : `http://localhost:8080/uploads/${cleanPath}`;
    } catch (error) {
      console.error("Error formatting image URL:", error);
      return "/images/placeholder-table.jpg";
    }
  };

  const visibleTables = tables.slice(currentIndex, currentIndex + 3);

  if (loading) {
    return (
      <section className="tables-section">
        <div className="container">
          <div className="section-header">
            <h6 className="section-subtitle">Our Tables</h6>
            <h2 className="section-title">Featured Dining Spaces</h2>
          </div>
          <div className="tables-slider">
            <div className="tables-container">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="table-card">
                  <div className="skeleton-loader">
                    <div className="skeleton-image" />
                    <div className="skeleton-content">
                      <div className="skeleton-title" />
                      <div className="skeleton-text" />
                      <div className="skeleton-text" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="tables-section">
        <div className="container">
          <div className="alert alert-warning d-flex align-items-center">
            <FiInfo className="me-2" />
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="tables-section">
      <div className="container">
        <div className="section-header">
          <h6 className="section-subtitle">Our Tables</h6>
          <h2 className="section-title">Featured Dining Spaces</h2>
        </div>

        <div className="tables-slider">
          <button className="slider-btn prev" onClick={prevSlide}>
            <FiChevronLeft />
          </button>

          <div className="tables-container">
            {visibleTables.map((table) => (
              <div key={table._id} className="table-card">
                <div className="image-wrapper">
                  <img
                    src={getImageUrl(table.image)}
                    alt={table.tableName}
                    className="table-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/images/placeholder-table.jpg";
                      e.target.onerror = null;
                    }}
                  />
                  <div className="image-overlay" />
                  <div className="price-badge">
                    ${table.price}<small>/hour</small>
                  </div>
                </div>
                
                <div className="card-body">
                  <div className="content-wrapper">
                    <h3 className="table-title">{table.tableName}</h3>
                    
                    <div className="table-features">
                      <div className="feature">
                        <FiUsers className="feature-icon" />
                        <span>{table.capacity} seats</span>
                      </div>
                      <div className="feature">
                        <FiMapPin className="feature-icon" />
                        <span>{table.location}</span>
                      </div>
                      <div className="feature">
                        <FiClock className="feature-icon" />
                        <span>{table.availability}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <Link to="/reserve-table" className="btn btn-primary">
                      Reserve Table
                      <FiArrowRight className="btn-icon" />
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

        {tables.length === 0 && (
          <div className="empty-state">
            <FiInfo size={48} className="empty-icon" />
            <h3>No tables available</h3>
            <p>Please check back later</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TableReservation;