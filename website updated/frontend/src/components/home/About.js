import React from "react";
import { about } from "../data/Data";
import { FiArrowUpRight, FiStar, FiTrendingUp, FiUsers } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./About-responsive.css";

export default function About() {
  return (
    <div className="about-section-mobile" style={{
      width: '100vw',
      background: 'linear-gradient(135deg, #0A192F 0%, #112240 50%, #0A192F 100%)',
      position: 'relative',
      marginLeft: 'calc(50% - 50vw)',
      marginRight: 'calc(50% - 50vw)',
      padding: '2rem 0',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div style={{
        width: '100%',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '4rem',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {/* Text Content */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Section Header */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(100, 255, 218, 0.1)',
                padding: '0.4rem 0.8rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(100, 255, 218, 0.2)',
                marginBottom: '1rem',
                color: '#64ffda',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                <FiStar size={14} />
                <span>About HRMS Platform</span>
              </div>

              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                lineHeight: '1.2',
                marginBottom: '1rem',
                color: '#f0f4fc'
              }}>
                Comprehensive <span style={{ color: '#64ffda' }}>Hotel & Restaurant</span> Management System
              </h2>

              <p style={{
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: 'rgba(240, 244, 252, 0.8)',
                marginBottom: '1.5rem'
              }}>
                HRMS is a comprehensive platform designed to simplify hotel and restaurant management,
                enabling seamless operations and exceptional guest experiences.
              </p>
            </div>

            {/* Features Grid */}
            <div className="features-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              {[
                { icon: '⚡', title: 'Lightning Fast', desc: 'Instant Operations' },
                { icon: '🔒', title: 'Secure Platform', desc: 'Enterprise Grade' },
                { icon: '💝', title: 'Guest-Centric', desc: 'Exceptional Experience' }
              ].map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '1rem' }}>{feature.icon}</div>
                  <div>
                    <h4 style={{ color: '#f0f4fc', margin: '0 0 0.2rem 0', fontSize: '0.8rem', fontWeight: '600' }}>{feature.title}</h4>
                    <p style={{ color: 'rgba(240, 244, 252, 0.6)', margin: 0, fontSize: '0.7rem' }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              {about.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: 'rgba(100, 255, 218, 0.05)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(100, 255, 218, 0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ color: '#64ffda', fontSize: '1rem', marginBottom: '0.3rem' }}>{item.icon}</div>
                  <div style={{ color: '#f0f4fc', fontWeight: '700', fontSize: '1rem', marginBottom: '0.2rem' }}>{item.count}+</div>
                  <p style={{ color: 'rgba(240, 244, 252, 0.7)', margin: 0, fontSize: '0.65rem' }}>{item.text}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/about" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 1.2rem',
                background: 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
                color: '#0A192F',
                textDecoration: 'none',
                borderRadius: '0.4rem',
                fontWeight: '600',
                fontSize: '0.8rem',
                transition: 'all 0.3s ease'
              }}>
                <span>Explore Platform</span>
                <FiArrowUpRight size={14} />
              </Link>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(240, 244, 252, 0.8)' }}>
                  <FiTrendingUp style={{ color: '#64ffda' }} size={12} />
                  <span style={{ fontSize: '0.7rem' }}>99.9% Uptime</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(240, 244, 252, 0.8)' }}>
                  <FiUsers style={{ color: '#64ffda' }} size={12} />
                  <span style={{ fontSize: '0.7rem' }}>500+ Hotels</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="gallery-grid" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '0.75rem',
            height: '400px',
            width: '100%'
          }}>
            <div className="gallery-main" style={{
              gridRow: '1 / 3',
              position: 'relative',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '1px solid rgba(100, 255, 218, 0.1)',
              background: 'rgba(100, 255, 218, 0.02)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Luxury Hotel Lobby"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '0.75rem',
                left: '0.75rem',
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#f0f4fc',
                padding: '0.4rem 0.8rem',
                borderRadius: '0.3rem',
                fontSize: '0.7rem',
                fontWeight: '600'
              }}>
                Hotel Management
              </div>
            </div>

            <div style={{
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '1px solid rgba(100, 255, 218, 0.1)',
              position: 'relative',
              background: 'rgba(100, 255, 218, 0.02)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Fine Dining Restaurant"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '0.4rem',
                left: '0.4rem',
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#f0f4fc',
                padding: '0.2rem 0.4rem',
                borderRadius: '0.2rem',
                fontSize: '0.6rem',
                fontWeight: '600'
              }}>
                Restaurant
              </div>
            </div>

            <div style={{
              borderRadius: '0.5rem',
              overflow: 'hidden',
              border: '1px solid rgba(100, 255, 218, 0.1)',
              position: 'relative',
              background: 'rgba(100, 255, 218, 0.02)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                alt="Hotel Room"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '0.4rem',
                left: '0.4rem',
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#f0f4fc',
                padding: '0.2rem 0.4rem',
                borderRadius: '0.2rem',
                fontSize: '0.6rem',
                fontWeight: '600'
              }}>
                Rooms
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}