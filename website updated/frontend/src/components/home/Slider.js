import React, { useRef } from "react";
import { testimonial } from "../data/Data";
import Slider from "react-slick";
import { FiStar, FiMessageCircle, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Slider.css";

export default function Sliders() {
  const sliderRef = useRef(null);

  const NextArrow = ({ onClick }) => (
    <button 
      className="nav-button next" 
      onClick={onClick}
      aria-label="Next testimonial"
      tabIndex={0}
    >
      <FiChevronRight aria-hidden="true" />
    </button>
  );

  const PrevArrow = ({ onClick }) => (
    <button 
      className="nav-button prev" 
      onClick={onClick}
      aria-label="Previous testimonial"
      tabIndex={0}
    >
      <FiChevronLeft aria-hidden="true" />
    </button>
  );

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    accessibility: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false
        }
      }
    ]
  };

  return (
    <section className="testimonial-section" aria-label="Customer Testimonials">
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Testimonials</span>
          <h2 className="section-title" id="testimonials-title">
            What Our <span className="text-accent">Guests Say</span>
          </h2>
        </div>

        <div 
          className="testimonial-slider"
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer testimonials carousel"
          aria-describedby="testimonials-title"
        >
          <Slider ref={sliderRef} {...settings}>
            {testimonial.map((item, index) => (
              <div 
                key={index} 
                className="testimonial-slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`Testimonial ${index + 1} of ${testimonial.length}`}
              >
                <div className="testimonial-card">
                  <div className="card-inner">
                    <div className="quote-wrapper" aria-hidden="true">
                      <FiMessageCircle />
                    </div>
                    <p className="testimonial-text">{item.description}</p>
                    <div className="testimonial-author">
                      <div className="author-image">
                        <img
                          src={item.img}
                          alt={`${item.name}, ${item.profession}`}
                          loading="lazy"
                        />
                      </div>
                      <div className="author-info">
                        <h4 className="author-name">{item.name}</h4>
                        <p className="author-title">{item.profession}</p>
                        <div className="rating" aria-label={`Rated 5 out of 5 stars`}>
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} aria-hidden="true" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}
