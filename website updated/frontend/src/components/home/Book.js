import React from "react";
import { FiCalendar, FiUser,  FiArrowRight } from "react-icons/fi";
import "./Book.css"; // Create this CSS file

export default function Book() {
  return (
    <div className="booking-container">
      <div className="glass-card">
        <div className="booking-form">
          <div className="form-grid">
            {/* Check-in Date */}
            <div className="input-group">
              <FiCalendar className="input-icon" />
              <input
                type="date"
                className="modern-input"
                aria-label="Check-in date"
              />
              <span className="input-label">Check-in</span>
            </div>

            {/* Check-out Date */}
            <div className="input-group">
              <FiCalendar className="input-icon" />
              <input
                type="date"
                className="modern-input"
                aria-label="Check-out date"
              />
              <span className="input-label">Check-out</span>
            </div>

            {/* Adults Select */}
            <div className="input-group">
              <FiUser className="input-icon" />
              <select className="modern-select" aria-label="Number of adults">
                <option value="1">1 Adult</option>
                <option value="2">2 Adults</option>
                <option value="3">3 Adults</option>
              </select>
              <span className="input-label"></span>
            </div>

            {/* Children Select */}
            <div className="input-group">
              <FiUser className="input-icon" />
              <select className="modern-select" aria-label="Number of children">
                <option value="0">0 Children</option>
                <option value="1">1 Child</option>
                <option value="2">2 Children</option>
                <option value="3">3 Children</option>
              </select>
              <span className="input-label"></span>
            </div>

            {/* Submit Button */}
            <button className="gradient-button">
              <span>Check Availability</span>
              <FiArrowRight className="button-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}