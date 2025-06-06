import React from "react";
import { about } from "../data/Data";
import { FiArrowUpRight } from "react-icons/fi";
import "./About.css"; // Create this CSS file
import { Link } from "react-router-dom";

export default function About() {
  return (
    <section className="about-section">
      <div className="container">
        <div className="content-grid">
          {/* Text Content */}
          <div className="text-content">
            <span className="section-subtitle">About Us</span>
            <h2 className="section-title">
              Welcome to <span className="text-accent">HRMS</span>
            </h2>
            <p className="description">
              HRMS is a comprehensive platform designed to simplify hotel and
              restaurant management, enabling seamless operations and
              exceptional guest experiences.
            </p>

            {/* Stats Grid */}
            <div className="stats-grid">
              {about.map((item, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-icon">{item.icon}</div>
                  <div className="stat-content">
                    <div className="stat-number">{item.count}</div>
                    <p className="stat-text">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/about" className="cta-button">
              Learn More
              <FiArrowUpRight className="cta-icon" size={14} />
            </Link>
          </div>

          {/* Image Gallery */}
          <div className="image-gallery">
            <div className="gallery-grid">
              <div className="gallery-item main-image">
                <img
                  src="/assets/img/about-1.jpg"
                  alt="Hotel management system"
                  loading="lazy"
                />
                <div className="image-overlay" />
              </div>
              <div className="gallery-item secondary-image">
                <img
                  src="/assets/img/about-2.jpg"
                  alt="Restaurant analytics"
                  loading="lazy"
                />
              </div>
              <div className="gallery-item tertiary-image">
                <img
                  src="/assets/img/about-3.jpg"
                  alt="Mobile experience"
                  loading="lazy"
                />
              </div>
              <div className="gallery-item quaternary-image">
                <img
                  src="/assets/img/about-4.jpg"
                  alt="Team collaboration"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}