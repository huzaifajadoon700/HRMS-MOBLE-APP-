import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Spinner, Alert, Form } from 'react-bootstrap';
import { FiUsers, FiTarget, FiTrendingUp, FiRefreshCw, FiDownload, FiEye, FiHeart, FiStar, FiSettings } from 'react-icons/fi';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { tableRecommendationService } from '../../services/tableRecommendationService';
import './TableRecommendationAnalytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const TableRecommendationAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tableRecommendationService.getAdminDashboard();
      
      if (response.success) {
        setAnalytics(response.analytics);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const refreshMLCache = async () => {
    try {
      setRefreshing(true);
      const response = await tableRecommendationService.refreshMLCache();
      
      if (response.success) {
        await loadAnalytics(); // Reload analytics after refresh
        alert('ML model cache refreshed successfully!');
      } else {
        alert('Failed to refresh ML cache');
      }
    } catch (error) {
      console.error('Error refreshing ML cache:', error);
      alert('Failed to refresh ML cache');
    } finally {
      setRefreshing(false);
    }
  };

  const exportData = () => {
    if (!analytics) return;
    
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `table-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Chart configurations
  const interactionChartData = {
    labels: Object.keys(analytics?.interactionTypes || {}),
    datasets: [
      {
        label: 'Interactions',
        data: Object.values(analytics?.interactionTypes || {}).map(item => item.count),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(255, 107, 157, 0.8)',
          'rgba(100, 255, 218, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)',
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(255, 107, 157, 1)',
          'rgba(100, 255, 218, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const locationChartData = {
    labels: analytics?.locationStats?.map(item => item._id) || [],
    datasets: [
      {
        label: 'Total Bookings',
        data: analytics?.locationStats?.map(item => item.totalBookings) || [],
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
      },
      {
        label: 'Average Rating',
        data: analytics?.locationStats?.map(item => item.avgRating) || [],
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Table Analytics',
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 5,
      },
    },
  };

  if (loading) {
    return (
      <Container fluid className="table-analytics-container">
        <div className="loading-container">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading table analytics...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="table-analytics-container">
        <Alert variant="danger" className="m-4">
          <Alert.Heading>Error Loading Analytics</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={loadAnalytics}>
            <FiRefreshCw className="me-2" />
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="table-analytics-container">
      <div className="analytics-header">
        <div className="header-content">
          <h2 className="page-title">
            <FiTarget className="me-3" />
            Table Recommendation Analytics
          </h2>
          <p className="page-subtitle">
            Monitor and analyze table recommendation system performance
          </p>
        </div>
        
        <div className="header-actions">
          <Button
            variant="outline-primary"
            onClick={exportData}
            className="me-2"
          >
            <FiDownload className="me-2" />
            Export Data
          </Button>
          <Button
            variant="primary"
            onClick={refreshMLCache}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <Spinner size="sm" className="me-2" />
                Refreshing...
              </>
            ) : (
              <>
                <FiRefreshCw className="me-2" />
                Refresh ML Cache
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="analytics-card overview-card">
            <Card.Body>
              <div className="card-content">
                <div className="card-icon tables-icon">
                  <FiTarget />
                </div>
                <div className="card-info">
                  <h3>{analytics?.overview?.totalTables || 0}</h3>
                  <p>Total Tables</p>
                  <small className="text-success">
                    {analytics?.overview?.utilizationRate || 0}% utilized
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="analytics-card overview-card">
            <Card.Body>
              <div className="card-content">
                <div className="card-icon interactions-icon">
                  <FiUsers />
                </div>
                <div className="card-info">
                  <h3>{analytics?.interactions?.total || 0}</h3>
                  <p>Total Interactions</p>
                  <small className="text-info">
                    {analytics?.interactions?.uniqueUsers || 0} unique users
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="analytics-card overview-card">
            <Card.Body>
              <div className="card-content">
                <div className="card-icon recommendations-icon">
                  <FiTrendingUp />
                </div>
                <div className="card-info">
                  <h3>{analytics?.recommendations?.total || 0}</h3>
                  <p>Recommendations</p>
                  <small className="text-warning">
                    {analytics?.recommendations?.cacheHitRate || 0}% cache hit rate
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="analytics-card overview-card">
            <Card.Body>
              <div className="card-content">
                <div className="card-icon active-users-icon">
                  <FiEye />
                </div>
                <div className="card-info">
                  <h3>{analytics?.interactions?.activeUsers || 0}</h3>
                  <p>Active Users</p>
                  <small className="text-primary">
                    Last 7 days
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="analytics-card chart-card">
            <Card.Header>
              <h5 className="mb-0">Interaction Types Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Doughnut data={interactionChartData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="analytics-card chart-card">
            <Card.Header>
              <h5 className="mb-0">Location Performance</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Bar data={locationChartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Popular Tables */}
      <Row className="mb-4">
        <Col lg={8} className="mb-4">
          <Card className="analytics-card">
            <Card.Header>
              <h5 className="mb-0">Most Popular Tables</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover className="popular-tables-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Table</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Interactions</th>
                    <th>Unique Users</th>
                    <th>Avg Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.popularTables?.slice(0, 10).map((table, index) => (
                    <tr key={table._id}>
                      <td>
                        <Badge bg={index < 3 ? 'warning' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                      </td>
                      <td className="fw-bold">{table.tableName}</td>
                      <td>{table.location}</td>
                      <td>{table.capacity} seats</td>
                      <td>{table.totalInteractions}</td>
                      <td>{table.uniqueUsers}</td>
                      <td>
                        <div className="rating-display">
                          <FiStar className="star-icon" />
                          {table.avgRating?.toFixed(1) || 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} className="mb-4">
          <Card className="analytics-card">
            <Card.Header>
              <h5 className="mb-0">ML Model Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="ml-status">
                <div className="status-item">
                  <span className="status-label">Model Status:</span>
                  <Badge bg={analytics?.mlModel?.loaded ? 'success' : 'danger'}>
                    {analytics?.mlModel?.loaded ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="status-item">
                  <span className="status-label">Model Types:</span>
                  <div className="model-types">
                    {analytics?.mlModel?.modelTypes?.map((type, index) => (
                      <Badge key={index} bg="info" className="me-1 mb-1">
                        {type.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="status-item">
                  <span className="status-label">Dataset Sizes:</span>
                  <ul className="dataset-list">
                    {Object.entries(analytics?.mlModel?.datasetSizes || {}).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value} records
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-3"
                  onClick={() => {/* Navigate to ML settings */}}
                >
                  <FiSettings className="me-2" />
                  Configure Models
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TableRecommendationAnalytics;
