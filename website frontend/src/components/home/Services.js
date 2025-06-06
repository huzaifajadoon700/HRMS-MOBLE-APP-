import React from 'react';
import './Services.css';
import { FaUtensils, FaConciergeBell, FaWineGlass, FaParking } from 'react-icons/fa';
import { MdRoomService, MdSecurity } from 'react-icons/md';
import { BsArrowUpRight } from 'react-icons/bs';

const Services = () => {
  const services = [
    {
      icon: <FaUtensils />,
      title: "Fine Dining",
      description: "Experience exquisite cuisine prepared by our world-class chefs using the finest ingredients."
    },
    {
      icon: <MdRoomService />,
      title: "24/7 Room Service",
      description: "Enjoy our premium room service available round the clock for your convenience."
    },
    {
      icon: <FaConciergeBell />,
      title: "Concierge Services",
      description: "Let our experienced concierge team assist you with all your needs and requests."
    },
    {
      icon: <FaWineGlass />,
      title: "Premium Bar",
      description: "Unwind at our sophisticated bar featuring an extensive selection of fine wines and spirits."
    },
    {
      icon: <FaParking />,
      title: "Valet Parking",
      description: "Complimentary valet parking service for all our valued guests."
    },
    {
      icon: <MdSecurity />,
      title: "24/7 Security",
      description: "Rest assured with our round-the-clock security service for your peace of mind."
    }
  ];

  return (
    <section className="services-section">
      <div className="container">
        <div className="section-header">
          <h2>Our Services</h2>
          <p>Experience luxury and comfort with our premium services</p>
        </div>
        <div className="services-grid">
          {services.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="card-inner">
                <div className="icon-wrapper">
                  <div className="icon-backdrop">
                    {service.icon}
                  </div>
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <div className="hover-indicator">
                  <BsArrowUpRight className="arrow-icon" />
                </div>
              </div>
              <div className="card-overlay"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services; 