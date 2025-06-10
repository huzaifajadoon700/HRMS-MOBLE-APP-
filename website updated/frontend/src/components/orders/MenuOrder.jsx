import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './MenuOrder.css';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51RQDO0QHBrXA72xgYssbECOe9bubZ2bWHA4m0T6EY6AvvmAfCzIDmKUCkRjpwVVIJ4IMaOiQBUawECn5GD8ADHbn00GRVmjExI');

// Payment Form Component
const PaymentForm = ({ onPaymentSuccess, totalPrice, onCancel }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        if (!stripe || !elements) {
            return;
        }

        try {
            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
            });

            if (stripeError) {
                setError(stripeError.message);
                setProcessing(false);
                return;
            }

            await onPaymentSuccess(paymentMethod.id);
        } catch (err) {
            setError('An unexpected error occurred.');
            setProcessing(false);
        }
    };

    return (
        <div className="payment-container">
            <h3>Payment Details</h3>
            <form onSubmit={handleSubmit} className="payment-form">
                <div className="form-group">
                    <CardElement
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
                {error && <div className="error-message">{error}</div>}
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
                        disabled={!stripe || processing}
                    >
                        {processing ? 'Processing...' : `Pay Rs. ${totalPrice}`}
                    </button>
                </div>
            </form>
        </div>
    );
};

const MenuOrder = () => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentMethodId, setPaymentMethodId] = useState(null);
    const [deliveryDetails, setDeliveryDetails] = useState({
        address: '',
        phone: '',
        notes: ''
    });

    // Add debug logging
    React.useEffect(() => {
        console.log('Payment form visibility:', showPayment);
    }, [showPayment]);

    React.useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/menu');
                setMenuItems(response.data);
            } catch (err) {
                setError('Failed to fetch menu items');
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, []);

    const handleItemSelect = (item) => {
        setSelectedItems(prev => {
            const existingItem = prev.find(i => i._id === item._id);
            if (existingItem) {
                return prev.map(i =>
                    i._id === item._id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const handleQuantityChange = (itemId, change) => {
        setSelectedItems(prev =>
            prev.map(item => {
                if (item._id === itemId) {
                    const newQuantity = item.quantity + change;
                    return newQuantity > 0
                        ? { ...item, quantity: newQuantity }
                        : null;
                }
                return item;
            }).filter(Boolean)
        );
    };

    const calculateTotal = () => {
        return selectedItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    const handleDeliveryDetailsChange = (e) => {
        const { name, value } = e.target;
        setDeliveryDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePaymentSuccess = async (paymentMethodId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to place an order');
                navigate('/login');
                return;
            }

            const orderData = {
                items: selectedItems.map(item => ({
                    menuItemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                payment: 'card',
                totalPrice: calculateTotal(),
                deliveryFee: 50,
                deliveryAddress: deliveryDetails.address,
                deliveryLocation: deliveryDetails.address,
                paymentMethodId: paymentMethodId
            };

            const response = await axios.post('http://localhost:8080/api/orders', orderData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                toast.success('Order placed successfully!');
                navigate('/order-confirmation', { state: { order: response.data.order } });
            }
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error.response?.data?.message || 'Failed to create order');
        }
    };

    // Add debug logging to validateForm
    const validateForm = () => {
        console.log('Validating form...');
        console.log('Selected items:', selectedItems);
        console.log('Delivery details:', deliveryDetails);
        
        if (selectedItems.length === 0) {
            toast.error('Please add items to your cart');
            return false;
        }
        if (!deliveryDetails.address || !deliveryDetails.phone) {
            toast.error('Please fill in all delivery details');
            return false;
        }
        console.log('Form validation passed');
        return true;
    };

    // Modify the proceed to payment button click handler
    const handleProceedToPayment = () => {
        console.log('Proceed to payment clicked');
        if (validateForm()) {
            console.log('Setting showPayment to true');
            setShowPayment(true);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    if (showPayment) {
        return (
            <div className="menu-order-container">
                <Elements stripe={stripePromise}>
                    <PaymentForm 
                        onPaymentSuccess={handlePaymentSuccess}
                        totalPrice={(calculateTotal() + 4.00).toFixed(2)}
                        onCancel={() => setShowPayment(false)}
                    />
                </Elements>
            </div>
        );
    }

    return (
        <div className="menu-order-container">
            <div className="menu-items">
                <h2>Your Cart</h2>
                {selectedItems.length === 0 ? (
                    <p>No items in cart</p>
                ) : (
                    <div className="cart-items">
                        <table className="cart-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedItems.map(item => (
                                    <tr key={item._id}>
                                        <td>{item.name}</td>
                                        <td>Rs. {item.price.toFixed(0)}</td>
                                        <td>
                                            <div className="quantity-controls">
                                                <button onClick={() => handleQuantityChange(item._id, -1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => handleQuantityChange(item._id, 1)}>+</button>
                                            </div>
                                        </td>
                                        <td>Rs. {(item.price * item.quantity).toFixed(0)}</td>
                                        <td>
                                            <button onClick={() => handleQuantityChange(item._id, -item.quantity)}>
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="delivery-details">
                            <h3>Delivery Details</h3>
                            <div className="form-group">
                                <label>Delivery Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={deliveryDetails.address}
                                    onChange={handleDeliveryDetailsChange}
                                    placeholder="Enter your delivery address"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Number *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={deliveryDetails.phone}
                                    onChange={handleDeliveryDetailsChange}
                                    placeholder="Your phone number"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Delivery Notes</label>
                                <textarea
                                    name="notes"
                                    value={deliveryDetails.notes}
                                    onChange={handleDeliveryDetailsChange}
                                    placeholder="Any special instructions"
                                />
                            </div>
                        </div>

                        <div className="order-summary">
                            <div className="summary-item">
                                <span>Subtotal:</span>
                                <span>Rs. {calculateTotal().toFixed(0)}</span>
                            </div>
                            <div className="summary-item">
                                <span>Delivery Fee:</span>
                                <span>Rs. 50</span>
                            </div>
                            <div className="summary-item total">
                                <span>Total Amount:</span>
                                <span>Rs. {(calculateTotal() + 50).toFixed(0)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleProceedToPayment}
                            className="btn btn-primary proceed-payment-btn"
                        >
                            Proceed to Payment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuOrder; 