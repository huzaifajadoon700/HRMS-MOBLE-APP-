import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './RoomBooking.css';

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
                        {processing ? 'Processing...' : `Pay $${totalPrice}`}
                    </button>
                </div>
            </form>
        </div>
    );
};

const RoomBooking = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState(null);
    const [bookingDetails, setBookingDetails] = useState({
        checkIn: '',
        checkOut: '',
        guests: 1,
        fullName: '',
        email: '',
        phone: '',
        specialRequests: ''
    });
    const [showPayment, setShowPayment] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add debug logging
    React.useEffect(() => {
        console.log('Payment form visibility:', showPayment);
    }, [showPayment]);

    React.useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/rooms/${roomId}`);
                setRoom(response.data);
            } catch (err) {
                setError('Failed to fetch room details');
            } finally {
                setLoading(false);
            }
        };

        fetchRoomDetails();
    }, [roomId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setBookingDetails(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateTotalNights = () => {
        if (!bookingDetails.checkIn || !bookingDetails.checkOut) return 0;
        const checkIn = new Date(bookingDetails.checkIn);
        const checkOut = new Date(bookingDetails.checkOut);
        const diffTime = Math.abs(checkOut - checkIn);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const calculateBasePrice = () => {
        if (!room) return 0;
        return room.price * calculateTotalNights();
    };

    const calculateTax = () => {
        return calculateBasePrice() * 0.1; // 10% tax
    };

    const calculateTotalAmount = () => {
        return calculateBasePrice() + calculateTax();
    };

    const handlePaymentSuccess = async (paymentMethodId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to book a room');
                navigate('/login');
                return;
            }

            const bookingData = {
                roomId,
                roomType: room.type,
                roomNumber: room.roomNumber,
                checkInDate: bookingDetails.checkIn,
                checkOutDate: bookingDetails.checkOut,
                guests: bookingDetails.guests,
                payment: 'card',
                totalPrice: calculateTotalAmount(),
                fullName: bookingDetails.fullName,
                email: bookingDetails.email,
                phone: bookingDetails.phone,
                specialRequests: bookingDetails.specialRequests,
                paymentMethodId: paymentMethodId
            };

            const response = await axios.post('http://localhost:8080/api/bookings', bookingData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                toast.success('Room booked successfully!');
                navigate('/booking-confirmation', { state: { booking: response.data.booking } });
            }
        } catch (error) {
            console.error('Error creating booking:', error);
            toast.error(error.response?.data?.message || 'Failed to create booking');
        }
    };

    // Add debug logging to validateForm
    const validateForm = () => {
        console.log('Validating form...');
        console.log('Booking details:', bookingDetails);
        
        if (!bookingDetails.checkIn || !bookingDetails.checkOut) {
            toast.error('Please select check-in and check-out dates');
            return false;
        }
        if (!bookingDetails.fullName || !bookingDetails.email || !bookingDetails.phone) {
            toast.error('Please fill in all required fields');
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
    if (!room) return <div>Room not found</div>;

    if (showPayment) {
        return (
            <div className="room-booking-container">
                <Elements stripe={stripePromise}>
                    <PaymentForm 
                        onPaymentSuccess={handlePaymentSuccess}
                        totalPrice={calculateTotalAmount().toFixed(2)}
                        onCancel={() => setShowPayment(false)}
                    />
                </Elements>
            </div>
        );
    }

    return (
        <div className="room-booking-container">
            <h2>Book Your Stay</h2>
            <div className="booking-form">
                <div className="form-group">
                    <label>Check-in Date *</label>
                    <input
                        type="date"
                        name="checkIn"
                        value={bookingDetails.checkIn}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Check-out Date *</label>
                    <input
                        type="date"
                        name="checkOut"
                        value={bookingDetails.checkOut}
                        onChange={handleInputChange}
                        min={bookingDetails.checkIn || new Date().toISOString().split('T')[0]}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Number of Guests *</label>
                    <input
                        type="number"
                        name="guests"
                        value={bookingDetails.guests}
                        onChange={handleInputChange}
                        min="1"
                        max={room.capacity}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Full Name *</label>
                    <input
                        type="text"
                        name="fullName"
                        value={bookingDetails.fullName}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={bookingDetails.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                        type="tel"
                        name="phone"
                        value={bookingDetails.phone}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Special Requests</label>
                    <textarea
                        name="specialRequests"
                        value={bookingDetails.specialRequests}
                        onChange={handleInputChange}
                        placeholder="Any special requests or requirements?"
                    />
                </div>

                <div className="booking-summary">
                    <h3>Booking Summary</h3>
                    <div className="summary-item">
                        <span>Room Type:</span>
                        <span>{room.type}</span>
                    </div>
                    <div className="summary-item">
                        <span>Price per Night:</span>
                        <span>${room.price}</span>
                    </div>
                    <div className="summary-item">
                        <span>Number of Nights:</span>
                        <span>{calculateTotalNights()}</span>
                    </div>
                    <div className="summary-item">
                        <span>Base Price:</span>
                        <span>${calculateBasePrice().toFixed(2)}</span>
                    </div>
                    <div className="summary-item">
                        <span>Tax (10%):</span>
                        <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="summary-item total">
                        <span>Total Price:</span>
                        <span>${calculateTotalAmount().toFixed(2)}</span>
                    </div>
                </div>

                <button
                    onClick={handleProceedToPayment}
                    className="btn btn-primary proceed-payment-btn"
                >
                    Proceed to Payment
                </button>
            </div>
        </div>
    );
};

export default RoomBooking; 