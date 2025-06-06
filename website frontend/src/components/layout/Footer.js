import React from "react";
import { FiMapPin, FiPhone, FiMail, FiTwitter, FiInstagram, FiFacebook, FiLinkedin, FiArrowRight } from "react-icons/fi";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        {/* Brand Section */}
        <div className="footer-grid">
          <div className="brand-section">
            <h3 className="brand-title">Night Elegance</h3>
            <p className="brand-description">
              Experience luxury and comfort at our premier hotel. Book your stay today and enjoy world-class amenities.
            </p>
            <div className="social-icons">
              <a href="#" className="social-link" aria-label="Twitter">
                <FiTwitter />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FiInstagram />
              </a>
              <a href="#" className="social-link" aria-label="Facebook">
                <FiFacebook />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FiLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="links-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="/rooms" className="footer-link">Rooms & Suites</a></li>
              <li><a href="/restaurant" className="footer-link">Restaurant</a></li>
              <li><a href="/spa" className="footer-link">Spa & Wellness</a></li>
              <li><a href="/events" className="footer-link">Events</a></li>
              <li><a href="/contact" className="footer-link">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="contact-section">
            <h4 className="footer-title">Contact Us</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FiMapPin className="contact-icon" />
                <span>123 Luxury Avenue, City</span>
              </div>
              <div className="contact-item">
                <FiPhone className="contact-icon" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <FiMail className="contact-icon" />
                <span>info@nightelegance.com</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="newsletter-section">
            <h4 className="footer-title">Newsletter</h4>
            <p className="newsletter-text">Subscribe for exclusive offers and updates</p>
            <form className="newsletter-form">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="newsletter-input" 
              />
              <button type="submit" className="newsletter-button">
                <FiArrowRight />
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p className="copyright-text">
            © {new Date().getFullYear()} Night Elegance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;