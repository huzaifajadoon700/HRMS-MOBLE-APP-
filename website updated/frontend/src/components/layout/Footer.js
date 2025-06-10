import React, { useState } from "react";
import {
  FiMapPin, FiPhone, FiMail, FiTwitter, FiInstagram, FiFacebook,
  FiLinkedin, FiHeart, FiGithub, FiYoutube,
  FiSend, FiExternalLink
} from "react-icons/fi";
import {
  FaHotel, FaUtensils, FaConciergeBell, FaSwimmingPool,
  FaDumbbell, FaWifi
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const quickLinks = [
    { name: 'About Us', href: '/about' },
    { name: 'Our Rooms', href: '/rooms' },
    { name: 'Dining', href: '/order-food' },
    { name: 'Reserve Table', href: '/reserve-table' },
    { name: 'Contact', href: '/contact' }
  ];

  const services = [
    { icon: <FaHotel />, name: 'Luxury Rooms', href: '/rooms' },
    { icon: <FaUtensils />, name: 'Fine Dining', href: '/order-food' },
    { icon: <FaConciergeBell />, name: 'Concierge', href: '/contact' },
    { icon: <FaSwimmingPool />, name: 'Pool & Spa', href: '/about' },
    { icon: <FaDumbbell />, name: 'Fitness Center', href: '/about' },
    { icon: <FaWifi />, name: 'Free WiFi', href: '/about' }
  ];

  const socialLinks = [
    { icon: <FiTwitter />, name: 'Twitter', color: '#1DA1F2', href: 'https://twitter.com' },
    { icon: <FiInstagram />, name: 'Instagram', color: '#E4405F', href: 'https://instagram.com' },
    { icon: <FiFacebook />, name: 'Facebook', color: '#1877F2', href: 'https://facebook.com' },
    { icon: <FiLinkedin />, name: 'LinkedIn', color: '#0A66C2', href: 'https://linkedin.com' },
    { icon: <FiYoutube />, name: 'YouTube', color: '#FF0000', href: 'https://youtube.com' },
    { icon: <FiGithub />, name: 'GitHub', color: '#333', href: 'https://github.com' }
  ];

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(180deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes slideIn {
            from { transform: translateX(-20px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(100, 255, 218, 0.3); }
            50% { box-shadow: 0 0 30px rgba(100, 255, 218, 0.6); }
          }
        `}
      </style>
      <footer style={{
        width: '100%',
        margin: 0,
        padding: '3rem 0 1.5rem',
        background: 'linear-gradient(180deg, #112240 0%, #0A192F 100%)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid rgba(100, 255, 218, 0.2)'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '15%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(100, 255, 218, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 15s ease-in-out infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '70%',
          right: '20%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(187, 134, 252, 0.02) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: 'float 18s ease-in-out infinite reverse',
          zIndex: 0
        }} />

        {/* Floating Particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '2px',
              height: '2px',
              background: `rgba(${100 + i * 10}, ${255 - i * 6}, ${218 - i * 4}, 0.3)`,
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${10 + Math.random() * 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`,
              zIndex: 1
            }}
          />
        ))}

        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Main Footer Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* Brand Section */}
            <div style={{ maxWidth: '350px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(135deg, #bb86fc 0%, #64ffda 100%)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 3s ease-in-out infinite'
                }}>
                  <FaHotel style={{ color: '#0a0a0a', fontSize: '1rem' }} />
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #ffffff 0%, #bb86fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  margin: 0
                }}>
                  Night Elegance
                </h3>
              </div>

              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                marginBottom: '1.5rem'
              }}>
                Experience luxury and comfort at our premier hotel with world-class amenities and exceptional service.
              </p>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'rgba(100, 255, 218, 0.1)',
                    borderRadius: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(100, 255, 218, 0.2)'
                  }}>
                    <FiMapPin style={{ color: '#64ffda', fontSize: '0.8rem' }} />
                  </div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>
                    123 Luxury Street, Lahore
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'rgba(187, 134, 252, 0.1)',
                    borderRadius: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(187, 134, 252, 0.2)'
                  }}>
                    <FiPhone style={{ color: '#bb86fc', fontSize: '0.8rem' }} />
                  </div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>
                    +92 336 945 769
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '2rem',
                    height: '2rem',
                    background: 'rgba(255, 107, 157, 0.1)',
                    borderRadius: '0.4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 107, 157, 0.2)'
                  }}>
                    <FiMail style={{ color: '#ff6b9d', fontSize: '0.8rem' }} />
                  </div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8rem' }}>
                    info@nightelegance.com
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #bb86fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Quick Links
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.3rem 0',
                      transition: 'all 0.3s ease',
                      borderRadius: '0.3rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = '#64ffda';
                      e.target.style.transform = 'translateX(3px)';
                      e.target.style.background = 'rgba(100, 255, 218, 0.05)';
                      e.target.style.padding = '0.3rem 0.5rem';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                      e.target.style.transform = 'translateX(0)';
                      e.target.style.background = 'transparent';
                      e.target.style.padding = '0.3rem 0';
                    }}
                  >
                    <FiExternalLink size={12} />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #bb86fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Our Services
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {services.slice(0, 4).map((service, index) => (
                  <Link
                    key={index}
                    to={service.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.5rem',
                      textDecoration: 'none',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '0.7rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(100, 255, 218, 0.1)';
                      e.target.style.borderColor = 'rgba(100, 255, 218, 0.3)';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ color: '#64ffda', fontSize: '0.8rem' }}>
                      {service.icon}
                    </div>
                    {service.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 style={{
                fontSize: '1rem',
                fontWeight: '700',
                color: '#fff',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #ffffff 0%, #bb86fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Stay Updated
              </h4>

              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.8rem',
                marginBottom: '1rem',
                lineHeight: '1.4'
              }}>
                Subscribe for exclusive offers and updates.
              </p>

              <form onSubmit={handleSubscribe} style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  display: 'flex',
                  gap: '0.4rem',
                  marginBottom: '0.75rem'
                }}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    required
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'rgba(100, 255, 218, 0.5)';
                      e.target.style.background = 'rgba(100, 255, 218, 0.05)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.5rem 1rem',
                      background: isSubscribed
                        ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                        : 'linear-gradient(135deg, #bb86fc 0%, #64ffda 100%)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#0a0a0a',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubscribed) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 15px rgba(187, 134, 252, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {isSubscribed ? (
                      <>
                        <FiHeart size={12} />
                        Done!
                      </>
                    ) : (
                      <>
                        <FiSend size={12} />
                        Subscribe
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Social Media */}
              <div>
                <h5 style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem'
                }}>
                  Follow Us
                </h5>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {socialLinks.slice(0, 4).map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        width: '2rem',
                        height: '2rem',
                        background: hoveredSocial === index
                          ? social.color
                          : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: hoveredSocial === index ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        border: `1px solid ${hoveredSocial === index ? social.color : 'rgba(255, 255, 255, 0.1)'}`,
                        transform: hoveredSocial === index ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
                        fontSize: '0.8rem'
                      }}
                      onMouseEnter={() => setHoveredSocial(index)}
                      onMouseLeave={() => setHoveredSocial(null)}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {/* Stats */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  500+
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
                  Happy Guests
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #ff6b9d 0%, #ffc107 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  4.9
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
                  Rating
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #bb86fc 0%, #64ffda 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  24/7
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.7rem' }}>
                  Support
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.8rem'
            }}>
              <p style={{ margin: 0 }}>
                © {new Date().getFullYear()} Night Elegance. All rights reserved. |
                <span style={{ color: '#64ffda', marginLeft: '0.5rem' }}>
                  Made with <FiHeart style={{ color: '#ff6b9d', display: 'inline' }} /> for luxury hospitality
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;