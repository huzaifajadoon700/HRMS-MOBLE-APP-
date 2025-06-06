import React from 'react';
import { FiAward, FiUsers, FiCoffee, FiMapPin, FiStar, FiHeart, FiClock } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';
import './AboutUs.css';

const AboutUs = () => {
  const features = [
    {
      icon: <FiAward />,
      title: 'Award Winning',
      description: 'Recognized for excellence in hospitality and service'
    },
    {
      icon: <FiUsers />,
      title: 'Expert Team',
      description: 'Professional staff dedicated to your comfort'
    },
    {
      icon: <FiCoffee />,
      title: 'Premium Amenities',
      description: 'World-class facilities and services'
    },
    {
      icon: <FiMapPin />,
      title: 'Prime Location',
      description: 'Centrally located with easy access to attractions'
    },
    {
      icon: <FiStar />,
      title: 'Luxury Experience',
      description: 'Unparalleled comfort and sophistication'
    },
    {
      icon: <FiHeart />,
      title: 'Guest Satisfaction',
      description: 'Our top priority is your happiness'
    }
  ];

  return (
    <PageLayout>
      <div className="about-page">
        <div className="container">
          <div className="page-header">
            <h1 className="page-title">About Our Hotel</h1>
            <p className="page-subtitle">
              Experience luxury and comfort in the heart of the city
            </p>
          </div>

          <div className="about-container">
            <div className="about-content">
              <div className="about-text">
                <h2 className="section-title">Our Story</h2>
                <p className="section-description">
                  Founded in 2005, our hotel has been providing exceptional hospitality services
                  to guests from around the world. We pride ourselves on creating memorable
                  experiences through our attention to detail and commitment to excellence.
                </p>
                <p className="section-description">
                  Our mission is to provide a home away from home, where every guest feels
                  valued and cared for. We continuously strive to exceed expectations and
                  set new standards in the hospitality industry.
                </p>
              </div>

              <div className="about-text">
                <h2 className="section-title">Our Vision</h2>
                <p className="section-description">
                  We envision a world where every guest leaves with unforgettable memories
                  and a desire to return. Through innovation and dedication, we aim to
                  redefine luxury hospitality and create lasting connections with our guests.
                </p>
                <p className="section-description">
                  Our commitment to sustainability and community engagement sets us apart,
                  ensuring that our success benefits both our guests and the world around us.
                </p>
              </div>
            </div>

            <div className="about-features">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    {feature.icon}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AboutUs;
