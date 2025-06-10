import React, { useState } from 'react';
import {
  FiHelpCircle,
  FiMail,
  FiPhone,
  FiMessageSquare,

  FiBook,
  FiSettings,
  FiCreditCard,
  FiUsers,
  FiShield,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiClock,
  FiHeadphones,
  FiVideo,
  FiFileText
} from 'react-icons/fi';
import '../styles/simple-theme.css';
import './Help.css';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const helpCategories = [
    { id: 'all', name: 'All Topics', icon: <FiHelpCircle />, color: '#64ffda' },
    { id: 'booking', name: 'Booking & Reservations', icon: <FiBook />, color: '#4CAF50' },
    { id: 'account', name: 'Account & Profile', icon: <FiUsers />, color: '#2196F3' },
    { id: 'payment', name: 'Payment & Billing', icon: <FiCreditCard />, color: '#FF9800' },
    { id: 'technical', name: 'Technical Support', icon: <FiSettings />, color: '#9C27B0' },
    { id: 'security', name: 'Security & Privacy', icon: <FiShield />, color: '#F44336' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'How do I make a room reservation?',
      answer: 'You can make a reservation by visiting our Rooms page, selecting your desired room type, choosing your check-in and check-out dates, and completing the booking process. You can also call our reservation hotline at +92 123 456 7890.',
      tags: ['reservation', 'booking', 'rooms']
    },
    {
      id: 2,
      category: 'booking',
      question: 'How do I reserve a table at the restaurant?',
      answer: 'Visit our Reserve Table page, select your preferred date and time, choose the number of guests, and confirm your reservation. You can also specify any special requirements or dietary preferences.',
      tags: ['table', 'restaurant', 'dining']
    },
    {
      id: 3,
      category: 'booking',
      question: 'What is your cancellation policy?',
      answer: 'Room reservations can be cancelled up to 24 hours before check-in without charges. Table reservations can be cancelled up to 2 hours before the reserved time. Late cancellations may incur fees.',
      tags: ['cancellation', 'policy', 'refund']
    },
    {
      id: 4,
      category: 'booking',
      question: 'How do I modify my existing booking?',
      answer: 'Log into your account and go to "My Bookings" or "My Reservations" to view and modify your existing bookings. You can change dates, room types, or guest numbers subject to availability.',
      tags: ['modify', 'change', 'booking']
    },
    {
      id: 5,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, bank transfers, and mobile payment solutions like Apple Pay and Google Pay.',
      tags: ['payment', 'credit card', 'paypal']
    },
    {
      id: 6,
      category: 'payment',
      question: 'When will I be charged for my booking?',
      answer: 'For room bookings, a deposit is charged immediately upon confirmation, with the remaining balance due at check-in. Restaurant reservations are charged at the time of dining.',
      tags: ['billing', 'charge', 'deposit']
    },
    {
      id: 7,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click on the "Sign Up" button in the top navigation, fill in your details including name, email, and password, then verify your email address to activate your account.',
      tags: ['account', 'signup', 'registration']
    },
    {
      id: 8,
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and follow the instructions in the reset email we send you.',
      tags: ['password', 'reset', 'login']
    },
    {
      id: 9,
      category: 'technical',
      question: 'The website is not loading properly. What should I do?',
      answer: 'Try refreshing the page, clearing your browser cache, or using a different browser. If the problem persists, contact our technical support team.',
      tags: ['website', 'loading', 'technical']
    },
    {
      id: 10,
      category: 'technical',
      question: 'How do I update my browser for the best experience?',
      answer: 'We recommend using the latest versions of Chrome, Firefox, Safari, or Edge. Visit your browser\'s help section for update instructions.',
      tags: ['browser', 'update', 'compatibility']
    },
    {
      id: 11,
      category: 'security',
      question: 'How do you protect my personal information?',
      answer: 'We use industry-standard encryption and security measures to protect your data. We never share your personal information with third parties without your consent.',
      tags: ['privacy', 'security', 'data protection']
    },
    {
      id: 12,
      category: 'security',
      question: 'Is it safe to enter my credit card information?',
      answer: 'Yes, all payment information is processed through secure, encrypted connections and we comply with PCI DSS standards for payment security.',
      tags: ['payment security', 'credit card', 'encryption']
    }
  ];

  const supportChannels = [
    {
      title: '24/7 Live Chat',
      description: 'Get instant help from our support team',
      icon: <FiMessageSquare />,
      action: 'Start Chat',
      color: '#4CAF50',
      available: true
    },
    {
      title: 'Phone Support',
      description: '+92 123 456 7890',
      icon: <FiPhone />,
      action: 'Call Now',
      color: '#2196F3',
      available: true
    },
    {
      title: 'Email Support',
      description: 'support@hotelmanagement.com',
      icon: <FiMail />,
      action: 'Send Email',
      color: '#FF9800',
      available: true
    },
    {
      title: 'Video Call',
      description: 'Schedule a video consultation',
      icon: <FiVideo />,
      action: 'Schedule Call',
      color: '#9C27B0',
      available: false
    }
  ];

  const quickLinks = [
    { title: 'User Guide', icon: <FiBook />, url: '#' },
    { title: 'Video Tutorials', icon: <FiVideo />, url: '#' },
    { title: 'Terms of Service', icon: <FiFileText />, url: '#' },
    { title: 'Privacy Policy', icon: <FiShield />, url: '#' }
  ];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="modern-help-page">
      {/* Hero Section */}
      <section className="help-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Help Center</h1>
          <p className="hero-subtitle">
            Find answers to your questions and get the support you need
          </p>
        </div>
      </section>

      {/* Quick Support Channels */}
      <section className="support-channels-section">
        <div className="container-fluid">
          <h2 className="section-title">Get Immediate Help</h2>
          <div className="support-channels-grid">
            {supportChannels.map((channel, index) => (
              <div
                key={index}
                className={`support-channel-card ${!channel.available ? 'disabled' : ''}`}
                style={{ '--channel-color': channel.color }}
              >
                <div className="channel-icon">
                  {channel.icon}
                </div>
                <h3 className="channel-title">{channel.title}</h3>
                <p className="channel-description">{channel.description}</p>
                <button
                  className="channel-action"
                  disabled={!channel.available}
                >
                  {channel.available ? channel.action : 'Coming Soon'}
                </button>
                {channel.available && (
                  <div className="availability-indicator">
                    <FiClock size={12} />
                    <span>Available Now</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="help-categories-section">
        <div className="container-fluid">
          <h2 className="section-title">Browse by Category</h2>
          <div className="categories-grid">
            {helpCategories.map((category) => (
              <button
                key={category.id}
                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon">
                  {category.icon}
                </div>
                <span className="category-name">{category.name}</span>
                <div className="category-count">
                  {category.id === 'all'
                    ? faqs.length
                    : faqs.filter(faq => faq.category === category.id).length
                  } articles
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container-fluid">
          <div className="faq-header">
            <h2 className="section-title">
              {activeCategory === 'all' ? 'Frequently Asked Questions' :
               `${helpCategories.find(cat => cat.id === activeCategory)?.name} Questions`}
            </h2>
            <p className="section-subtitle">
              {filteredFaqs.length} {filteredFaqs.length === 1 ? 'result' : 'results'} found
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>

          <div className="faq-content-grid">
            <div className="faq-list">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <div key={faq.id} className="faq-item">
                  <button
                    className="faq-question-btn"
                    onClick={() => toggleFaq(faq.id)}
                  >
                    <span className="faq-question">{faq.question}</span>
                    <div className="faq-toggle-icon">
                      {expandedFaq === faq.id ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </button>

                  {expandedFaq === faq.id && (
                    <div className="faq-answer-container">
                      <p className="faq-answer">{faq.answer}</p>
                      <div className="faq-tags">
                        {faq.tags.map((tag, index) => (
                          <span key={index} className="faq-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results">
                <FiHelpCircle size={48} />
                <h3>No results found</h3>
                <p>Try adjusting your search terms or browse different categories.</p>
                <button
                  className="reset-search-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setActiveCategory('all');
                  }}
                >
                  Reset Search
                </button>
              </div>
            )}
            </div>

            {/* FAQ Sidebar */}
            <div className="faq-sidebar">
              <div className="faq-sidebar-card">
                <div className="sidebar-card-header">
                  <FiHelpCircle className="sidebar-card-icon" />
                  <h3>Help Stats</h3>
                </div>
                <div className="sidebar-stats">
                  <div className="stat-item">
                    <span className="stat-number">{faqs.length}</span>
                    <span className="stat-label">Total FAQs</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{helpCategories.length - 1}</span>
                    <span className="stat-label">Categories</span>
                  </div>
                </div>
              </div>

              <div className="faq-sidebar-card">
                <div className="sidebar-card-header">
                  <FiHeadphones className="sidebar-card-icon" />
                  <h3>Need More Help?</h3>
                </div>
                <div className="sidebar-card-content">
                  Can't find what you're looking for? Our support team is here to help you 24/7.
                </div>
              </div>

              <div className="faq-sidebar-card">
                <div className="sidebar-card-header">
                  <FiClock className="sidebar-card-icon" />
                  <h3>Quick Tips</h3>
                </div>
                <div className="sidebar-card-content">
                  Use the search bar above to quickly find specific topics or browse by category.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="quick-links-section">
        <div className="container-fluid">
          <h2 className="section-title">Additional Resources</h2>
          <div className="quick-links-grid">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="quick-link-card"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="link-icon">
                  {link.icon}
                </div>
                <span className="link-title">{link.title}</span>
                <FiExternalLink className="external-icon" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="contact-cta-section">
        <div className="container-fluid">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Still need help?</h2>
              <p>Our support team is here to assist you 24/7</p>
            </div>
            <div className="cta-actions">
              <button className="cta-btn primary">
                <FiHeadphones />
                Contact Support
              </button>
              <button className="cta-btn secondary">
                <FiMail />
                Send Email
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Help;