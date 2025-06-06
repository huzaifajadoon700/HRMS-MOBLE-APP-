import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button, Table, Form, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "react-toastify";
import PageLayout from "../components/layout/PageLayout";
import "../styles/theme.css";
import "./Cart.css";

mapboxgl.accessToken = "pk.eyJ1IjoiaHV6YWlmYXQiLCJhIjoiY203bTQ4bW1oMGphYjJqc2F3czdweGp2MCJ9.w5qW_qWkNoPipYyb9MsWUw";

// Default coordinates for Abbottabad
const ABBOTTABAD_COORDS = [73.2215, 34.1688];
const RESTAURANT_COORDS = [73.2100, 34.1600];

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState("Abbottabad, Pakistan");
  const [coordinates, setCoordinates] = useState(ABBOTTABAD_COORDS);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapContainer = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || cart.length === 0) return;

    // Initialize map with Abbottabad coordinates
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: ABBOTTABAD_COORDS,
      zoom: 13,
    });

    // Add restaurant marker
    const restaurantEl = document.createElement('div');
    restaurantEl.className = 'restaurant-marker';
    restaurantEl.innerHTML = '🏠';
    new mapboxgl.Marker({ element: restaurantEl })
      .setLngLat(RESTAURANT_COORDS)
      .addTo(newMap);

    // Add delivery location marker
    const deliveryEl = document.createElement('div');
    deliveryEl.className = 'delivery-marker';
    deliveryEl.innerHTML = '📍';
    const newMarker = new mapboxgl.Marker({ element: deliveryEl, draggable: true })
      .setLngLat(ABBOTTABAD_COORDS)
      .addTo(newMap);

    // Add route line
    newMap.on('load', () => {
      updateRoute(newMap, RESTAURANT_COORDS, ABBOTTABAD_COORDS);
    });

    // Add click handler
    newMap.on('click', handleMapClick);
    newMarker.on('dragend', () => {
      const newCoords = newMarker.getLngLat().toArray();
      setCoordinates(newCoords);
      updateAddressFromCoordinates(newCoords);
      calculateDeliveryFee(newCoords);
      updateRoute(newMap, RESTAURANT_COORDS, newCoords);
    });

    setMap(newMap);
    setMarker(newMarker);

    // Calculate initial delivery fee
    calculateDeliveryFee(ABBOTTABAD_COORDS);

    return () => {
      newMap.remove();
    };
  }, [cart.length]);

  const updateAddressFromCoordinates = async (coords) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?access_token=${mapboxgl.accessToken}`
      );
      
      if (response.data.features && response.data.features.length > 0) {
        const address = response.data.features[0].place_name;
        setDeliveryAddress(address);
      }
    } catch (error) {
      console.error("Error getting address:", error);
    }
  };

  const updateRoute = (map, start, end) => {
    if (map.getSource('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    }

    map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [start, end]
        }
      }
    });

    map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#00a3ff',
        'line-width': 3,
      },
    });
  };

  const calculateDeliveryFee = async (coords) => {
    try {
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${RESTAURANT_COORDS[0]},${RESTAURANT_COORDS[1]};${coords[0]},${coords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      const distance = response.data.routes[0].distance / 1000; // Convert to km
      // Calculate fee: $2 base fee + $0.5 per km
      const fee = Math.max(2, Math.ceil(2 + (distance * 0.5)));
      setDeliveryFee(fee);
    } catch (error) {
      console.error("Error calculating delivery fee:", error);
      setDeliveryFee(2); // Default fee
    }
  };

  const handleMapClick = (e) => {
    const newCoords = [e.lngLat.lng, e.lngLat.lat];
    setCoordinates(newCoords);
    if (marker) {
      marker.setLngLat(newCoords);
    }
    updateAddressFromCoordinates(newCoords);
    calculateDeliveryFee(newCoords);
    updateRoute(map, RESTAURANT_COORDS, newCoords);
  };

  const handleRemoveItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Item removed from cart");
  };

  // Function to ensure localStorage cleanup before creating a new order
  const cleanupStorage = () => {
    console.log("Cleaning up localStorage before placing new order");
    
    // Remove any previous order data
    localStorage.removeItem("lastOrderId");
    localStorage.removeItem("lastOrderData");
    
    // Remove any other order-related data
    const keysToRemove = [];
    
    // Find all keys that might be related to orders
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes("order") || 
        key.includes("invoice") || 
        key.includes("OrderData") ||
        key.includes("OrderId")
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Remove the identified keys
    keysToRemove.forEach(key => {
      console.log("Removing localStorage key:", key);
      localStorage.removeItem(key);
    });
    
    console.log("Storage cleanup complete");
    
    // Also clear any sessionStorage that might be caching order data
    try {
      sessionStorage.clear();
      console.log("Session storage cleared");
    } catch (e) {
      console.error("Error clearing session storage:", e);
    }
  };

  const handleCheckout = async () => {
    console.log("==== ORDER PLACEMENT DEBUGGING ====");
    const token = localStorage.getItem("token");
    console.log("Token present:", !!token);
    
    if (!token) {
      toast.error("You must be logged in to place an order");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast.error("Please enter a delivery address");
      return;
    }

    if (!coordinates || !coordinates.length) {
      toast.error("Please select a delivery location on the map");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clean up any previous order data from localStorage
      console.log("Cleaning up localStorage before placing order");
      cleanupStorage();
      
      const orderData = {
        items: cart.map(item => ({
          itemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryFee,
        deliveryFee,
        deliveryAddress,
        deliveryLocation: {
          type: "Point",
          coordinates: coordinates,
        },
        status: "pending"
      };

      console.log("Prepared order data:", JSON.stringify(orderData, null, 2));
      console.log("Sending order data to server...");
      
      const response = await axios.post(
        "http://localhost:8080/api/orders",
        orderData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          } 
        }
      );

      console.log("Server response status:", response.status);
      console.log("Full server response data:", JSON.stringify(response.data, null, 2));

      if (response.status === 201) {
        toast.success("Order placed successfully!");
        localStorage.removeItem("cart");
        setCart([]);
        window.dispatchEvent(new Event("cartUpdated"));
        
        // Extract order details from response
        const orderResponse = response.data;
        console.log("Order response received:", orderResponse);
        
        // Get the complete order object from the response
        const orderObj = orderResponse.order || {};
        let orderId = null;
        
        // Find the order ID
        if (orderResponse.orderId) {
          orderId = orderResponse.orderId;
          console.log("Found orderId in response.orderId:", orderId);
        } else if (orderObj && orderObj._id) {
          orderId = orderObj._id;
          console.log("Found orderId in response.order._id:", orderId);
        } else if (typeof orderResponse.order === 'string') {
          orderId = orderResponse.order;
          console.log("Found orderId in response.order string:", orderId);
        }
        
        console.log("Final determined orderId:", orderId);
        
        // Ensure the order object has at least a valid ID
        if (!orderId) {
          console.error("Missing order ID in response", orderResponse);
          toast.error("Order was placed but could not retrieve order details");
        }
        
        // Clean up any existing order data from localStorage
        console.log("Cleaning order-related localStorage keys");
        Object.keys(localStorage).forEach(key => {
          if (key.includes('order') || key.includes('Order')) {
            console.log(`Clearing stale order data: ${key}`);
            localStorage.removeItem(key);
          }
        });
        
        // Store a timestamp with the new order to ensure it's recognized as the most recent
        const timestamp = new Date().getTime();
        localStorage.setItem("lastOrderTimestamp", timestamp.toString());
        console.log("Set lastOrderTimestamp in localStorage:", timestamp);
        
        // Create a complete order object for navigation
        const completeOrderObj = {
          ...orderObj,
          _id: orderId,
          items: orderData.items,
          createdAt: new Date().toISOString(),
          status: "pending",
          deliveryFee: deliveryFee,
          totalPrice: orderData.totalPrice,
          deliveryAddress: deliveryAddress
        };
        
        console.log("Complete order object for navigation:", completeOrderObj);
        console.log("Navigating to order confirmation with state data...");
        
        // Navigate with the most complete order data possible
        navigate("/order-confirmation", { 
          state: { 
            order: completeOrderObj,
            orderId: orderId,
            timestamp: timestamp
          }
        });
        
        console.log("Navigation completed");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      console.error("Error response:", error.response);
      setError(error.response?.data?.message || "Failed to place order. Please try again.");
      toast.error(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">My Cart</h1>
          <p className="page-subtitle">Review your order and proceed to checkout</p>
        </div>

        <div className="cart-container container">
          {cart.length === 0 ? (
            <div className="empty-state glass animate-fade-in">
              <div className="empty-state-icon">🛒</div>
              <h3 className="empty-state-title">Your cart is empty</h3>
              <p className="empty-state-text">Add some delicious items to your cart to proceed with your order.</p>
              <Button 
                variant="primary" 
                className="btn btn-primary"
                onClick={() => navigate('/order-food')}
              >
                Browse Menu
              </Button>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items glass animate-fade-in">
                <Table responsive className="cosmic-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>${item.price}</td>
                        <td>{item.quantity}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                        <td>
                          <Button
                            variant="danger"
                            size="sm"
                            className="btn btn-danger"
                            onClick={() => handleRemoveItem(index)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="delivery-section glass animate-fade-in">
                <Card className="delivery-card">
                  <Card.Body>
                    <Card.Title>Delivery Details</Card.Title>
                    <div id="map" ref={mapContainer} className="map-container" />
                    <p className="map-instruction">Click on the map or drag the marker to select delivery location</p>
                    <div className="fee-breakdown">
                      <p>Subtotal: ${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</p>
                      <p>Delivery Fee: ${deliveryFee.toFixed(2)}</p>
                      <h4>Total: ${(cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryFee).toFixed(2)}</h4>
                    </div>
                    <Form.Group className="mb-3">
                      <Form.Label>Delivery Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter delivery address"
                        className="form-control"
                      />
                    </Form.Group>
                    <Button 
                      variant="success" 
                      onClick={handleCheckout} 
                      className="btn btn-primary w-100"
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Place Order"}
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="danger" className="error-alert glass animate-fade-in">
              {error}
            </Alert>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
