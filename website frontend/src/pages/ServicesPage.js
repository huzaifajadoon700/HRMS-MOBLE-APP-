import React from 'react';
import { FiHome, FiCoffee, FiCalendar, FiShoppingBag, FiWifi, FiUmbrella, FiTruck } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';
import '../styles/theme.css';

const ServicesPage = () => {
  const services = [
    {
      icon: <FiHome />,
      title: 'Luxury Accommodation',
      description: 'Experience comfort in our well-appointed rooms and suites with modern amenities'
    },
    {
      icon: <FiCoffee />,
      title: 'Fine Dining',
      description: 'Savor exquisite cuisine at our award-winning restaurants and bars'
    },
    {
      icon: <FiCalendar />,
      title: 'Event Planning',
      description: 'Host memorable events in our versatile meeting and banquet spaces'
    },
    {
      icon: <FiShoppingBag />,
      title: 'Room Service',
      description: '24/7 in-room dining with a diverse menu of local and international dishes'
    },
    {
      icon: <FiWifi />,
      title: 'High-Speed Internet',
      description: 'Complimentary WiFi throughout the hotel for all guests'
    },
    {
      icon: <FiUmbrella />,
      title: 'Concierge Service',
      description: 'Personalized assistance for tours, transportation, and local experiences'
    },
    {
      icon: <FiTruck />,
      title: 'Airport Transfer',
      description: 'Comfortable and reliable transportation to and from the airport'
    }
  ];

  return (
    <PageLayout>
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Our Services</h1>
        <p className="page-subtitle">
          Discover the exceptional services that make your stay unforgettable
        </p>
      </div>

      <div className="services-container">
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default ServicesPage;
