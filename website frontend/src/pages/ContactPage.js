import React, { useState } from "react";
import CommonHeading from "../components/common/CommonHeading";
import { contact } from "../components/data/Data";
import { toast } from "react-toastify";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "./ContactPage.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);

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

  const contactInfo = [
    {
      icon: <FaPhone className="contact-icon" />,
      title: "Phone Number",
      content: "+92 123 456 7890",
      link: "tel:+921234567890"
    },
    {
      icon: <FaEnvelope className="contact-icon" />,
      title: "Email Address",
      content: "info@hotelmanagement.com",
      link: "mailto:info@hotelmanagement.com"
    },
    {
      icon: <FaMapMarkerAlt className="contact-icon" />,
      title: "Location",
      content: "123 Main Street, Islamabad, Pakistan",
      link: "https://goo.gl/maps/your-location"
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <CommonHeading 
          heading="Get in Touch" 
          subtitle="Contact" 
          title="We'd Love to Hear From You" 
        />
      </div>

      <div className="contact-page container">
        <div className="contact-info-section">
          {contactInfo.map((info, index) => (
            <a 
              key={index} 
              href={info.link}
              className="contact-info-card glass animate-fade-in"
              target={info.link.startsWith('http') ? '_blank' : '_self'}
              rel={info.link.startsWith('http') ? 'noopener noreferrer' : ''}
            >
              <div className="contact-info-icon">
                {info.icon}
              </div>
              <div className="contact-info-content">
                <h3>{info.title}</h3>
                <p>{info.content}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="contact-main-section">
          <div className="map-container glass animate-fade-in">
            <iframe
              title="location"
              className="google-map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26571557.576240476!2d60.8729937943399!3d30.37527279592168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbf15e1a1b9ff%3A0x39a019d0c63cf2bd!2sPakistan!5e0!3m2!1sen!2s!4v1708794901961!5m2!1sen!2s"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="contact-form-container glass animate-fade-in">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Your Email"
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Subject"
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your Message"
                  className="form-control"
                  rows="5"
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
