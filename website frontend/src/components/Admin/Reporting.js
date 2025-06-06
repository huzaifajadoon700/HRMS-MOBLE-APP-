import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Spinner,
} from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportingAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    bookings: [],
    revenue: [],
    users: [],
  });
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = () => {
    const mockData = {
      bookings: [10, 15, 20, 25, 30, 35, 40],
      revenue: [500, 700, 800, 1000, 1200, 1500, 1800],
      users: [100, 120, 140, 160, 180, 200, 220],
    };

    // Simulate a loading delay
    setTimeout(() => {
      setAnalyticsData(mockData);
      prepareChart(mockData);
      setLoading(false);
    }, 1000);
  };

  const prepareChart = (data) => {
    const newChartData = {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"],
      datasets: [
        {
          label: "Bookings",
          data: data.bookings,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Revenue",
          data: data.revenue,
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
        {
          label: "Users",
          data: data.users,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
    setChartData(newChartData);
  };

  const calculateTotal = (data) => data.reduce((total, value) => total + value, 0);

  return (
    <Container>
      <Row>
        {/* Analytics Cards */}
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Total Bookings</Card.Title>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Card.Text>{calculateTotal(analyticsData.bookings)}</Card.Text>
              )}
              <Button variant="success" disabled={loading}>View Details</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Total Revenue</Card.Title>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Card.Text>${calculateTotal(analyticsData.revenue)}</Card.Text>
              )}
              <Button variant="info" disabled={loading}>View Details</Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Active Users</Card.Title>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Card.Text>{calculateTotal(analyticsData.users)}</Card.Text>
              )}
              <Button variant="primary" disabled={loading}>View Details</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Bookings, Revenue, and Users Trends</Card.Title>
              {loading ? (
                <p>Loading chart data...</p>
              ) : (
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: "top",
                      },
                      title: {
                        display: true,
                        text: "Weekly Analysis",
                      },
                    },
                  }}
                />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Table Section */}
      <Row>
        <Col>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Bookings & Revenue Summary</Card.Title>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Bookings</th>
                    <th>Revenue</th>
                    <th>Active Users</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.bookings.map((_, index) => (
                    <tr key={index}>
                      <td>Week {index + 1}</td>
                      <td>{analyticsData.bookings[index]}</td>
                      <td>${analyticsData.revenue[index]}</td>
                      <td>{analyticsData.users[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportingAnalytics;
