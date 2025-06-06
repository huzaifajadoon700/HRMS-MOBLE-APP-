import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Container, Row, Col, Card, Table, Form, Button, Modal, Badge } from "react-bootstrap";
import { FaEye, FaCheck, FaTimes, FaTruck, FaFilter, FaSearch, FaCalendarAlt, FaUser, FaShoppingCart, FaDollarSign, FaClock, FaChartLine } from "react-icons/fa";
import { FiShoppingBag, FiCheckCircle, FiXCircle, FiRefreshCw, FiClock } from 'react-icons/fi';
import "./AdminOrders.css";
import { useNavigate } from 'react-router-dom';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);

      if (!token) {
        console.log('No token found in localStorage');
        toast.error('Please login to view orders');
        navigate('/login');
        return;
      }

      console.log('Making request to:', 'http://localhost:8080/api/orders');
      const response = await axios.get('http://localhost:8080/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response:', response.data);

      if (response.data && Array.isArray(response.data.orders)) {
        const validOrders = response.data.orders.filter(order => order && order._id);
        setOrders(validOrders);
      } else {
        console.error('Invalid response structure:', response.data);
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });

      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === "pending").length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalOrders,
      pendingOrders,
      totalRevenue,
      averageOrderValue
    });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      if (!orderId) {
        toast.error('Invalid order ID');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to update order status');
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Order status updated successfully');
        fetchOrders(); // Refresh the orders list
      } else {
        toast.error(response.data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update order status');
      }
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <Container className="admin-orders-container">
        <div className="loading-state">
          <FiRefreshCw className="loading-spinner" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="admin-orders-container">
      <div className="page-header">
        <h1 className="page-title">Manage Orders</h1>
        <p className="page-subtitle">View and update order status</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <FiShoppingBag className="empty-state-icon" />
          <h3 className="empty-state-title">No Orders Found</h3>
          <p className="empty-state-text">
            There are no orders to display at the moment.
          </p>
        </div>
      ) : (
        <Row className="orders-grid">
          {orders.map((order) => (
            <Col key={order._id} xs={12} md={6} lg={4}>
              <Card className="order-card">
                <Card.Body>
                  <div className="order-header">
                    <div className="order-info">
                      <h3 className="order-id">Order #{order.orderNumber}</h3>
                      <p className="order-date">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      className={`status-badge ${order.status.toLowerCase()}`}
                      pill
                    >
                      {order.status === 'pending' && <FiClock className="status-icon" />}
                      {order.status === 'completed' && <FiCheckCircle className="status-icon" />}
                      {order.status === 'cancelled' && <FiXCircle className="status-icon" />}
                      <span>{order.status}</span>
                    </Badge>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="order-item-image"
                        />
                        <div className="order-item-details">
                          <h4 className="order-item-name">{item.name}</h4>
                          <p className="order-item-price">${item.price}</p>
                          <p className="order-item-quantity">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary">
                    <div className="summary-item">
                      <span>Subtotal</span>
                      <span>${order.subtotal}</span>
                    </div>
                    <div className="summary-item">
                      <span>Tax</span>
                      <span>${order.tax}</span>
                    </div>
                    <div className="summary-item total">
                      <span>Total</span>
                      <span>${order.totalPrice}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    {order.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusUpdate(order._id, 'completed')}
                        >
                          Complete Order
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                        >
                          Cancel Order
                        </Button>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon">
                <FaShoppingCart />
              </div>
              <div className="stat-content">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon pending">
                <FaClock />
              </div>
              <div className="stat-content">
                <h3>{stats.pendingOrders}</h3>
                <p>Pending Orders</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon revenue">
                <FaDollarSign />
              </div>
              <div className="stat-content">
                <h3>${stats.totalRevenue.toFixed(2)}</h3>
                <p>Total Revenue</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stat-card">
            <Card.Body>
              <div className="stat-icon average">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h3>${stats.averageOrderValue.toFixed(2)}</h3>
                <p>Average Order Value</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="search-container">
                <FaSearch className="search-icon" />
                <Form.Control
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="cosmic-input"
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="filter-container">
                <FaFilter className="filter-icon" />
                <Form.Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="cosmic-select"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card>
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="cosmic-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id">{order.orderNumber}</td>
                      <td className="customer-info">
                        <FaUser className="customer-icon" />
                        {order.customerName}
                      </td>
                      <td className="order-date">
                        <FaCalendarAlt className="date-icon" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="order-total">
                        <FaDollarSign className="total-icon" />
                        ${order.totalPrice?.toFixed(2)}
                      </td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="link"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                            className="cosmic-btn-view"
                          >
                            <FaEye />
                          </Button>
                          {order.status === "pending" && (
                            <>
                              <Button
                                variant="link"
                                onClick={() => handleStatusUpdate(order._id, "processing")}
                                className="cosmic-btn-success"
                              >
                                <FaCheck />
                              </Button>
                              <Button
                                variant="link"
                                onClick={() => handleStatusUpdate(order._id, "cancelled")}
                                className="cosmic-btn-danger"
                              >
                                <FaTimes />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Order Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        className="cosmic-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Order Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div className="order-details">
              <div className="detail-item">
                <span className="detail-label">Order Number:</span>
                <span className="detail-value">{selectedOrder.orderNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Customer:</span>
                <span className="detail-value">{selectedOrder.customerName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date:</span>
                <span className="detail-value">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total:</span>
                <span className="detail-value">
                  ${selectedOrder.totalPrice?.toFixed(2)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Items:</span>
                <ul className="items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <li key={index}>
                      {item.name} x {item.quantity} - ${item.price?.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
            className="cosmic-btn"
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminOrders; 