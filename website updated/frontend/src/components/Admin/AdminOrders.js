import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import {
  FiShoppingBag, FiCheckCircle, FiXCircle, FiRefreshCw, FiClock,
  FiSearch, FiFilter, FiGrid, FiList, FiEye, FiEdit, FiTrash2,
  FiDollarSign, FiCalendar, FiUser, FiPackage, FiTrendingUp,
  FiDownload, FiMail, FiPhone, FiMapPin, FiCreditCard
} from 'react-icons/fi';
import "./AdminOrders.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
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
        setFilteredOrders(validOrders);
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

  // Filter and search functionality
  useEffect(() => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order._id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === "totalPrice") {
        aValue = parseFloat(aValue || 0);
        bValue = parseFloat(bValue || 0);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchQuery, filterStatus, sortBy, sortOrder]);

  const calculateStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === "pending").length;
    const completedOrders = orders.filter(order => order.status === "completed").length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    setStats({
      totalOrders,
      pendingOrders,
      completedOrders,
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

  const getOrderStatus = (order) => {
    const status = order.status?.toLowerCase();
    switch (status) {
      case 'pending': return { status: 'pending', color: 'orange', icon: FiClock };
      case 'processing': return { status: 'processing', color: 'blue', icon: FiRefreshCw };
      case 'completed': return { status: 'completed', color: 'green', icon: FiCheckCircle };
      case 'cancelled': return { status: 'cancelled', color: 'red', icon: FiXCircle };
      default: return { status: 'unknown', color: 'gray', icon: FiClock };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="enhanced-admin-orders">
        <div className="loading-state">
          <div className="loading-spinner">
            <FiRefreshCw className="spinning" />
          </div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-admin-orders">
      {/* Enhanced Header */}
      <div className="enhanced-orders-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-wrapper">
              <div className="title-icon">
                <FiShoppingBag />
              </div>
              <div className="title-text">
                <h1 className="page-title">Order Management</h1>
                <p className="page-subtitle">Monitor and manage all customer orders</p>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiPackage />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalOrders}</div>
                  <div className="stat-label">Total Orders</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiClock />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.pendingOrders}</div>
                  <div className="stat-label">Pending Orders</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiCheckCircle />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.completedOrders}</div>
                  <div className="stat-label">Completed Orders</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiDollarSign />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    Rs. {stats.totalRevenue.toLocaleString('en-PK')}
                  </div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <FiTrendingUp />
                </div>
                <div className="stat-content">
                  <div className="stat-number">
                    Rs. {Math.round(stats.averageOrderValue).toLocaleString('en-PK')}
                  </div>
                  <div className="stat-label">Average Order</div>
                </div>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="action-btn secondary"
                onClick={fetchOrders}
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'spinning' : ''} />
                <span>Refresh</span>
              </button>

              <button className="action-btn primary">
                <FiDownload />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="enhanced-orders-controls">
        <div className="controls-container">
          <div className="search-section">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search orders by ID, customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-group">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="createdAt">Order Date</option>
                <option value="totalPrice">Total Amount</option>
                <option value="orderNumber">Order Number</option>
                <option value="customerName">Customer Name</option>
              </select>
            </div>

            <button
              className={`sort-btn ${sortOrder === 'asc' ? 'asc' : 'desc'}`}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="view-section">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FiGrid />
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="enhanced-orders-content">
        <div className="content-container">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner">
                <FiRefreshCw className="spinning" />
              </div>
              <p>Loading orders...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className={`orders-${viewMode}`}>
              {viewMode === 'grid' ? (
                <div className="orders-grid">
                  {filteredOrders.map((order) => {
                    const orderStatus = getOrderStatus(order);
                    const StatusIcon = orderStatus.icon;
                    return (
                      <div key={order._id} className="order-card">
                        <div className="card-header">
                          <div className="order-id">
                            <span className="id-label">Order</span>
                            <span className="id-value">#{order.orderNumber || order._id.slice(-8)}</span>
                          </div>
                          <div className={`status-badge ${orderStatus.status}`}>
                            <StatusIcon />
                            <span>{orderStatus.status}</span>
                          </div>
                        </div>

                        <div className="card-content">
                          <div className="customer-info">
                            <div className="customer-details">
                              <FiUser className="detail-icon" />
                              <div>
                                <div className="customer-name">{order.customerName || 'Unknown Customer'}</div>
                                <div className="order-date">{formatDate(order.createdAt)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="order-items">
                            <div className="items-header">
                              <FiPackage className="items-icon" />
                              <span>Items ({order.items?.length || 0})</span>
                            </div>
                            <div className="items-list">
                              {order.items?.slice(0, 3).map((item, index) => (
                                <div key={index} className="item-row">
                                  <span className="item-name">{item.name}</span>
                                  <span className="item-quantity">x{item.quantity}</span>
                                  <span className="item-price">Rs. {item.price}</span>
                                </div>
                              ))}
                              {order.items?.length > 3 && (
                                <div className="more-items">
                                  +{order.items.length - 3} more items
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="order-summary">
                            <div className="summary-row">
                              <span>Subtotal:</span>
                              <span>Rs. {order.subtotal || 0}</span>
                            </div>
                            <div className="summary-row">
                              <span>Tax:</span>
                              <span>Rs. {order.tax || 0}</span>
                            </div>
                            <div className="summary-row total">
                              <span>Total:</span>
                              <span>Rs. {order.totalPrice || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="card-actions">
                          <button
                            className="action-btn secondary small"
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                          >
                            <FiEye />
                            <span>View</span>
                          </button>

                          {order.status === 'pending' && (
                            <>
                              <button
                                className="action-btn success small"
                                onClick={() => handleStatusUpdate(order._id, 'completed')}
                              >
                                <FiCheckCircle />
                                <span>Complete</span>
                              </button>
                              <button
                                className="action-btn danger small"
                                onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                              >
                                <FiXCircle />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          <button className="action-btn secondary small">
                            <FiMail />
                            <span>Contact</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="orders-list">
                  <div className="list-header">
                    <div className="list-header-item">Order</div>
                    <div className="list-header-item">Customer</div>
                    <div className="list-header-item">Date</div>
                    <div className="list-header-item">Items</div>
                    <div className="list-header-item">Total</div>
                    <div className="list-header-item">Status</div>
                    <div className="list-header-item">Actions</div>
                  </div>

                  {filteredOrders.map((order) => {
                    const orderStatus = getOrderStatus(order);
                    const StatusIcon = orderStatus.icon;
                    return (
                      <div key={order._id} className="list-item">
                        <div className="list-cell">
                          <div className="order-info">
                            <div className="order-number">#{order.orderNumber || order._id.slice(-8)}</div>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="customer-info">
                            <div className="customer-name">{order.customerName || 'Unknown'}</div>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="date-info">
                            <div className="order-date">{formatDate(order.createdAt)}</div>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="items-count">
                            {order.items?.length || 0} items
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="total-price">
                            Rs. {order.totalPrice || 0}
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className={`status-badge ${orderStatus.status}`}>
                            <StatusIcon />
                            <span>{orderStatus.status}</span>
                          </div>
                        </div>

                        <div className="list-cell">
                          <div className="actions">
                            <button
                              className="action-btn secondary small"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailsModal(true);
                              }}
                            >
                              <FiEye />
                            </button>

                            {order.status === 'pending' && (
                              <>
                                <button
                                  className="action-btn success small"
                                  onClick={() => handleStatusUpdate(order._id, 'completed')}
                                >
                                  <FiCheckCircle />
                                </button>
                                <button
                                  className="action-btn danger small"
                                  onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                >
                                  <FiXCircle />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FiShoppingBag />
              </div>
              <h3>No Orders Found</h3>
              <p>
                {searchQuery || filterStatus !== "all"
                  ? "No orders match your current filters. Try adjusting your search criteria."
                  : "No orders have been placed yet. Orders will appear here once customers start placing orders."}
              </p>
              {(searchQuery || filterStatus !== "all") && (
                <button
                  className="action-btn primary"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("all");
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="enhanced-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                <FiXCircle />
              </button>
            </div>

            <div className="modal-content">
              <div className="order-details-grid">
                <div className="detail-section">
                  <h3>Order Information</h3>
                  <div className="detail-item">
                    <span className="label">Order Number:</span>
                    <span className="value">#{selectedOrder.orderNumber || selectedOrder._id.slice(-8)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date:</span>
                    <span className="value">{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <div className={`status-badge ${getOrderStatus(selectedOrder).status}`}>
                      {React.createElement(getOrderStatus(selectedOrder).icon)}
                      <span>{getOrderStatus(selectedOrder).status}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{selectedOrder.customerName || 'Unknown Customer'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedOrder.customerEmail || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{selectedOrder.customerPhone || 'N/A'}</span>
                  </div>
                </div>

                <div className="detail-section full-width">
                  <h3>Order Items</h3>
                  <div className="items-table">
                    <div className="items-header">
                      <span>Item</span>
                      <span>Quantity</span>
                      <span>Price</span>
                      <span>Total</span>
                    </div>
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="item-row">
                        <span className="item-name">{item.name}</span>
                        <span className="item-quantity">{item.quantity}</span>
                        <span className="item-price">Rs. {item.price}</span>
                        <span className="item-total">Rs. {item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Order Summary</h3>
                  <div className="summary-table">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>Rs. {selectedOrder.subtotal || 0}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax:</span>
                      <span>Rs. {selectedOrder.tax || 0}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>Rs. {selectedOrder.totalPrice || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {selectedOrder.status === 'pending' && (
                <>
                  <button
                    className="action-btn success"
                    onClick={() => {
                      handleStatusUpdate(selectedOrder._id, 'completed');
                      setShowDetailsModal(false);
                    }}
                  >
                    <FiCheckCircle />
                    <span>Mark Complete</span>
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={() => {
                      handleStatusUpdate(selectedOrder._id, 'cancelled');
                      setShowDetailsModal(false);
                    }}
                  >
                    <FiXCircle />
                    <span>Cancel Order</span>
                  </button>
                </>
              )}
              <button
                className="action-btn secondary"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders; 