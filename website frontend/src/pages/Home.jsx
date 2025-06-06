import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { FiHome, FiCalendar, FiShoppingBag } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import TestimonialPage from './TestimonialPage';
import Slider from '../components/home/Slider';

const Home = () => {
  return (
    <PageLayout>
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Welcome to HRMS</h1>
        <p className="page-subtitle">
          Your one-stop solution for hotel management and reservations
        </p>
      </div>

      <div className="content-grid">
        <Link to="/rooms" className="card">
          <FiHome className="card-icon" size={32} />
          <h3 className="card-title">Book a Room</h3>
          <p className="card-text">
            Find and book the perfect room for your stay with our wide selection of accommodations.
          </p>
        </Link>

        <Link to="/reserve-table" className="card">
          <FiCalendar className="card-icon" size={32} />
          <h3 className="card-title">Reserve a Table</h3>
          <p className="card-text">
            Book a table at our restaurant and enjoy a delightful dining experience.
          </p>
        </Link>

        <Link to="/order-food" className="card">
          <FiShoppingBag className="card-icon" size={32} />
          <h3 className="card-title">Order Food</h3>
          <p className="card-text">
            Browse our menu and order delicious food to be delivered to your room.
          </p>
        </Link>
      </div>

      {/* <TestimonialPage /> */}
      {/* <Slider /> */}
    </PageLayout>
  );
};

export default Home; 