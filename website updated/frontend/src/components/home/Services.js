import React, { useState } from 'react';
import './Services.css';
import { FaUtensils, FaConciergeBell, FaWineGlass, FaSwimmingPool, FaDumbbell } from 'react-icons/fa';
import { MdRoomService, MdSpa, MdBusinessCenter } from 'react-icons/md';
import { BsArrowUpRight } from 'react-icons/bs';
import { FiStar } from 'react-icons/fi';

const Services = () => {
  const [hoveredCard, setHoveredCard] = useState(null);


  const services = [
    {
      icon: <FaUtensils />,
      title: "Fine Dining",
      description: "Experience exquisite cuisine prepared by our world-class chefs using the finest ingredients sourced globally.",
      features: ["Michelin-starred chefs", "Farm-to-table ingredients", "Wine pairing"],
      color: "rgba(255, 107, 157, 0.8)",
      gradient: "linear-gradient(135deg, rgba(255, 107, 157, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%)",
      stats: { rating: "4.9", reviews: "2.1k" }
    },
    {
      icon: <MdRoomService />,
      title: "24/7 Room Service",
      description: "Enjoy our premium room service available round the clock with gourmet meals delivered to your door.",
      features: ["24/7 availability", "Gourmet menu", "15-min delivery"],
      color: "rgba(100, 255, 218, 0.8)",
      gradient: "linear-gradient(135deg, rgba(100, 255, 218, 0.2) 0%, rgba(187, 134, 252, 0.1) 100%)",
      stats: { rating: "4.8", reviews: "1.8k" }
    },
    {
      icon: <FaConciergeBell />,
      title: "Concierge Services",
      description: "Let our experienced concierge team assist you with reservations, tours, and exclusive experiences.",
      features: ["Personal assistant", "Local expertise", "VIP access"],
      color: "rgba(187, 134, 252, 0.8)",
      gradient: "linear-gradient(135deg, rgba(187, 134, 252, 0.2) 0%, rgba(100, 255, 218, 0.1) 100%)",
      stats: { rating: "4.9", reviews: "1.5k" }
    },
    {
      icon: <FaWineGlass />,
      title: "Premium Bar",
      description: "Unwind at our sophisticated rooftop bar featuring an extensive selection of fine wines and craft cocktails.",
      features: ["Craft cocktails", "Premium spirits", "Rooftop views"],
      color: "rgba(255, 193, 7, 0.8)",
      gradient: "linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 107, 157, 0.1) 100%)",
      stats: { rating: "4.7", reviews: "2.3k" }
    },
    {
      icon: <FaSwimmingPool />,
      title: "Infinity Pool",
      description: "Relax and rejuvenate in our stunning infinity pool with panoramic city views and poolside service.",
      features: ["Infinity design", "City views", "Poolside service"],
      color: "rgba(100, 255, 218, 0.8)",
      gradient: "linear-gradient(135deg, rgba(100, 255, 218, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%)",
      stats: { rating: "4.8", reviews: "1.9k" }
    },
    {
      icon: <MdSpa />,
      title: "Luxury Spa",
      description: "Indulge in our award-winning spa treatments designed to refresh your body, mind, and soul.",
      features: ["Award-winning spa", "Holistic treatments", "Expert therapists"],
      color: "rgba(255, 107, 157, 0.8)",
      gradient: "linear-gradient(135deg, rgba(255, 107, 157, 0.2) 0%, rgba(187, 134, 252, 0.1) 100%)",
      stats: { rating: "4.9", reviews: "1.7k" }
    },
    {
      icon: <FaDumbbell />,
      title: "Elite Fitness",
      description: "Stay active with our state-of-the-art fitness center featuring premium equipment and personal trainers.",
      features: ["Premium equipment", "Personal trainers", "Group classes"],
      color: "rgba(187, 134, 252, 0.8)",
      gradient: "linear-gradient(135deg, rgba(187, 134, 252, 0.2) 0%, rgba(255, 193, 7, 0.1) 100%)",
      stats: { rating: "4.6", reviews: "1.2k" }
    },
    {
      icon: <MdBusinessCenter />,
      title: "Business Center",
      description: "Conduct business seamlessly with our fully equipped business center and meeting facilities.",
      features: ["Meeting rooms", "High-speed internet", "Business support"],
      color: "rgba(255, 193, 7, 0.8)",
      gradient: "linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(100, 255, 218, 0.1) 100%)",
      stats: { rating: "4.7", reviews: "980" }
    }
  ];

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 20px rgba(100, 255, 218, 0.3); }
            50% { box-shadow: 0 0 40px rgba(100, 255, 218, 0.6); }
          }
        `}
      </style>
      <section style={{
        width: '100%',
        margin: 0,
        marginTop: '80px', // Top margin for header spacing
        padding: '3rem 0',
        background: 'linear-gradient(180deg, #0A192F 0%, #112240 50%, #0A192F 100%)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(100, 255, 218, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(187, 134, 252, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          animation: 'float 10s ease-in-out infinite reverse',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(255, 107, 157, 0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 12s ease-in-out infinite',
          zIndex: 0
        }} />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '4px',
              height: '4px',
              background: `rgba(${100 + i * 10}, ${255 - i * 5}, ${218 - i * 3}, 0.6)`,
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
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
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '2.2rem',
              fontWeight: '800',
              background: 'linear-gradient(135deg, #ffffff 0%, #64ffda 50%, #bb86fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '0.75rem',
              lineHeight: '1.1'
            }}>
              Premium Services
            </h2>

            <p style={{
              fontSize: '1rem',
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: '1.5'
            }}>
              Experience world-class hospitality with our exceptional services and amenities.
            </p>
          </div>

          {/* Services Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
            padding: '0.5rem 0'
          }}>
            {services.map((service, index) => (
              <div
                key={index}
                style={{
                  background: hoveredCard === index
                    ? service.gradient
                    : 'linear-gradient(145deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: hoveredCard === index
                    ? `1px solid ${service.color}`
                    : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '1.25rem',
                  padding: '1.25rem',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: hoveredCard === index ? 'translateY(-5px)' : 'translateY(0)',
                  boxShadow: hoveredCard === index
                    ? `0 15px 30px rgba(0, 0, 0, 0.2), 0 0 0 1px ${service.color}`
                    : '0 4px 15px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden'
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Shimmer Effect */}
                {hoveredCard === index && (
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

                {/* Icon Section */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    background: hoveredCard === index
                      ? service.color
                      : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: hoveredCard === index ? '#000' : '#fff',
                    transition: 'all 0.3s ease',
                    transform: hoveredCard === index ? 'scale(1.05)' : 'scale(1)'
                  }}>
                    {service.icon}
                  </div>

                  {/* Rating Badge */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.2rem 0.5rem',
                    background: 'rgba(255, 193, 7, 0.2)',
                    borderRadius: '0.75rem',
                    border: '1px solid rgba(255, 193, 7, 0.3)'
                  }}>
                    <FiStar style={{ color: '#ffc107', fill: '#ffc107' }} size={10} />
                    <span style={{ color: '#ffc107', fontSize: '0.7rem', fontWeight: '600' }}>
                      {service.stats.rating}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: '#fff',
                    marginBottom: '0.5rem',
                    background: hoveredCard === index
                      ? 'linear-gradient(135deg, #ffffff 0%, #bb86fc 100%)'
                      : 'none',
                    WebkitBackgroundClip: hoveredCard === index ? 'text' : 'initial',
                    WebkitTextFillColor: hoveredCard === index ? 'transparent' : '#fff',
                    backgroundClip: hoveredCard === index ? 'text' : 'initial',
                    transition: 'all 0.3s ease'
                  }}>
                    {service.title}
                  </h3>

                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {service.description}
                  </p>

                  {/* Features */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.4rem',
                    marginBottom: '1rem'
                  }}>
                    {service.features.slice(0, 2).map((feature, featureIndex) => (
                      <span
                        key={featureIndex}
                        style={{
                          padding: '0.2rem 0.5rem',
                          background: 'rgba(100, 255, 218, 0.1)',
                          border: '1px solid rgba(100, 255, 218, 0.2)',
                          borderRadius: '0.75rem',
                          fontSize: '0.7rem',
                          color: 'rgba(100, 255, 218, 0.9)',
                          fontWeight: '500'
                        }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <button style={{
                      padding: '0.5rem 1rem',
                      background: hoveredCard === index
                        ? service.color
                        : 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: hoveredCard === index ? '#000' : '#fff',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}>
                      Learn More
                    </button>

                    <div style={{
                      width: '2rem',
                      height: '2rem',
                      background: hoveredCard === index
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      transform: hoveredCard === index ? 'rotate(45deg)' : 'rotate(0deg)'
                    }}>
                      <BsArrowUpRight style={{ color: '#fff' }} size={12} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Services;