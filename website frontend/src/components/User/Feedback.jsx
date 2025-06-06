import React, { useState, useEffect } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaStar } from 'react-icons/fa';

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
    <div className="container mt-5">
      <Card className="shadow-lg" style={{
        background: 'rgba(10, 25, 47, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 163, 255, 0.1)',
        borderRadius: '1.5rem'
      }}>
        <Card.Header className="py-3" style={{
          background: 'linear-gradient(135deg, #0066FF 0%, #00C2FF 100%)',
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          borderBottom: 'none'
        }}>
          <h4 className="mb-0 fw-bold text-white">Share Your Experience</h4>
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold" style={{ color: '#F0F4FC' }}>
                How would you rate your experience?
              </Form.Label>
              <div className="d-flex gap-2">
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
                        className="fs-2"
                        color={ratingValue <= (hover || formData.rating) ? "#00A3FF" : "#4a5568"}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(null)}
                        style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                      />
                    </label>
                  );
                })}
              </div>
              <div className="d-flex justify-content-between mt-1">
                <small style={{ color: '#F0F4FC' }}>Poor</small>
                <small style={{ color: '#F0F4FC' }}>Excellent</small>
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold" style={{ color: '#F0F4FC' }}>
                Tell us more about your experience
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Share your thoughts about our service, food, and overall experience..."
                required
                style={{
                  background: 'rgba(0, 5, 26, 0.8)',
                  border: '1px solid rgba(0, 163, 255, 0.2)',
                  color: '#F0F4FC',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  transition: 'all 0.3s ease',
                  '&::placeholder': {
                    color: '#718096'
                  }
                }}
              />
              {formData.comment && (
                <div className="mt-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span style={{ color: '#F0F4FC' }}>Sentiment Analysis:</span>
                    <span style={{ 
                      color: getSentimentColor(sentimentPreview.sentiment),
                      fontWeight: 'bold',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }}>
                      {sentimentPreview.sentiment.replace('_', ' ')}
                    </span>
                    <span style={{ color: '#F0F4FC', fontSize: '0.9rem' }}>
                      (Confidence: {(sentimentPreview.confidence * 100).toFixed(1)}%)
                    </span>
                  </div>
                  {sentimentPreview.details.length > 0 && (
                    <div className="sentiment-details" style={{ 
                      background: 'rgba(0, 5, 26, 0.8)',
                      borderRadius: '0.75rem',
                      padding: '1rem',
                      marginTop: '0.5rem'
                    }}>
                      <small style={{ color: '#F0F4FC', display: 'block', marginBottom: '0.5rem' }}>
                        Detected Keywords:
                      </small>
                      <div className="d-flex flex-wrap gap-2">
                        {sentimentPreview.details.map((detail, index) => (
                          <span
                            key={index}
                            style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.5rem',
                              background: detail.score > 0 
                                ? 'rgba(0, 255, 0, 0.2)'
                                : 'rgba(255, 0, 0, 0.2)',
                              color: detail.score > 0 ? '#00ff00' : '#ff0000',
                              fontSize: '0.85rem',
                              border: `1px solid ${detail.score > 0 ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)'}`
                            }}
                          >
                            {detail.isNegated ? 'not ' : ''}{detail.word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              className="w-100 py-2 fw-bold"
              style={{
                background: 'linear-gradient(135deg, #0066FF 0%, #00C2FF 100%)',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                color: '#F0F4FC',
                boxShadow: '0 4px 15px rgba(0, 163, 255, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0, 163, 255, 0.4)'
                }
              }}
            >
              {loading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </span>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Feedback; 