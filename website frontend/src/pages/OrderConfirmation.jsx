import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiClock, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';
import axios from 'axios';
import PageLayout from '../components/layout/PageLayout';
import './OrderConfirmation.css';

// Create a configurable axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to handle token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

/**
 * IMPORTANT: This is the correct implementation for the Order Confirmation page
 * It fetches the most recent order dynamically from the API.
 * Do NOT use hardcoded order data for this component.
 */

/**
 * IMPORTANT: This component now uses the same approach as the MyOrders component
 * to ensure we always show the most recent order.
 */
const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Log function to help with troubleshooting if needed
  const logInfo = (message, data) => {
    console.log(`[INFO] ${message}:`, data);
  };
  
  // On component mount, fetch the most recent order
  useEffect(() => {
    logInfo('Component mounted', new Date().toISOString());
    testBackendConnection();
    fetchMostRecentOrder();
  }, []);
  
  // Simple test to check if backend is reachable
  const testBackendConnection = async () => {
    try {
      logInfo("Testing backend connection", {
        url: 'http://localhost:8080/api/health',
        timestamp: new Date().toISOString()
      });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:8080/api/health', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      const status = response.status;
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : 'Not JSON';
      
      logInfo("Backend connection test result", {
        status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
        data: isJson ? data : null,
        timestamp: new Date().toISOString()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (err) {
      logInfo("Backend connection error", {
        name: err.name,
        message: err.message,
        isAbortError: err.name === 'AbortError',
        timestamp: new Date().toISOString()
      });
      
      if (err.name === 'AbortError') {
        // toast.error("Connection timed out. Server might be down.");
      } else if (err.message.includes('Failed to fetch')) {
        // toast.error("Cannot connect to backend server. Please check if it's running.");
      } else {
        // toast.error(`Connection error: ${err.message}`);
      }
    }
  };
  
  // This function uses the same approach as the working MyOrders component
  const fetchMostRecentOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      console.log('DEBUG - Token:', token ? `${token.substring(0, 15)}...` : 'No token found');
      
      logInfo("Token check", {
        available: !!token,
        length: token ? token.length : 0,
        firstChars: token ? token.substring(0, 10) : 'none'
      });
      
      if (!token) {
        setError('Please login to view your order');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }
      
      logInfo("Fetching most recent order", {
        url: '/api/orders',
        timestamp: new Date().toISOString()
      });
      
      // Use API client with error handling
      try {
        const response = await apiClient.get('/api/orders', {
        params: {
          page: 1,
          limit: 1,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          _nocache: new Date().getTime()
        }
      });
      
      logInfo("Server response", response.data);
      
      // Process response exactly like MyOrders does
      if (response.data && 
          response.data.orders && 
          Array.isArray(response.data.orders) && 
          response.data.orders.length > 0) {
        
        const mostRecentOrder = response.data.orders[0];
        logInfo("Most recent order found", {
          id: mostRecentOrder._id,
          createdAt: mostRecentOrder.createdAt,
          status: mostRecentOrder.status
        });
        
        setOrder(mostRecentOrder);
          
          // Save the order ID for future reference
          localStorage.setItem('lastOrderId', mostRecentOrder._id);
          
          // Fetch user profile data and save it to localStorage
          apiClient.get('/api/user/profile')
            .then(userResponse => {
              const userData = userResponse.data;
              console.log("User profile fetched:", userData);
              
              // Save important user details
              localStorage.setItem('userData', JSON.stringify(userData));
              
              if (userData.name) localStorage.setItem('name', userData.name);
              if (userData.email) localStorage.setItem('email', userData.email);
              if (userData.phone) localStorage.setItem('phone', userData.phone);
            })
            .catch(err => console.error("Failed to fetch user profile:", err));
          
        // toast.success("Showing your most recent order");
      } else {
        logInfo("No orders found", response.data);
        setError("No recent orders found. Please place an order first.");
        }
      } catch (apiError) {
        // Handle specific API errors
        logInfo("API Error", {
          message: apiError.message,
          status: apiError.response?.status,
          data: apiError.response?.data
        });
        
        if (apiError.response?.status === 401) {
          setError("Session expired. Please login again.");
          setTimeout(() => navigate('/login'), 2000);
        } else if (apiError.code === 'ECONNABORTED') {
          setError("Request timed out. Server might be down.");
        } else if (!apiError.response) {
          setError("Cannot connect to server. Please try again later.");
        } else {
          setError(`Error: ${apiError.response?.data?.message || 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      logInfo("Error", {
        message: err.message,
        response: err.response?.data
      });
      setError("Failed to load order data. Please try again or check 'My Orders'.");
    } finally {
      setLoading(false);
    }
  };
  
  // Format price with 2 decimal places
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : '0.00';
  };
  
  // Calculate subtotal from items
  const calculateSubtotal = () => {
    if (!order || !order.items) return 0;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  // Check if order is trackable
  const isOrderTrackable = () => {
    if (!order) return false;
    const status = order.status?.toLowerCase() || '';
    return status !== 'delivered' && status !== 'cancelled';
  };
  
  // Handle track order button
  const handleTrackOrder = () => {
    if (!order || !order._id) {
      // toast.error("Order data missing");
      return;
    }
    
    navigate(`/track-order/${order._id}`, { 
      state: { order }
    });
  };
  
  // Handle invoice button
  const handleViewInvoice = () => {
    if (!order || !order._id) {
      // toast.error("Order data missing");
      return;
    }
    
    // Clean up the order object to remove any MongoDB specific properties
    const cleanOrder = {
      _id: order._id,
      user: order.user,
      items: order.items.map(item => {
        // Extract the item name safely using the same logic as in the order summary
        const itemName = item.name || 
                        (item._doc && item._doc.name) || 
                        (item.__parentArray && item.__parentArray[0] && item.__parentArray[0].name) || 
                        'Unknown Item';
                        
        const itemPrice = typeof item.price === 'number' ? item.price : 
                     (item._doc?.price || item.__parentArray?.[0]?.price || 0);
                     
        const itemQuantity = typeof item.quantity === 'number' ? item.quantity : 
                        (item._doc?.quantity || item.__parentArray?.[0]?.quantity || 1);
        
        return {
          name: itemName,
          price: Number(itemPrice),
          quantity: Number(itemQuantity),
          _id: item._id
        };
      }),
      totalPrice: Number(order.totalPrice),
      deliveryFee: Number(order.deliveryFee),
      deliveryAddress: order.deliveryAddress,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
    
    // Store it in localStorage as a backup
    localStorage.setItem('lastOrderId', order._id);
    
    // Also fetch the user profile to ensure user details are available
    const token = localStorage.getItem('token');
    if (token) {
      apiClient.get('/api/user/profile')
        .then(response => {
          console.log("User profile fetched:", response.data);
          localStorage.setItem('userData', JSON.stringify(response.data));
        })
        .catch(err => console.error("Failed to fetch user profile:", err));
    }
    
    // Navigate to the invoice with the cleaned order data
    navigate(`/invoice/${order._id}`, {
      state: { 
        order: cleanOrder,
        // Add current user information to be used in the invoice
        userDetails: {
          name: localStorage.getItem('name') || 'Customer',
          email: localStorage.getItem('email') || '',
          phone: localStorage.getItem('phone') || ''
        }
      }
    });
  };
  

  
  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <div className="order-confirmation-container">
          <div className="loading-spinner-container">
            <div className="spinner"></div>
            <p>Loading your most recent order...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <PageLayout>
        <div className="order-confirmation-container">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <div className="action-buttons">
              <button onClick={() => {
                testBackendConnection();
                fetchMostRecentOrder();
              }}>Try Again</button>
              <button onClick={() => navigate('/my-orders')}>View All Orders</button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  // No order found state
  if (!order) {
    return (
      <PageLayout>
        <div className="order-confirmation-container">
          <div className="error-message">
            <h3>No Order Found</h3>
            <p>We couldn't find any orders for your account.</p>
            <div className="action-buttons">
              <button onClick={() => navigate('/order-food')}>Order Food</button>
              <button onClick={() => navigate('/my-orders')}>View All Orders</button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  // Main render with order data
  return (
    <PageLayout>
      <div className="order-confirmation-container">
        <div className="confirmation-card">
          <div className="confirmation-left">
            <div className="confirmation-header">
              <div className="status-icon">
                <MdRestaurant size={24} />
              </div>
              <h2>Order Confirmed!</h2>
              <p className="order-id">Order ID: {order._id}</p>
              <p className="order-date">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
            </div>

            <div className="delivery-info">
              <div className="info-row">
                <FiClock className="info-icon" />
                <div className="info-content">
                  <p className="info-label">Estimated Delivery Time</p>
                  <p className="info-value">{order.estimatedDelivery || '30-45 minutes'}</p>
                </div>
              </div>

              <div className="info-row">
                <FiMapPin className="info-icon" />
                <div className="info-content">
                  <p className="info-label">Delivery Address</p>
                  <p className="info-value">{order.deliveryAddress || 'Address not available'}</p>
                </div>
              </div>

              <div className="info-row">
                <FiPackage className="info-icon" />
                <div className="info-content">
                  <p className="info-label">Order Status</p>
                  <p className="info-value">{order.status || 'Processing'}</p>
                </div>
              </div>
            </div>

            <div className="action-buttons">
              {isOrderTrackable() && (
                <button className="order-action-btn track-order-btn" onClick={handleTrackOrder}>
                  Track Order
                </button>
              )}
              <button 
                className="order-action-btn view-invoice-btn" 
                onClick={handleViewInvoice}
              >
                View Invoice
              </button>
            </div>
          </div>

          <div className="confirmation-right">
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="order-items">
                {order.items?.map((item, index) => {
                  // Extract the required properties safely from any object structure
                  const itemName = item.name || 
                                  (item._doc && item._doc.name) || 
                                  (item.__parentArray && item.__parentArray[0] && item.__parentArray[0].name) || 
                                  'Unknown Item';
                                  
                  const itemPrice = typeof item.price === 'number' ? item.price : 
                               (item._doc?.price || item.__parentArray?.[0]?.price || 0);
                               
                  const itemQuantity = typeof item.quantity === 'number' ? item.quantity : 
                                  (item._doc?.quantity || item.__parentArray?.[0]?.quantity || 1);
                
                  return (
                  <div key={index} className="order-item">
                    <div className="item-details">
                      <p className="item-name">{itemName}</p>
                      <p className="item-quantity">Qty: {itemQuantity}</p>
                    </div>
                    <p className="item-price">${formatPrice(itemPrice)}</p>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Totals section with blue background */}
        <div className="total-section">
          <div className="subtotal-section">
            <span className="subtotal-label">Subtotal</span>
            <span className="subtotal-value">${formatPrice(calculateSubtotal())}</span>
          </div>
          <div className="delivery-section">
            <span className="delivery-label">Delivery Fee</span>
            <span className="delivery-value">${formatPrice(order.deliveryFee || 0)}</span>
          </div>
          <div className="total-section-inner">
            <span className="total-label">Total</span>
            <span className="total-value">${formatPrice(order.totalPrice || 0)}</span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderConfirmation; 
