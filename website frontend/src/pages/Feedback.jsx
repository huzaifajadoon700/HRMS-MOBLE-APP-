import React, { useState } from 'react';
import { FiMessageSquare, FiStar } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';

const Feedback = () => {
  const [formData, setFormData] = useState({
    rating: 0,
    comment: '',
    category: 'general',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your feedback submission logic here
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <PageLayout>
        <div className="empty-state">
          <FiMessageSquare className="empty-state-icon" />
          <h3 className="empty-state-title">Thank You!</h3>
          <p className="empty-state-text">
            Your feedback has been submitted successfully. We appreciate your input!
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="page-header">
        <h1 className="page-title">Feedback</h1>
        <p className="page-subtitle">Share your experience with us</p>
      </div>

      <div className="feedback-container">
        <div className="card">
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, rating: star })}
                  >
                    <FiStar />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="general">General Feedback</option>
                <option value="room">Room Experience</option>
                <option value="service">Service Quality</option>
                <option value="food">Food & Dining</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Your Feedback</label>
              <textarea
                className="form-control"
                rows="5"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Share your thoughts with us..."
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Submit Feedback
            </button>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default Feedback; 