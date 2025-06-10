import { useState, useEffect } from "react";
import { Spinner, Alert, Card, ProgressBar, Badge } from "react-bootstrap";
import { useParams } from "react-router-dom";
import useDeliveryTracking from "../hooks/useDeliveryTracking";
import DeliveryMap from "./orders/DeliveryMap";
import "./orders/DeliveryTracking.css";

const DeliveryTracking = () => {
  const { orderId } = useParams();
  const [initialCenter] = useState([73.2100, 34.1600]);
  const { orderStatus, deliveryLocation, socketError } = useDeliveryTracking(orderId);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [statusHistory, setStatusHistory] = useState([]);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
    }
  }, []);

  // Calculate progress based on status
  useEffect(() => {
    const statusMap = {
      'Connecting...': 0,
      'Order Received': 20,
      'Preparing': 40,
      'Ready for Pickup': 60,
      'On the Way': 80,
      'Arriving Soon': 90,
      'Delivered': 100
    };
    
    setProgress(statusMap[orderStatus] || 0);
    
    // Only add to status history if it's a new status
    if (orderStatus && orderStatus !== 'Connecting...' && 
        (!statusHistory.length || statusHistory[statusHistory.length-1].status !== orderStatus)) {
      setStatusHistory(prev => [...prev, {
        status: orderStatus,
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }]);
      setLastUpdateTime(new Date());
    }
  }, [orderStatus, statusHistory]);

  if (!isAuthenticated) {
    return <Alert variant="danger">You must be logged in to track orders.</Alert>;
  }

  // Calculate time since last update
  const getTimeSinceUpdate = () => {
    if (!lastUpdateTime) return '';
    const seconds = Math.floor((new Date() - lastUpdateTime) / 1000);
    if (seconds < 60) return `Updated ${seconds} seconds ago`;
    return `Updated ${Math.floor(seconds / 60)} minutes ago`;
  };

  return (
    <div className="container mt-4">
      <Card className="shadow-sm tracking-card">
        <Card.Body>
          <Card.Title>Order Tracking - #{orderId}</Card.Title>

          {socketError && <Alert variant="warning">{socketError}</Alert>}

          <div className="status-container mb-3">
            <strong>Current Status: </strong>
            <Badge bg={orderStatus === 'Delivered' ? 'success' : 'primary'} className="px-3 py-2">
              {orderStatus}
            </Badge>
            {lastUpdateTime && <small className="text-muted d-block mt-1">{getTimeSinceUpdate()}</small>}
          </div>

          <ProgressBar 
            now={progress} 
            variant={progress === 100 ? "success" : "primary"} 
            className="mb-3" 
            animated={progress < 100}
          />

          {/* Status Timeline */}
          {statusHistory.length > 0 && (
            <div className="status-timeline mb-3">
              <h6>Order Status Updates</h6>
              <div className="timeline-container">
                {statusHistory.map((item, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-badge"></div>
                    <div className="timeline-content">
                      <div className="timeline-status">{item.status}</div>
                      <div className="timeline-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="map-container">
            {!mapLoaded && (
              <div className="map-placeholder">
                <Spinner animation="border" variant="primary" />
                <span className="ms-2">Loading map...</span>
              </div>
            )}

            <DeliveryMap
              deliveryLocation={deliveryLocation}
              initialCenter={initialCenter}
              onLoad={() => setMapLoaded(true)}
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DeliveryTracking;