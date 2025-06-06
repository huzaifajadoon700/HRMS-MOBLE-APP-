import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { Button, Table, Form, Card, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "react-toastify";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import "./Cart.css";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RQDO0QHBrXA72xgYssbECOe9bubZ2bWHA4m0T6EY6AvvmAfCzIDmKUCkRjpwVVIJ4IMaOiQBUawECn5GD8ADHbn00GRVmjExI');

// Payment Form Component
const PaymentForm = ({ onPaymentSuccess, totalPrice, onCancel, cart }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    if (!cardComplete) {
      setError('Please complete all card details.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      console.log('Creating payment method...');
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        setError(stripeError.message);
        return;
      }

      console.log('Payment method created:', paymentMethod.id);

      // Send the payment method ID to your server
      const response = await axios.post(
        'http://localhost:8080/api/payment/menu-payment',
        {
          amount: totalPrice,
          currency: 'usd',
          paymentMethodId: paymentMethod.id,
          orderItems: cart.map(item => ({
            id: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        await onPaymentSuccess(response.data.paymentIntent.id);
      } else {
        throw new Error(response.data.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred while processing your payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="payment-container">
      <h3>Payment Details</h3>
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label className="card-label">Card Information</label>
          <div className="card-element-container">
            <CardElement
              onChange={(event) => {
                setError(null);
                setCardComplete(event.complete);
                if (event.error) {
                  setError(event.error.message);
                }
              }}
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
                hidePostalCode: true
              }}
            />
          </div>
        </div>
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}
        <div className="payment-buttons">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Back
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!stripe || processing || !cardComplete}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              `Pay $${totalPrice}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Add this CSS to your Cart.css file
const styles = `
.stripe-card-element {
  padding: 10px;
}

.card-element-container {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background-color: #fff;
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

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
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || cart.length === 0) return;

    const handleMapClick = (e) => {
      const newCoords = [e.lngLat.lng, e.lngLat.lat];
      setCoordinates(newCoords);
      if (marker) {
        marker.setLngLat(newCoords);
      }
      updateAddressFromCoordinates(newCoords);
      calculateDeliveryFee(newCoords);
      if (map) {
        updateRoute(map, RESTAURANT_COORDS, newCoords);
      }
    };

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

  const handleRemoveItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Item removed from cart");
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Quantity updated");
  };

  const handlePaymentSuccess = async (paymentMethodId) => {
    const token = localStorage.getItem("token");
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

    setIsLoading(true);
    setError(null);

    try {
      // Calculate total price
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalPrice = parseFloat((subtotal + deliveryFee).toFixed(2));

      // Format order items
      const items = cart.map(item => ({
        itemId: item._id,
        name: item.name,
        price: parseFloat(item.price.toFixed(2)),
        quantity: parseInt(item.quantity)
      }));

      // Format location data
      const locationData = {
        type: "Point",
        coordinates: coordinates.map(coord => parseFloat(coord.toFixed(6)))
      };

      const orderData = {
        items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        totalPrice,
        deliveryFee: parseFloat(deliveryFee.toFixed(2)),
        deliveryAddress: deliveryAddress.trim(),
        deliveryLocation: locationData,
        paymentDetails: {
          method: 'card',
          paymentMethodId
        },
        status: "pending",
        deliveryStatus: "pending"
      };

      console.log('Sending order data:', orderData); // Debug log

      const response = await axios.post(
        "http://localhost:8080/api/orders",
        orderData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data) {
        toast.success("Order placed successfully!");
        localStorage.removeItem("cart");
        setCart([]);
        window.dispatchEvent(new Event("cartUpdated"));
        
        navigate('/order-confirmation', { 
          state: { 
            order: {
              ...response.data,
              items,
              deliveryFee: orderData.deliveryFee,
              totalPrice: orderData.totalPrice,
              deliveryAddress: orderData.deliveryAddress
            }
          }
        });
      }
    } catch (error) {
      console.error("Error placing order:", error.response?.data || error);
      let errorMessage = "Failed to place order. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message.includes('card')) {
        errorMessage = error.message;
      }
      
      // Show detailed error for debugging
      console.log('Full error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      setError(errorMessage);
      toast.error(errorMessage);
      setShowPayment(true); // Keep payment form visible on error
    } finally {
      setIsLoading(false);
    }
  };

  // Wrap Elements provider with useMemo to prevent re-renders
  const stripeElementsOptions = useMemo(() => ({
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css?family=Roboto',
      },
    ],
  }), []);

  if (showPayment) {
    return (
      <div className="cart-container">
        <Elements stripe={stripePromise} options={stripeElementsOptions}>
          <PaymentForm 
            onPaymentSuccess={handlePaymentSuccess}
            totalPrice={(cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryFee).toFixed(2)}
            onCancel={() => setShowPayment(false)}
            cart={cart}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>My Cart</h2>
      {cart.length === 0 ? (
        <Alert variant="info">Your cart is empty.</Alert>
      ) : (
        <>
          <div className="row">
            <div className="col-md-8">
              <Table striped bordered hover variant="dark" className="cosmic-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ width: "15%" }}>Price</th>
                    <th style={{ width: "20%" }}>Quantity</th>
                    <th style={{ width: "15%" }}>Total</th>
                    <th style={{ width: "15%" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>
                        <div className="quantity-controls">
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                            className="quantity-btn"
                          >
                            -
                          </Button>
                          <span className="quantity-display">{item.quantity}</span>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                            className="quantity-btn"
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td>${(item.price * item.quantity).toFixed(2)}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          className="remove-btn"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <div className="col-md-4 ">
              <Card className="delivery-card">
                <Card.Body>
                  <Card.Title>Delivery Details</Card.Title>
                  <div className="delivery-details-grid">
                    <div id="map" ref={mapContainer} />
                    
                    <Form.Group>
                      <Form.Label>Delivery Address</Form.Label>
                      <Form.Control
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter delivery address"
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Contact Number</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Your phone number"
                      />
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Delivery Notes</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Any special instructions"
                      />
                    </Form.Group>
                  </div>

                  <div className="fee-breakdown">
                    <p>
                      <span>Subtotal:</span>
                      <span>${cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
                    </p>
                    <p>
                      <span>Delivery Fee:</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </p>
                    <h4>
                      <span>Total Amount:</span>
                      <span>${(cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryFee).toFixed(2)}</span>
                    </h4>
                  </div>

                  <Button 
                    variant="primary" 
                    onClick={() => {
                      if (cart.length === 0) {
                        toast.error("Your cart is empty!");
                        return;
                      }
                      if (!deliveryAddress.trim()) {
                        toast.error("Please enter a delivery address");
                        return;
                      }
                      setShowPayment(true);
                    }}
                    className="place-order-btn"
                    disabled={isLoading || cart.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </Button>
                </Card.Body>
              </Card>
            </div>
          </div>

          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </>
      )}
    </div>
  );
}
