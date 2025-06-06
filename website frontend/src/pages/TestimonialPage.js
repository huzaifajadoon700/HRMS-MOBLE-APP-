import React from "react";
import { testimonial } from "../components/data/Data";
import Slider from "react-slick";
import { FiChevronLeft, FiChevronRight, FiStar, FiMessageCircle } from "react-icons/fi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./TestimonialPage.css";

const TestimonialPage = () => {
  const NextArrow = ({ onClick }) => (
    <button 
      className="nav-button next" 
      onClick={onClick} 
      aria-label="Next testimonial"
    >
      <FiChevronRight />
    </button>
  );

  const PrevArrow = ({ onClick }) => (
    <button 
      className="nav-button prev" 
      onClick={onClick} 
      aria-label="Previous testimonial"
    >
      <FiChevronLeft />
    </button>
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false
        }
      }
    ]
  };

  const renderStars = (rating = 5) => (
    <div className="rating">
      {[...Array(rating)].map((_, i) => (
        <FiStar key={i} className={i < rating ? 'star-filled' : 'star-empty'} />
      ))}
    </div>
  );

  return (
    <section className="testimonials-section">
      <div className="testimonials-bg"></div>
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">What Our Guests Say</span>
          <h1 className="section-title">
            Client <span className="text-accent">Testimonials</span>
          </h1>
          <p className="section-description">
            Discover what our valued guests have to say about their experiences with us
          </p>
        </div>
        
        <div className="testimonials-slider">
          <Slider {...settings}>
            {testimonial.map((item, index) => (
              <div key={index} className="testimonial-slide">
                <div className="testimonial-card">
                  <div className="card-inner">
                    <div className="quote-wrapper">
                      <FiMessageCircle className="quote-icon" />
                    </div>
                    <p className="testimonial-text">{item.description}</p>
                    <div className="testimonial-author">
                      <div className="author-image">
                        <img
                          src={item.img}
                          alt={item.name}
                          loading="lazy"
                        />
                      </div>
                      <div className="author-info">
                        <h4 className="author-name">{item.name}</h4>
                        <p className="author-title">{item.profession}</p>
                        {renderStars(5)}
                      </div>
                    </div>
                  </div>
                  <div className="card-accent"></div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default TestimonialPage;