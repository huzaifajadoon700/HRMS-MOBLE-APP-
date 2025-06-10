import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiSearch,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiPackage,
  FiDollarSign,
  FiCalendar,
  FiRefreshCw,
  FiEye
} from "react-icons/fi";
import "./MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc"
  });
  const navigate = useNavigate();

  // Function to check if an order should be marked as delivered
  const checkOrderDeliveryStatus = (order) => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return false;
    
    // If the order is more than 2 hours old, it should be delivered
    const orderDate = new Date(order.createdAt);
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - orderDate.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Also consider a shorter timeframe for testing - 10 minutes
    const minutesDiff = timeDiff / (1000 * 60);
    
    return hoursDiff > 2 || minutesDiff > 10; // Use either condition
  };

  // Function to update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `http://localhost:8080/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state immediately
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // Fetch initial orders
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch orders when page or filters change
  useEffect(() => {
    fetchOrders();
  }, [page, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      
      console.log("Fetching orders with token:", token ? "Present" : "Missing");
      
      const response = await axios.get(`http://localhost:8080/api/orders`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          page,
          limit: 10,
          ...filters
        }
      });

      console.log("Orders response:", response.data);

      if (response.data && Array.isArray(response.data.orders)) {
        // Check and update status of any old orders
        const updatedOrders = response.data.orders.map(order => {
          if (checkOrderDeliveryStatus(order)) {
            // Update status server-side (but don't wait for response)
            updateOrderStatus(order._id, 'delivered');
            return { ...order, status: 'delivered' };
          }
          return order;
        });
        
        setOrders(updatedOrders);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.response?.data?.message || "Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/api/orders/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert(error.response?.data?.message || "Failed to cancel order. Please try again.");
    }
  };

  const handleViewInvoice = (order) => {
    if (!order || !order._id) {
      return;
    }
    navigate(`/invoice/${order._id}`);
  };

  const calculateOrderTotal = (order) => {
    if (!order || !order.items) return 0;
    
    const subtotal = order.items.reduce((sum, item) => {
      return sum + ((item.price || 0) * (item.quantity || 0));
    }, 0);
    
    const deliveryFee = order.deliveryFee || 50; // Default delivery fee in Rs.
    return subtotal + deliveryFee;
  };

  // Loading and error states are handled in the modern UI below

  return (
    <div className="modern-orders-page">
      {/* Hero Section */}
      <section className="orders-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <FiShoppingBag size={48} />
          </div>
          <h1 className="hero-title">My Orders</h1>
          <p className="hero-subtitle">Track and manage your food orders</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="orders-stats">
        <div className="container-fluid">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FiPackage />
              </div>
              <div className="stat-content">
                <h3>{orders.length}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiClock />
              </div>
              <div className="stat-content">
                <h3>{orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing').length}</h3>
                <p>Active Orders</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiTruck />
              </div>
              <div className="stat-content">
                <h3>{orders.filter(o => o.status === 'delivered').length}</h3>
                <p>Delivered</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <FiDollarSign />
              </div>
              <div className="stat-content">
                <h3>Rs. {orders.reduce((sum, o) => sum + (calculateOrderTotal(o) || 0), 0).toFixed(0)}</h3>
                <p>Total Spent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Controls Section */}
      <section className="orders-controls">
        <div className="container-fluid">
          <div className="controls-grid">
            <div className="search-section">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
            <div className="filter-section">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="status-filter"
              >
                <option value="">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="refresh-section">
              <button
                className="refresh-btn"
                onClick={fetchOrders}
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'spinning' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="orders-content">
        <div className="container-fluid">
          {loading ? (
            <div className="loading-section">
              <div className="loading-spinner">
                <FiRefreshCw className="spinning" size={32} />
                <p>Loading your orders...</p>
              </div>
            </div>
          ) : error ? (
            <div className="error-section">
              <div className="error-card">
                <FiXCircle size={48} className="error-icon" />
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={fetchOrders}>
                  Try Again
                </button>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-section">
              <div className="empty-card">
                <FiShoppingBag size={64} className="empty-icon" />
                <h3>No Orders Found</h3>
                <p>You haven't placed any orders yet. Start ordering delicious food!</p>
                <button className="order-btn" onClick={() => navigate("/order-food")}>
                  <FiShoppingBag className="btn-icon" />
                  Order Now
                </button>
              </div>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => {
                const total = calculateOrderTotal(order);
                const statusIcon = {
                  pending: <FiClock />,
                  confirmed: <FiCheckCircle />,
                  preparing: <FiPackage />,
                  ready: <FiTruck />,
                  delivered: <FiCheckCircle />,
                  cancelled: <FiXCircle />
                };

                return (
                  <div key={order._id} className="modern-order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3 className="order-id">#{order._id?.slice(-6) || 'N/A'}</h3>
                        <p className="order-date">
                          <FiCalendar className="date-icon" />
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Date not available'}
                        </p>
                      </div>
                      <div className={`order-status status-${(order.status || 'pending').toLowerCase()}`}>
                        {statusIcon[order.status || 'pending']}
                        <span>{order.status || 'Pending'}</span>
                      </div>
                    </div>

                    <div className="order-items">
                      <h4 className="items-title">
                        <FiShoppingBag className="items-icon" />
                        Order Items
                      </h4>
                      <div className="items-list">
                        {(order.items || []).map((item, index) => {
                          const itemName = item.name ||
                                        (item._doc && item._doc.name) ||
                                        (item.__parentArray && item.__parentArray[0] && item.__parentArray[0].name) ||
                                        'Unknown Item';

                          const itemQuantity = typeof item.quantity === 'number' ? item.quantity :
                                      (item._doc?.quantity || item.__parentArray?.[0]?.quantity || 1);

                          return (
                            <div key={index} className="item-row">
                              <div className="item-details">
                                <span className="item-name">{itemName}</span>
                                <span className="item-quantity">Qty: {itemQuantity || 0}</span>
                              </div>
                              <span className="item-price">Rs. {(item.price || 0).toFixed(0)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="order-summary">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>Rs. {((total - (order.deliveryFee || 50)) || 0).toFixed(0)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Delivery Fee:</span>
                        <span>Rs. {(order.deliveryFee || 50).toFixed(0)}</span>
                      </div>
                      <div className="summary-total">
                        <span>Total Amount:</span>
                        <span>Rs. {total.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="order-actions">
                      {(order.status === 'pending' || !order.status) && (
                        <button
                          className="action-btn cancel-btn"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          <FiXCircle className="btn-icon" />
                          Cancel
                        </button>
                      )}

                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          className="action-btn track-btn"
                          onClick={() => navigate(`/track-order/${order._id}`)}
                        >
                          <FiClock className="btn-icon" />
                          Track Order
                        </button>
                      )}

                      <button
                        className="action-btn invoice-btn"
                        onClick={() => handleViewInvoice(order)}
                        disabled={!order._id}
                      >
                        <FiEye className="btn-icon" />
                        View Invoice
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-section">
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyOrders;