import React, { useState, useEffect } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';
import { FiHeart, FiThumbsUp, FiMessageSquare } from 'react-icons/fi';

const API_URL = 'http://localhost:8080';

// Enhanced sentiment word lists with weights
const sentimentWords = {
  positive: {
    'excellent': 1.5,
    'amazing': 1.4,
    'wonderful': 1.3,
    'fantastic': 1.3,
    'perfect': 1.4,
    'great': 1.2,
    'good': 1.1,
    'awesome': 1.3,
    'brilliant': 1.3,
    'outstanding': 1.4,
    'delicious': 1.2,
    'tasty': 1.1,
    'fresh': 1.1,
    'clean': 1.1,
    'friendly': 1.2,
    'helpful': 1.2,
    'quick': 1.1,
    'fast': 1.1,
    'efficient': 1.2,
    'beautiful': 1.2,
    'nice': 1.1,
    'love': 1.3,
    'enjoyed': 1.2,
    'recommend': 1.2,
    'exceeded': 1.3,
    'impressed': 1.2,
    'satisfied': 1.2,
    'happy': 1.2,
    'pleasant': 1.1,
    'comfortable': 1.1
  },
  negative: {
    'terrible': -1.5,
    'awful': -1.4,
    'horrible': -1.4,
    'poor': -1.3,
    'disappointing': -1.3,
    'unpleasant': -1.2,
    'bad': -1.2,
    'slow': -1.1,
    'dirty': -1.2,
    'unfriendly': -1.2,
    'rude': -1.3,
    'cold': -1.1,
    'expensive': -1.1,
    'overpriced': -1.2,
    'wait': -1.1,
    'waiting': -1.1,
    'late': -1.2,
    'delayed': -1.2,
    'wrong': -1.2,
    'mistake': -1.2,
    'problem': -1.2,
    'hate': -1.4,
    'disappointed': -1.3,
    'unhappy': -1.2,
    'uncomfortable': -1.2,
    'waste': -1.3,
    'worst': -1.4,
    'never': -1.1,
    'avoid': -1.2,
    'complaint': -1.2,
    'issue': -1.2
  }
};

// Negation words that can invert sentiment
const negationWords = new Set(['not', "don't", "doesn't", "didn't", "won't", "wouldn't", "couldn't", "can't", "isn't", "aren't", "wasn't", "weren't"]);

