// src/hooks/useDeliveryTracking.js
import { useEffect, useState } from 'react';
import { initializeSocket, disconnectSocket, subscribeToOrderUpdates } from '../services/socketService';

const useDeliveryTracking = (orderId) => {
  const [orderStatus, setOrderStatus] = useState('Connecting...');
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [socketError, setSocketError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const socket = initializeSocket(orderId);
    
    // Emit the trackOrder event to trigger backend updates
    socket.emit("trackOrder", { orderId });

    // Use the subscription method from socketService
    const unsubscribe = subscribeToOrderUpdates((data) => {
      console.log('Order update received:', data);
      if (data.orderId === orderId) {
        setOrderStatus(data.status);
        
        // Mock a delivery location update for map animation
        if (data.status !== 'Order Received' && data.status !== 'Delivered') {
          // Create random movement around the initial location
          const randomOffset = () => (Math.random() - 0.5) * 0.01;
          setDeliveryLocation({
            lng: 73.2100 + randomOffset(),
            lat: 34.1600 + randomOffset()
          });
        }
      }
    });

    socket.on('connect_error', (err) => {
      setSocketError('Connection error. Trying to reconnect...');
      console.error('Connection error:', err);
    });

    return () => {
      unsubscribe(); // Clean up the subscription
      socket.off('connect_error');
      disconnectSocket();
    };
  }, [orderId]);

  return { orderStatus, deliveryLocation, socketError };
};

export default useDeliveryTracking;
