import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_URL = 'http://localhost:8080';

const SentimentAnalysis = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view analytics');
        return;
      }

      console.log('Fetching analytics with token:', token.substring(0, 10) + '...');

      const response = await axios.get(`${API_URL}/api/feedback/analytics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Analytics response:', response.data);

      if (response.data.success) {
        setAnalytics(response.data.data);
      } else {
        setError(response.data.error || 'Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.error || 'Failed to load analytics data');
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        console.error('Request setup error:', error.message);
        setError('Error setting up the request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="alert alert-info m-4" role="alert">
        No analytics data available.
      </div>
    );
  }

  const sentimentColors = {
    positive: 'success',
    negative: 'danger',
    neutral: 'warning'
  };

  const sentimentData = {
    labels: Object.keys(analytics.sentimentDistribution || {}),
    datasets: [
      {
        data: Object.values(analytics.sentimentDistribution || {}),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ]
      }
    ]
  };

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4">Feedback Analytics</h2>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title>Total Feedbacks</Card.Title>
              <h2>{analytics.totalFeedbacks || 0}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title>Average Rating</Card.Title>
              <h2>{(analytics.averageRating || 0).toFixed(1)} / 5</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title>Sentiment Distribution</Card.Title>
              <div style={{ height: '200px' }}>
                <Pie data={sentimentData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow">
        <Card.Header>
          <h4 className="mb-0">Recent Feedbacks</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>User</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Sentiment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentFeedbacks?.map((feedback) => (
                <tr key={feedback._id}>
                  <td>{feedback.userId?.name || 'Anonymous'}</td>
                  <td>{feedback.rating}/5</td>
                  <td>{feedback.comment}</td>
                  <td>
                    <Badge bg={sentimentColors[feedback.sentiment]}>
                      {feedback.sentiment}
                    </Badge>
                  </td>
                  <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="5" className="text-center">No recent feedbacks available</td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SentimentAnalysis; 