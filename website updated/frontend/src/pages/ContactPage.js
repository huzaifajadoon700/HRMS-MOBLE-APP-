import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaHeadset,
  FaWhatsapp,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaPaperPlane,
  FaCheckCircle
} from "react-icons/fa";
import "./ContactPage.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    priority: "medium"
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      // Here you would typically make an API call to send the message
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: <FaPhone />,
      title: "Call Us",
      content: "+92 123 456 7890",
      description: "Available 24/7 for your convenience",
      link: "tel:+921234567890",
      color: "#4CAF50"
    },
    {
      icon: <FaEnvelope />,
      title: "Email Us",
      content: "info@hotelmanagement.com",
      description: "We'll respond within 24 hours",
      link: "mailto:info@hotelmanagement.com",
      color: "#2196F3"
    },
    {
      icon: <FaWhatsapp />,
      title: "WhatsApp",
      content: "+92 123 456 7890",
      description: "Quick support via WhatsApp",
      link: "https://wa.me/921234567890",
      color: "#25D366"
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Visit Us",
      content: "123 Main Street, Islamabad",
      description: "Pakistan - Open 24/7",
      link: "https://goo.gl/maps/your-location",
      color: "#FF5722"
    }
  ];

  const businessHours = [
    { day: "Monday - Friday", hours: "24/7 Available" },
    { day: "Saturday - Sunday", hours: "24/7 Available" },
    { day: "Emergency Support", hours: "Always Available" }
  ];

  const socialLinks = [
    { icon: <FaLinkedin />, url: "#", color: "#0077B5" },
    { icon: <FaTwitter />, url: "#", color: "#1DA1F2" },
    { icon: <FaInstagram />, url: "#", color: "#E4405F" }
  ];

  if (submitted) {
    return (
      <div className="contact-success-page">
        <div className="success-container">
          <div className="success-animation">
            <FaCheckCircle className="success-icon" />
          </div>
          <h1>Message Sent Successfully!</h1>
          <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
          <div className="success-actions">
            <button onClick={() => setSubmitted(false)} className="btn-primary">
              Send Another Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Get in Touch</h1>
          <p className="hero-subtitle">
            We're here to help and answer any questions you might have.
            We look forward to hearing from you.
          </p>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="contact-methods-section">
        <div className="container-fluid">
          <div className="contact-methods-grid">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="contact-method-card"
                target={method.link.startsWith('http') ? '_blank' : '_self'}
                rel={method.link.startsWith('http') ? 'noopener noreferrer' : ''}
                style={{ '--accent-color': method.color }}
              >
                <div className="method-icon">
                  {method.icon}
                </div>
                <h3 className="method-title">{method.title}</h3>
                <p className="method-content">{method.content}</p>
                <span className="method-description">{method.description}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="contact-main-section">
        <div className="container-fluid">
          <div className="contact-content-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <div className="form-header">
                <h2>Send us a Message</h2>
                <p>Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>

              <form onSubmit={handleSubmit} className="modern-contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="priority">Priority Level</label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What is this regarding?"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your inquiry..."
                    className="form-control"
                    rows="6"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  <FaPaperPlane className="btn-icon" />
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            {/* Business Info & Map */}
            <div className="business-info-section">
              {/* Business Hours */}
              <div className="info-card">
                <div className="info-header">
                  <FaClock className="info-icon" />
                  <h3>Business Hours</h3>
                </div>
                <div className="hours-list">
                  {businessHours.map((schedule, index) => (
                    <div key={index} className="hour-item">
                      <span className="day">{schedule.day}</span>
                      <span className="hours">{schedule.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Info */}
              <div className="info-card">
                <div className="info-header">
                  <FaHeadset className="info-icon" />
                  <h3>24/7 Support</h3>
                </div>
                <p>Our dedicated support team is available around the clock to assist you with any questions or concerns.</p>
                <div className="social-links">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="social-link"
                      style={{ '--social-color': social.color }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>

              {/* Interactive Map */}
              <div className="map-card">
                <h3>Find Us</h3>
                <div className="map-container">
                  <iframe
                    title="Hotel Location"
                    className="google-map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26571557.576240476!2d60.8729937943399!3d30.37527279592168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbf15e1a1b9ff%3A0x39a019d0c63cf2bd!2sPakistan!5e0!3m2!1sen!2s!4v1708794901961!5m2!1sen!2s"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