const Feedback = () => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(null);
  const [sentimentPreview, setSentimentPreview] = useState({
    sentiment: 'neutral',
    score: 0,
    confidence: 0,
    details: []
  });

  // Enhanced sentiment analysis function
  const analyzeSentiment = (text) => {
    // Reset to neutral if text is empty
    if (!text.trim()) {
      setSentimentPreview({
        sentiment: 'neutral',
        score: 0,
        confidence: 0,
        details: []
      });
      return;
    }

    const sentences = text.toLowerCase().split(/[.!?]+/);
    let totalScore = 0;
    let totalWords = 0;
    const details = [];

    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);
      let sentenceScore = 0;
      let sentenceWords = 0;
      let isNegated = false;

      words.forEach((word, index) => {
        // Check for negation words
        if (negationWords.has(word)) {
          isNegated = true;
          return;
        }

        // Check for sentiment words
        let wordScore = 0;
        if (sentimentWords.positive[word]) {
          wordScore = sentimentWords.positive[word];
        } else if (sentimentWords.negative[word]) {
          wordScore = sentimentWords.negative[word];
        }

        if (wordScore !== 0) {
          const finalScore = isNegated ? -wordScore : wordScore;
          sentenceScore += finalScore;
          sentenceWords++;
          details.push({
            word,
            score: finalScore,
            isNegated
          });
        }
      });

      if (sentenceWords > 0) {
        totalScore += sentenceScore;
        totalWords += sentenceWords;
      }
    });

    // Calculate final sentiment
    let finalScore = 0;
    let confidence = 0;

    if (totalWords > 0) {
      finalScore = totalScore / totalWords;
      confidence = Math.min(Math.abs(finalScore), 1);
    }

    // Determine sentiment category
    let sentiment;
    if (finalScore > 0.3) sentiment = 'positive';
    else if (finalScore > 0.1) sentiment = 'slightly_positive';
    else if (finalScore < -0.3) sentiment = 'negative';
    else if (finalScore < -0.1) sentiment = 'slightly_negative';
    else sentiment = 'neutral';

    // Update sentiment preview state
    setSentimentPreview({
      sentiment,
      score: finalScore,
      confidence,
      details
    });
  };

  // Update rating based on sentiment
  useEffect(() => {
    if (sentimentPreview.score !== 0) {
      let newRating = 5; // Default rating
      if (sentimentPreview.score > 0.3) newRating = 5;
      else if (sentimentPreview.score > 0.1) newRating = 4;
      else if (sentimentPreview.score < -0.3) newRating = 1;
      else if (sentimentPreview.score < -0.1) newRating = 2;
      else newRating = 3;

      setFormData(prev => ({ ...prev, rating: newRating }));
    }
  }, [sentimentPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'comment') {
      // Debounce the sentiment analysis to prevent too frequent updates
      const timeoutId = setTimeout(() => {
        analyzeSentiment(value);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to submit feedback');
        return;
      }

      const response = await axios.post(`${API_URL}/api/feedback`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Thank you for your feedback!');
        setFormData({ rating: 5, comment: '' });
        setSentimentPreview({
          sentiment: 'neutral',
          score: 0,
          confidence: 0,
          details: []
        });
      } else {
        toast.error(response.data.error || 'Error submitting feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      if (error.response) {
        toast.error(error.response.data.error || 'Error submitting feedback');
      } else if (error.request) {
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error('Error setting up the request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '#00ff00';
      case 'slightly_positive': return '#90EE90';
      case 'neutral': return '#FFD700';
      case 'slightly_negative': return '#FFB6C1';
      case 'negative': return '#FF0000';
      default: return '#808080';
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#0a192f',
      padding: '0',
      color: '#ffffff',
      marginTop: '80px'
    }}>
      {/* Hero Section */}
      <div style={{
        padding: '2rem 0',
        textAlign: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '600',
          color: '#64ffda',
          marginBottom: '0.5rem'
        }}>
          Share Your Experience
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#b0b0b0',
          margin: '0'
        }}>
          Your feedback helps us improve our service
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem',
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 768 ? '1fr 300px' : '1fr',
        gap: '3rem',
        alignItems: 'start'
      }}>
        {/* Feedback Form */}
        <Card className="shadow-lg" style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem'
        }}>
          <Card.Header className="py-3" style={{
            background: 'rgba(100, 255, 218, 0.1)',
            borderTopLeftRadius: '1rem',
            borderTopRightRadius: '1rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <h5 className="mb-0" style={{ color: '#64ffda', fontSize: '1.1rem' }}>Rate Your Experience</h5>
          </Card.Header>
        <Card.Body className="p-3">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#64ffda', fontSize: '0.9rem', fontWeight: '600' }}>
                Rating
              </Form.Label>
              <div className="d-flex gap-1 justify-content-center">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <label key={index} className="cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={ratingValue}
                        checked={formData.rating === ratingValue}
                        onChange={handleChange}
                        className="d-none"
                      />
                      <FaStar
                        size={20}
                        color={ratingValue <= (hover || formData.rating) ? "#64ffda" : "#4a5568"}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(null)}
                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                      />
                    </label>
                  );
                })}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ color: '#64ffda', fontSize: '0.9rem', fontWeight: '600' }}>
                Comments
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Share your thoughts..."
                required
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
              />
              {formData.comment && sentimentPreview.sentiment !== 'neutral' && (
                <div className="mt-2">
                  <small style={{
                    color: getSentimentColor(sentimentPreview.sentiment),
                    fontSize: '0.8rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '0.5rem',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    {sentimentPreview.sentiment.replace('_', ' ')}
                  </small>
                </div>
              )}
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              className="w-100"
              style={{
                background: 'linear-gradient(135deg, #64ffda 0%, #4fd1c7 100%)',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                color: '#0a192f',
                padding: '0.6rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem'
        }}>
          <Card.Body className="p-3">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <FiHeart style={{ fontSize: '1.2rem', color: '#64ffda', marginRight: '0.8rem' }} />
              <h6 style={{ color: '#ffffff', margin: '0', fontSize: '1rem' }}>Why Your Feedback Matters</h6>
            </div>
            <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4', margin: '0' }}>
              Your feedback helps us understand what we're doing well and where we can improve.
            </p>
          </Card.Body>
        </Card>

        <Card style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem'
        }}>
          <Card.Body className="p-3">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <FiThumbsUp style={{ fontSize: '1.2rem', color: '#64ffda', marginRight: '0.8rem' }} />
              <h6 style={{ color: '#ffffff', margin: '0', fontSize: '1rem' }}>Our Commitment</h6>
            </div>
            <ul style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4', margin: '0', paddingLeft: '1rem' }}>
              <li>We read every feedback personally</li>
              <li>Response within 24 hours</li>
              <li>Continuous service improvement</li>
            </ul>
          </Card.Body>
        </Card>

        <Card style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '1rem'
        }}>
          <Card.Body className="p-3">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <FiMessageSquare style={{ fontSize: '1.2rem', color: '#64ffda', marginRight: '0.8rem' }} />
              <h6 style={{ color: '#ffffff', margin: '0', fontSize: '1rem' }}>Contact Support</h6>
            </div>
            <p style={{ color: '#b0b0b0', fontSize: '0.9rem', lineHeight: '1.4', margin: '0' }}>
              Need immediate help? Contact our support team at support@hotelroyal.com
            </p>
          </Card.Body>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default Feedback; 