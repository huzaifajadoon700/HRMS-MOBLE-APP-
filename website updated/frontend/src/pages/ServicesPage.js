import React, { useState } from 'react';
import { FiHome, FiCoffee, FiCalendar, FiShoppingBag, FiWifi, FiUmbrella, FiTruck, FiStar, FiArrowRight } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';

const ServicesPage = () => {
  const [hoveredService, setHoveredService] = useState(null);

  const services = [
    {
      icon: <FiHome />,
      title: 'Luxury Accommodation',
      description: 'Experience comfort in our well-appointed rooms and suites with modern amenities and premium facilities',
      color: '#64ffda',
      bgColor: 'rgba(100, 255, 218, 0.1)',
      rating: '4.9'
    },
    {
      icon: <FiCoffee />,
      title: 'Fine Dining',
      description: 'Savor exquisite cuisine at our award-winning restaurants and bars with world-class chefs',
      color: '#bb86fc',
      bgColor: 'rgba(187, 134, 252, 0.1)',
      rating: '4.8'
    },
    {
      icon: <FiCalendar />,
      title: 'Event Planning',
      description: 'Host memorable events in our versatile meeting and banquet spaces with professional coordination',
      color: '#ff6b9d',
      bgColor: 'rgba(255, 107, 157, 0.1)',
      rating: '4.9'
    },
    {
      icon: <FiShoppingBag />,
      title: 'Room Service',
      description: '24/7 in-room dining with a diverse menu of local and international dishes delivered fresh',
      color: '#ffc107',
      bgColor: 'rgba(255, 193, 7, 0.1)',
      rating: '4.7'
    },
    {
      icon: <FiWifi />,
      title: 'High-Speed Internet',
      description: 'Complimentary high-speed WiFi throughout the hotel for seamless connectivity',
      color: '#64ffda',
      bgColor: 'rgba(100, 255, 218, 0.1)',
      rating: '4.8'
    },
    {
      icon: <FiUmbrella />,
      title: 'Concierge Service',
      description: 'Personalized assistance for tours, transportation, and exclusive local experiences',
      color: '#bb86fc',
      bgColor: 'rgba(187, 134, 252, 0.1)',
      rating: '4.9'
    },
    {
      icon: <FiTruck />,
      title: 'Airport Transfer',
      description: 'Comfortable and reliable luxury transportation to and from the airport with professional drivers',
      color: '#ff6b9d',
      bgColor: 'rgba(255, 107, 157, 0.1)',
      rating: '4.6'
    }
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
          @keyframes slideInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
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
          top: '15%',
          right: '8%',
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
          left: '5%',
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
              Premium Services
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6',
              animation: 'slideInUp 0.8s ease-out 0.2s both'
            }}>
              Discover the exceptional services that make your stay unforgettable
            </p>
          </div>

          {/* Services Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            {services.map((service, index) => (
              <div
                key={index}
                style={{
                  background: 'linear-gradient(145deg, rgba(17, 34, 64, 0.6) 0%, rgba(26, 35, 50, 0.4) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: hoveredService === index
                    ? `1px solid ${service.color.replace(')', ', 0.4)')}`
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  boxShadow: hoveredService === index
                    ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px ${service.color.replace(')', ', 0.3)')}`
                    : '0 8px 25px rgba(0, 0, 0, 0.2)',
                  transform: hoveredService === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  animation: `slideInUp 0.8s ease-out ${0.4 + index * 0.1}s both`,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: '280px', // Fixed height to prevent text overflow
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={() => setHoveredService(index)}
                onMouseLeave={() => setHoveredService(null)}
              >
                {/* Shimmer Effect */}
                {hoveredService === index && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                    animation: 'shimmer 1.5s ease-in-out',
                    zIndex: 1
                  }} />
                )}

                {/* Header with Icon and Rating */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    background: service.bgColor,
                    borderRadius: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: service.color,
                    fontSize: '1.5rem',
                    transition: 'all 0.3s ease',
                    boxShadow: hoveredService === index
                      ? `0 8px 25px ${service.color.replace(')', ', 0.4)')}`
                      : 'none',
                    animation: hoveredService === index ? 'pulse 2s ease-in-out infinite' : 'none'
                  }}>
                    {service.icon}
                  </div>

                  {/* Rating Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.4rem 0.75rem',
                    background: 'rgba(255, 193, 7, 0.2)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(255, 193, 7, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <FiStar style={{ color: '#ffc107', fill: '#ffc107' }} size={12} />
                    <span style={{
                      color: '#ffc107',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      {service.rating}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: '#fff',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    transition: 'all 0.3s ease'
                  }}>
                    {service.title}
                  </h3>

                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    marginBottom: '1.5rem',
                    flex: 1
                  }}>
                    {service.description}
                  </p>

                  {/* Action Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto'
                  }}>
                    <button style={{
                      padding: '0.75rem 1.5rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Learn More
                    </button>

                    <div style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      background: hoveredService === index
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      transform: hoveredService === index ? 'rotate(45deg)' : 'rotate(0deg)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <FiArrowRight style={{ color: '#fff' }} size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ServicesPage;
