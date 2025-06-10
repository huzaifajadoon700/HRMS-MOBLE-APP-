import React, { useState } from 'react';
import { FiAward, FiUsers, FiCoffee, FiMapPin, FiStar, FiHeart, FiShield } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';

const AboutUs = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    {
      icon: <FiAward />,
      title: 'Award Winning',
      description: 'Recognized for excellence in hospitality and service',
      color: '#64ffda',
      bgColor: 'rgba(100, 255, 218, 0.1)'
    },
    {
      icon: <FiUsers />,
      title: 'Expert Team',
      description: 'Professional staff dedicated to your comfort',
      color: '#bb86fc',
      bgColor: 'rgba(187, 134, 252, 0.1)'
    },
    {
      icon: <FiCoffee />,
      title: 'Premium Amenities',
      description: 'World-class facilities and services',
      color: '#ff6b9d',
      bgColor: 'rgba(255, 107, 157, 0.1)'
    },
    {
      icon: <FiMapPin />,
      title: 'Prime Location',
      description: 'Centrally located with easy access to attractions',
      color: '#ffc107',
      bgColor: 'rgba(255, 193, 7, 0.1)'
    },
    {
      icon: <FiStar />,
      title: 'Luxury Experience',
      description: 'Unparalleled comfort and sophistication',
      color: '#64ffda',
      bgColor: 'rgba(100, 255, 218, 0.1)'
    },
    {
      icon: <FiHeart />,
      title: 'Guest Satisfaction',
      description: 'Our top priority is your happiness',
      color: '#ff6b9d',
      bgColor: 'rgba(255, 107, 157, 0.1)'
    }
  ];

  const stats = [
    { number: '500+', label: 'Happy Guests', icon: <FiUsers /> },
    { number: '4.9', label: 'Rating', icon: <FiStar /> },
    { number: '15+', label: 'Years Experience', icon: <FiAward /> },
    { number: '24/7', label: 'Support', icon: <FiShield /> }
  ];

  return (
    <PageLayout>
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
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(100, 255, 218, 0.3); }
            50% { box-shadow: 0 0 20px rgba(100, 255, 218, 0.6), 0 0 30px rgba(187, 134, 252, 0.4); }
          }
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div style={{
        width: '100%',
        margin: 0,
        marginTop: '0px', // Top margin for header spacing
        padding: '3rem 0',
        background: 'linear-gradient(180deg, #0A192F 0%, #112240 50%, #0A192F 100%)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(187, 134, 252, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: 'float 8s ease-in-out infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '3%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(100, 255, 218, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(25px)',
          animation: 'float 10s ease-in-out infinite reverse',
          zIndex: 0
        }} />

        <div style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: '900',
              background: 'linear-gradient(135deg, #ffffff 0%, #64ffda 50%, #bb86fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem',
              lineHeight: '1.1',
              animation: 'slideInUp 0.8s ease-out'
            }}>
              About Night Elegance
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
              animation: 'slideInUp 0.8s ease-out 0.2s both'
            }}>
              Experience luxury and comfort in the heart of the city
            </p>
          </div>

          {/* Stats Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '4rem',
            animation: 'slideInUp 0.8s ease-out 0.4s both'
          }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.8) 0%, rgba(26, 35, 50, 0.6) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(100, 255, 218, 0.2)',
                  borderRadius: '1.5rem',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(100, 255, 218, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(100, 255, 218, 0.2)';
                }}
              >
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  background: 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem',
                  color: '#0a0a0a',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 15px rgba(100, 255, 218, 0.3)'
                }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #64ffda 0%, #bb86fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.5rem'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: hoveredFeature === index
                    ? `1px solid ${feature.color.replace(')', ', 0.4)')}`
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1.25rem',
                  padding: '2rem',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: hoveredFeature === index
                    ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px ${feature.color.replace(')', ', 0.3)')}`
                    : '0 8px 25px rgba(0, 0, 0, 0.2)',
                  transform: hoveredFeature === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  animation: `slideInUp 0.8s ease-out ${0.6 + index * 0.1}s both`
                }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  background: feature.bgColor,
                  borderRadius: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  color: feature.color,
                  fontSize: '1.5rem',
                  transition: 'all 0.3s ease',
                  boxShadow: hoveredFeature === index
                    ? `0 8px 25px ${feature.color.replace(')', ', 0.4)')}`
                    : 'none',
                  animation: hoveredFeature === index ? 'pulse 2s ease-in-out infinite' : 'none'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '800',
                  color: '#fff',
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  transition: 'all 0.3s ease'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutUs;
