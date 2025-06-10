import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Table } from "react-bootstrap";
import { FiTrendingUp, FiUsers, FiStar, FiBarChart2, FiRefreshCw, FiSettings } from "react-icons/fi";
import { recommendationAPI } from "../../api/recommendations";
import "./RecommendationSystem.css";

const RecommendationSystem = () => {
  const [analytics, setAnalytics] = useState(null);
  const [mlInfo, setMLInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analytics and ML info in parallel
      const [analyticsResponse, mlInfoResponse] = await Promise.all([
        recommendationAPI.getAnalytics().catch(() => ({ success: false })),
        recommendationAPI.getMLInfo().catch(() => ({ success: false }))
      ]);

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.analytics);
      }

      if (mlInfoResponse.success) {
        setMLInfo(mlInfoResponse);
      }

    } catch (err) {
      console.error('Error loading recommendation data:', err);
      setError('Failed to load recommendation system data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Container className="recommendation-admin-container">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading recommendation system data...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="recommendation-admin-container">
      {/* Header */}
      <div className="admin-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="admin-title">
              <FiBarChart2 className="me-2" />
              AI Recommendation System
            </h2>
            <p className="admin-subtitle">
              Monitor and manage the intelligent food recommendation system
            </p>
          </div>
          <Button
            variant="outline-primary"
            onClick={handleRefresh}
            disabled={refreshing}
            className="refresh-btn"
          >
            <FiRefreshCw className={refreshing ? 'spinning' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          <FiStar className="me-2" />
          {error}
        </Alert>
      )}

      {/* ML System Status */}
      {mlInfo && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className="ml-status-card">
              <Card.Header className="bg-primary text-white">
                <FiSettings className="me-2" />
                Machine Learning System Status
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={3}>
                    <div className="status-metric">
                      <h4 className="text-success">
                        {mlInfo.modelInfo?.performance?.rmse?.toFixed(4) || 'N/A'}
                      </h4>
                      <small className="text-muted">RMSE Score</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="status-metric">
                      <h4 className="text-info">
                        {mlInfo.modelInfo?.performance?.mae?.toFixed(4) || 'N/A'}
                      </h4>
                      <small className="text-muted">MAE Score</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="status-metric">
                      <h4 className="text-warning">
                        {Object.keys(mlInfo.pakistaniCuisine || {}).length}
                      </h4>
                      <small className="text-muted">Pakistani Adaptations</small>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="status-metric">
                      <h4 className="text-primary">
                        {mlInfo.userHistory?.length || 0}
                      </h4>
                      <small className="text-muted">User Profiles</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Analytics Dashboard */}
      {analytics && (
        <Row>
          <Col md={6}>
            <Card className="analytics-card mb-4">
              <Card.Header>
                <FiUsers className="me-2" />
                User Engagement
              </Card.Header>
              <Card.Body>
                <div className="metric-row">
                  <span>Total Users:</span>
                  <Badge bg="primary">{analytics.totalUsers || 0}</Badge>
                </div>
                <div className="metric-row">
                  <span>Active Users (30 days):</span>
                  <Badge bg="success">{analytics.activeUsers || 0}</Badge>
                </div>
                <div className="metric-row">
                  <span>Total Interactions:</span>
                  <Badge bg="info">{analytics.totalInteractions || 0}</Badge>
                </div>
                <div className="metric-row">
                  <span>Average Rating:</span>
                  <Badge bg="warning">{analytics.averageRating?.toFixed(2) || 'N/A'}</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="analytics-card mb-4">
              <Card.Header>
                <FiTrendingUp className="me-2" />
                Popular Items
              </Card.Header>
              <Card.Body>
                {analytics.popularItems?.length > 0 ? (
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Rating</th>
                        <th>Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.popularItems.slice(0, 5).map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>
                            <Badge bg="warning">
                              {item.averageRating?.toFixed(1) || 'N/A'}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg="info">
                              {item.totalOrders || 0}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <p className="text-muted">No popular items data available</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Pakistani Cuisine Insights */}
      {mlInfo?.pakistaniCuisine && (
        <Row>
          <Col md={12}>
            <Card className="pakistani-insights-card">
              <Card.Header className="bg-success text-white">
                <FiStar className="me-2" />
                Pakistani Cuisine Insights
              </Card.Header>
              <Card.Body>
                <Row>
                  {Object.entries(mlInfo.pakistaniCuisine).map(([key, value], index) => (
                    <Col md={3} key={index} className="mb-3">
                      <div className="insight-metric">
                        <h5 className="text-success">{key.replace(/([A-Z])/g, ' $1').trim()}</h5>
                        <p className="text-muted">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </p>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default RecommendationSystem;
