import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "react-toastify";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiMapPin,
  FiPhone,
  FiMessageSquare,
  FiCreditCard,
  FiDollarSign,
  FiTruck,
  FiClock
} from "react-icons/fi";
import "./ModernCart.css";

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
          currency: 'pkr',
          paymentMethodId: paymentMethod.id,
          orderItems: cart.map(item => ({
            menuItemId: item._id,
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
              `Pay Rs. ${totalPrice}`
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      // Calculate fee: Rs. 50 base fee + Rs. 10 per km
      const fee = Math.max(50, Math.ceil(50 + (distance * 10)));
      setDeliveryFee(fee);
    } catch (error) {
      console.error("Error calculating delivery fee:", error);
      setDeliveryFee(50); // Default fee
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
        menuItemId: item._id,
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
    <div className="modern-cart-page">
      {/* Hero Section */}
      <section className="cart-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <FiShoppingCart size={48} />
          </div>
          <h1 className="hero-title">Shopping Cart</h1>
          <p className="hero-subtitle">Review your items and proceed to checkout</p>
        </div>
      </section>

      <div className="cart-content">
        <div className="container-fluid">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-card">
                <FiShoppingCart size={64} className="empty-icon" />
                <h3>Your cart is empty</h3>
                <p>Add some delicious items to get started!</p>
                <button
                  className="browse-menu-btn"
                  onClick={() => navigate("/order-food")}
                >
                  <FiShoppingCart className="btn-icon" />
                  Browse Menu
                </button>
              </div>
            </div>
          ) : (
            <div className="cart-layout">
              {/* Cart Items Section */}
              <div className="cart-items-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <FiShoppingCart className="section-icon" />
                    Cart Items ({cart.length})
                  </h2>
                </div>

                <div className="cart-items-grid">
                  {cart.map((item, index) => (
                    <div key={index} className="cart-item-card">
                      <div className="item-info">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-price">Rs. {item.price.toFixed(0)} each</p>
                      </div>

                      <div className="item-controls">
                        <div className="quantity-section">
                          <label className="quantity-label">Quantity</label>
                          <div className="quantity-controls">
                            <button
                              className="quantity-btn decrease"
                              onClick={() => handleUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                            >
                              <FiMinus />
                            </button>
                            <span className="quantity-display">{item.quantity}</span>
                            <button
                              className="quantity-btn increase"
                              onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </div>

                        <div className="item-total">
                          <span className="total-label">Total</span>
                          <span className="total-price">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                        </div>

                        <button
                          className="remove-btn"
                          onClick={() => handleRemoveItem(index)}
                          title="Remove item"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Delivery & Checkout Section */}
              <div className="checkout-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <FiTruck className="section-icon" />
                    Delivery Details
                  </h2>
                </div>

                <div className="delivery-card">
                  <div className="map-container">
                    <div id="map" ref={mapContainer} className="delivery-map" />
                  </div>

                  <div className="delivery-form">
                    <div className="form-group">
                      <label className="form-label">
                        <FiMapPin className="label-icon" />
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Enter your delivery address"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiPhone className="label-icon" />
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Your phone number"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <FiMessageSquare className="label-icon" />
                        Delivery Notes
                      </label>
                      <textarea
                        placeholder="Any special instructions for delivery"
                        className="form-textarea"
                        rows="3"
                      />
                    </div>
                  </div>

                  <div className="order-summary">
                    <h3 className="summary-title">
                      <FiDollarSign className="summary-icon" />
                      Order Summary
                    </h3>

                    <div className="summary-breakdown">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>Rs. {cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(0)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Delivery Fee:</span>
                        <span>Rs. {deliveryFee.toFixed(0)}</span>
                      </div>
                      <div className="summary-row delivery-time">
                        <span>
                          <FiClock className="time-icon" />
                          Estimated Delivery:
                        </span>
                        <span>30-45 minutes</span>
                      </div>
                      <div className="summary-total">
                        <span>Total Amount:</span>
                        <span>Rs. {(cart.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryFee).toFixed(0)}</span>
                      </div>
                    </div>

                    <button
                      className="checkout-btn"
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
                      disabled={isLoading || cart.length === 0}
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiCreditCard className="btn-icon" />
                          Proceed to Payment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
