import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiPackage, FiMapPin, FiClock, FiCheckCircle, FiWifi, FiWifiOff } from 'react-icons/fi';
import { MdRestaurant } from 'react-icons/md';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  initializeSocket, 
  disconnectSocket, 
  subscribeToOrderUpdates,
  formatTimestamp,
  formatEstimatedDelivery
} from '../services/socketService';
import './OrderTracking.css';

// Define timeline statuses outside component
const defaultTimeline = [
  {
    status: 'Order Received',
    description: 'Restaurant has received your order',
    completed: false
  },
  {
    status: 'Preparing',
    description: 'Your food is being prepared',
    completed: false
  },
  {
    status: 'Ready for Pickup',
    description: 'Order is ready for delivery pickup',
    completed: false
  },
  {
    status: 'On the Way',
    description: 'Your order is out for delivery',
    completed: false
  },
  {
    status: 'Arriving Soon',
    description: 'Driver is near your location',
    completed: false
  },
  {
    status: 'Delivered',
    description: 'Your order has been delivered',
    completed: false
  }
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [socketStatus, setSocketStatus] = useState('Initializing...');
  const [socketEvents, setSocketEvents] = useState([]);
  const [showSocketDebug, setShowSocketDebug] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);

  // Calculate progress percentage based on current status
  useEffect(() => {
    if (order && timeline.length > 0) {
      const currentStatus = order.status?.toLowerCase() || 'pending';
      let percentage = 0;
      
      // Map status to percentage
      if (currentStatus === 'pending' || currentStatus === 'order received') {
        percentage = 16; // 1/6 complete
      } else if (currentStatus === 'preparing') {
        percentage = 33; // 2/6 complete
      } else if (currentStatus === 'ready for pickup') {
        percentage = 50; // 3/6 complete
      } else if (currentStatus === 'on the way') {
        percentage = 66; // 4/6 complete
      } else if (currentStatus === 'arriving soon') {
        percentage = 83; // 5/6 complete
      } else if (currentStatus === 'delivered') {
        percentage = 100; // 6/6 complete
      }
      
      setProgressPercentage(percentage);
    }
  }, [order, timeline]);

  // Fetch order data if not available in location state
  useEffect(() => {
    const fetchOrder = async () => {
      // First check if we have a valid order ID
      let validOrderId = orderId;

      if (!validOrderId || validOrderId === 'undefined') {
        // Try getting from localStorage as fallback
        const storedOrderId = localStorage.getItem("lastOrderId");
        if (storedOrderId) {
          console.log("Using orderId from localStorage instead:", storedOrderId);
          validOrderId = storedOrderId;
          
          // Redirect to the correct URL but keep current state
          navigate(`/track-order/${storedOrderId}`, { 
            state: location.state,
            replace: true
          });
          return;
        } else {
        setError('Invalid order ID');
        setLoading(false);
        return;
      }
      }

      console.log("Location state:", location.state);

      // If order is passed via location state, use it and validate it
      if (location.state?.order) {
        console.log("Using order from location state:", location.state.order);
        if (location.state.order._id) {
          console.log("Setting order from location state with ID:", location.state.order._id);
        setOrder(location.state.order);
            
          // Initialize timeline with current status
          const status = location.state.order.status?.toLowerCase() || 'pending';
          setTimeline([{
            status: status === 'pending' ? 'Order Received' : status.charAt(0).toUpperCase() + status.slice(1),
            timestamp: new Date(),
            completed: true
          }]);
            
          setLoading(false);
          return;
        } else {
          console.log("Order in location state doesn't have a valid ID");
        }
      }

      // Check if we have the order in localStorage
      const storedOrderData = localStorage.getItem("lastOrderData");
      if (storedOrderData) {
        try {
          const parsedOrder = JSON.parse(storedOrderData);
          if (parsedOrder && parsedOrder._id) {
            console.log("Using order from localStorage:", parsedOrder);
            setOrder(parsedOrder);
            
            // Initialize timeline with current status
            const status = parsedOrder.status?.toLowerCase() || 'pending';
            setTimeline([{
              status: status === 'pending' ? 'Order Received' : status.charAt(0).toUpperCase() + status.slice(1),
              timestamp: new Date(),
              completed: true
            }]);
            
        setLoading(false);
        return;
          }
        } catch (err) {
          console.error("Error parsing stored order data:", err);
        }
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to track your order');
          setLoading(false);
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        console.log("Fetching order data for ID:", validOrderId);
        console.log("Using token:", token ? "Yes (Token exists)" : "No (Token missing)");
        
        const response = await axios.get(
          `http://localhost:8080/api/orders/${validOrderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log("Order response received:", response);

        if (response.data) {
          console.log("Order data received:", response.data);
          setOrder(response.data);
          
          // Save complete order data to localStorage
          localStorage.setItem("lastOrderData", JSON.stringify(response.data));

          // Initialize timeline with current status
          const status = response.data.status?.toLowerCase() || 'pending';
          console.log("Setting initial status:", status);
          
          const statusObject = {
            status: status === 'pending' ? 'Order Received' : status.charAt(0).toUpperCase() + status.slice(1),
              timestamp: new Date(),
              completed: true
          };

          setTimeline([statusObject]);
          
          // Automatically set estimated delivery time if not present
          if (!estimatedDelivery) {
            const createTime = new Date(response.data.createdAt || new Date());
            const deliveryTime = new Date(createTime.getTime() + (45 * 60 * 1000)); // 45 min delivery
            console.log("Setting estimated delivery time:", deliveryTime);
            setEstimatedDelivery(deliveryTime);
          }
        } else {
          console.error("No data in response");
          setError('No order data returned from server');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        console.error('Error details:', err.response);
        console.error('Status code:', err.response?.status);
        console.error('Error data:', err.response?.data);
        
        if (err.response?.status === 404) {
          setError('Order not found. Please check your order ID.');
        } else if (err.response?.status === 401) {
          setError('Authentication error. Please login again.');
          localStorage.removeItem('token'); // Clear invalid token
          // Redirect to login after a short delay
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response?.status === 403) {
          setError('You are not authorized to view this order.');
        } else {
        setError(err.response?.data?.message || 'Failed to load order details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, location.state, navigate]);

  // Socket connection and updates
  useEffect(() => {
    if (!orderId || orderId === 'undefined' || loading) {
      setSocketStatus('Waiting for order ID...');
      return;
    }

    // Always show tracking regardless of order status
    console.log('Initializing socket for order:', orderId);
    setSocketStatus('Connecting to tracking server...');
    
    // Create a single socket connection
    const socket = initializeSocket(orderId);
    setSocketConnected(!!socket);
    
    // Subscribe to order updates
    const unsubscribe = subscribeToOrderUpdates((data) => {
      console.log('Received order update:', data);
      
      // Show toast notification for each status update
      toast.success(`Order Status: ${data.status}`, {
        duration: 4000,
        position: 'top-center',
        icon: '🔄'
      });
        
      // Update timeline with new status
        setTimeline(prevTimeline => {
        // Format the incoming status properly
        const formattedStatus = data.status;
        
        // Check if this status already exists
        const existingStatusIndex = prevTimeline.findIndex(
          item => item.status.toLowerCase() === formattedStatus.toLowerCase()
        );
        
        if (existingStatusIndex >= 0) {
          // Update existing status
          const updatedTimeline = [...prevTimeline];
          updatedTimeline[existingStatusIndex] = {
            ...updatedTimeline[existingStatusIndex],
            timestamp: data.timestamp || new Date(),
            completed: true,
            highlight: true // Add highlight for animation
          };
          return updatedTimeline;
        } else {
          // Add new status
          const newStatus = {
            status: formattedStatus,
            timestamp: data.timestamp || new Date(),
            completed: true,
            highlight: true, // Add highlight for animation
            description: defaultTimeline.find(s => 
              s.status.toLowerCase() === formattedStatus.toLowerCase()
            )?.description || `Order ${formattedStatus}`
          };
          
          // Sort the timeline to ensure proper order
          const updatedTimeline = [...prevTimeline, newStatus];
          const statusOrder = defaultTimeline.map(s => s.status.toLowerCase());
          
          updatedTimeline.sort((a, b) => {
            const indexA = statusOrder.indexOf(a.status.toLowerCase());
            const indexB = statusOrder.indexOf(b.status.toLowerCase());
            return indexA - indexB;
          });
          
          return updatedTimeline;
        }
      });

      // Clear highlight after animation
      setTimeout(() => {
        setTimeline(prevTimeline => 
          prevTimeline.map(item => ({...item, highlight: false}))
        );
      }, 2000);

        // Update order status
      setOrder(prev => {
        if (!prev) return null;
        
        const updatedOrder = {
          ...prev,
          status: data.status.toLowerCase()
        };

        // Save updated order to localStorage
        localStorage.setItem("lastOrderData", JSON.stringify(updatedOrder));
        
        return updatedOrder;
          });
      });

    // Clean up function
    return () => {
      console.log('Cleaning up socket connection');
      if (unsubscribe) {
        unsubscribe();
      }
      disconnectSocket();
    };
  }, [orderId, loading]);

  // Helper function to add socket event logs
  const addSocketEvent = (message) => {
    setSocketEvents(prev => {
      const timestamp = new Date().toLocaleTimeString();
      return [...prev, { timestamp, message }].slice(-10); // Keep last 10 events
    });
  };

  const handleBackToConfirmation = () => {
    navigate(-1);
  };

  const handleViewInvoice = () => {
    navigate(`/invoice/${orderId}`);
  };

  const handleRefreshOrder = () => {
    // Debounce protection - prevent multiple refreshes in quick succession
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    
    // Only allow refresh every 5 seconds
    if (timeSinceLastRefresh < 5000) {
      toast.error('Please wait before refreshing again', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }
    
    setRefreshing(true);
    setLastRefreshTime(now);
    addSocketEvent('Manual refresh requested');
    
    // Disconnect and wait before reconnecting to avoid multiple connections
    disconnectSocket();
    addSocketEvent('Disconnected socket for refresh');
    
    setTimeout(() => {
      // Create new socket connection
      const socket = initializeSocket(orderId);
      if (socket) {
        setSocketConnected(!!socket.connected);
        setSocketStatus('Reconnected to tracking server');
        addSocketEvent('Socket reconnected successfully');
      } else {
        setSocketStatus('Reconnection failed');
        addSocketEvent('Failed to reconnect socket');
      }
      setRefreshing(false);
    }, 1500); // Increased delay to ensure cleanup completes
  };

  const toggleSocketDebug = () => {
    setShowSocketDebug(prev => !prev);
  };

  if (loading) {
    return (
      <div className="tracking-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="tracking-container">
        <div className="error-message">
          <p>{error || 'Order not found. Please try again later.'}</p>
          <button className="back-button" onClick={handleBackToConfirmation}>
            Back to Order Confirmation
          </button>
        </div>
      </div>
    );
  }

  // Skip the delivered card view (always show tracking)

  const getOrderStatus = () => {
    if (!order.status || order.status === 'pending') return 'Order Received';
    return order.status.charAt(0).toUpperCase() + order.status.slice(1);
  };

  const getEstimatedDelivery = () => {
    if (estimatedDelivery) {
      return formatEstimatedDelivery(estimatedDelivery);
    }
    return '15-20 minutes';
  };

  // Merge real-time updates with default timeline
  const mergedTimeline = defaultTimeline.map(defaultStatus => {
    // Find if we have a real-time update for this status
    const realTimeStatus = timeline.find(item => 
      item.status.toLowerCase() === defaultStatus.status.toLowerCase()
    );
    
    // Determine current status for comparison
    const currentOrderStatus = !order.status || order.status === 'pending' 
      ? 'order received' 
      : order.status.toLowerCase();
    
    // Find indexes for comparison
    const statusIndex = defaultTimeline.findIndex(
      s => s.status.toLowerCase() === currentOrderStatus
    );
    const thisStatusIndex = defaultTimeline.findIndex(
      s => s.status.toLowerCase() === defaultStatus.status.toLowerCase()
    );
    
    // Mark as completed if this status comes before or is the current status
    const isCompleted = thisStatusIndex <= statusIndex;
    
    if (realTimeStatus) {
      return {
        ...defaultStatus,
        ...realTimeStatus,
        completed: isCompleted || realTimeStatus.completed,
        time: formatTimestamp(realTimeStatus.timestamp),
        highlight: realTimeStatus.highlight
      };
    }
    return {
      ...defaultStatus,
      completed: isCompleted,
      time: isCompleted ? formatTimestamp(new Date()) : 'Pending'
    };
  });

  return (
    <div className="tracking-container" id="order-tracking-component">
      <div className="tracking-card">
        <div className="tracking-header">
          <div className="status-icon">
            <MdRestaurant size={24} />
          </div>
          <h2>{getOrderStatus()}</h2>
          
          {/* Progress bar for order status */}
          <div className="status-progress">
            <div 
              className="status-progress-bar" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <p className="estimated-delivery">
            Estimated delivery by<br />
            {getEstimatedDelivery()}
          </p>
          
          {socketConnected && (
            <div className="realtime-indicator">
              Live updates active
            </div>
          )}
          
          <div className="delivery-info">
            <FiMapPin className="icon" />
            <div>
              <p>Delivery to: {order.customerName || 'Customer'}</p>
              <p className="address">{order.deliveryAddress || 'Loading address...'}</p>
            </div>
          </div>
          
          <div className="socket-debug-toggle" onClick={toggleSocketDebug}>
            {socketConnected ? <FiWifi /> : <FiWifiOff />}
            <span className="socket-status">{socketStatus}</span>
          </div>

          <div className="connection-status">
            <span className={socketConnected ? 'connected' : 'disconnected'}>
              {socketConnected ? 'Live Tracking Active' : 'Tracking Disconnected'}
            </span>
            {!socketConnected && order.status?.toLowerCase() !== 'delivered' && (
              <button 
                className="refresh-button" 
                onClick={handleRefreshOrder}
                disabled={refreshing}
              >
                {refreshing ? 'Reconnecting...' : 'Reconnect'}
              </button>
            )}
          </div>

          {showSocketDebug && (
            <div className="socket-debug-panel">
              <h4>Socket Connection Details</h4>
              <div className="socket-info">
                <div className="socket-info-row">
                  <span className="socket-label">Status:</span>
                  <span className={`socket-value ${socketConnected ? 'connected' : 'disconnected'}`}>
                    {socketStatus}
                  </span>
                </div>
                <div className="socket-info-row">
                  <span className="socket-label">Order ID:</span>
                  <span className="socket-value">{orderId}</span>
                </div>
                <div className="socket-info-row">
                  <span className="socket-label">Server:</span>
                  <span className="socket-value">http://localhost:8080</span>
                </div>
              </div>
              
              <h4>Socket Event Log</h4>
              <div className="socket-events">
                {socketEvents.length === 0 ? (
                  <p className="no-events">No socket events yet</p>
                ) : (
                  socketEvents.map((event, index) => (
                    <div key={index} className="socket-event">
                      <span className="event-time">{event.timestamp}</span>
                      <span className="event-message">{event.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="tracking-details">
          <p className="tracking-label">Order ID: {orderId}</p>
        </div>

        <div className="timeline-container">
          {mergedTimeline.map((event, index) => (
            <div 
              key={index} 
              className={`timeline-message ${event.completed ? 'completed' : ''} ${
                !event.completed && index > 0 && mergedTimeline[index - 1].completed ? 'current' : ''
              } ${event.highlight ? 'highlight-animation' : ''}`}
            >
              <div className="message-dot"></div>
              <div className="message-content">
                <h4>{event.status}</h4>
                <p>{event.description}</p>
                <span className="message-time">
                  {event.time || 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 