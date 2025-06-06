import React from 'react';
import { FiHelpCircle, FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';
import '../styles/theme.css';
import './Help.css';

const Help = () => {
  const faqs = [
    {
      question: 'How do I make a reservation?',
      answer: 'You can make a reservation by selecting your desired room type and dates on our booking page.',
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'You can cancel your reservation up to 24 hours before check-in without any charges.',
    },
    {
      question: 'How do I modify my booking?',
      answer: 'You can modify your booking by logging into your account and selecting the booking you wish to change.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers.',
    },
    {
      question: 'Is there a minimum stay requirement?',
      answer: 'Yes, we have a minimum stay requirement of 1 night for standard rooms and 2 nights for suites.',
    },
  ];

  return (
    <PageLayout>
      <div className="page-container" style={{marginTop:'-100px'}}>
        <div className="page-header">
          <h1 className="page-title">Help Center</h1>
          <p className="page-subtitle">How can we help you today?</p>
        </div>

        <div className="help-container container" style={{marginTop:'-60px'}}>
          <div className="content-grid">
            <div className="card glass animate-fade-in">
              <div className="card-content">
                <FiHelpCircle className="card-icon" size={32} />
                <h3 className="card-title">Frequently Asked Questions</h3>
                <div className="faq-list">
                  {faqs.map((faq, index) => (
                    <div key={index} className="faq-item glass">
                      <h4 className="faq-question">{faq.question}</h4>
                      <p className="faq-answer">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card glass animate-fade-in">
              <div className="card-content">
                <FiMessageSquare className="card-icon" size={32} />
                <h3 className="card-title">Contact Support</h3>
                <div className="contact-methods">
                  <a href="mailto:support@hotel.com" className="contact-item glass">
                    <FiMail className="contact-icon" />
                    <span>support@hotel.com</span>
                  </a>
                  <a href="tel:+15551234567" className="contact-item glass">
                    <FiPhone className="contact-icon" />
                    <span>+1 (555) 123-4567</span>
                  </a>
                </div>
                <p className="contact-note">
                  Our support team is available 24/7 to assist you with any questions or concerns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Help; 