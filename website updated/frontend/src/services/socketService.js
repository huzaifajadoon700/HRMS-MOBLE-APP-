// src/services/socketService.js
import io from 'socket.io-client';

const SOCKET_SERVER = "http://localhost:8080";

let socketInstance = null;
let activeCallbacks = new Set();
let activeOrderId = null;

export const initializeSocket = (orderId) => {
  if (!orderId) {
    console.error('[Socket] No order ID provided');
    return null;
  }

  // If already tracking this order with an active socket, return it
  if (socketInstance && socketInstance.connected && activeOrderId === orderId) {
    console.log('[Socket] Already tracking order:', orderId);
    return socketInstance;
  }
  
  // Clean up any existing socket
  if (socketInstance) {
    console.log('[Socket] Cleaning up existing socket');
    cleanupSocket();
  }

  // Store order ID and create new socket
  activeOrderId = orderId;
  console.log('[Socket] Creating new connection for order:', orderId);
  
  socketInstance = io(SOCKET_SERVER, {
    transports: ["websocket", "polling"],
    reconnection: true,
    timeout: 10000
  });

  // Set up event handlers
  socketInstance.on('connect', () => {
    console.log('[Socket] Connected to server');
    
    // Start tracking once connected
    socketInstance.emit('trackOrder', { orderId });
    console.log('[Socket] Tracking request sent for order:', orderId);
  });

  socketInstance.on('disconnect', () => {
    console.log('[Socket] Disconnected from server');
  });

  socketInstance.on('error', (error) => {
    console.error('[Socket] Error:', error);
  });

  // Handle order updates
  socketInstance.on('orderUpdate', (data) => {
    console.log('[Socket] Received update:', data);
    
    // Only process updates for the order we're tracking
    if (data.orderId === activeOrderId) {
      activeCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('[Socket] Error in callback:', error);
        }
      });
    }
  });

  return socketInstance;
};

const cleanupSocket = () => {
  if (socketInstance) {
    socketInstance.removeAllListeners();
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const disconnectSocket = () => {
  console.log('[Socket] Disconnecting socket');
  cleanupSocket();
  activeCallbacks.clear();
  activeOrderId = null;
};

export const subscribeToOrderUpdates = (callback) => {
  if (!callback || typeof callback !== 'function') {
    console.error('[Socket] Invalid callback');
    return () => {};
  }

  activeCallbacks.add(callback);
  console.log('[Socket] Added update subscription');
  
  return () => {
    activeCallbacks.delete(callback);
    console.log('[Socket] Removed update subscription');
  };
};

export const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '';
  }
};

export const formatEstimatedDelivery = (timestamp) => {
  if (!timestamp) return '30 minutes';
  
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return '30 minutes';
  }
};