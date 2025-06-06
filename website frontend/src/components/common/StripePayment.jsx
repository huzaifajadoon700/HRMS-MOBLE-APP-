import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import './StripePayment.css';

const StripePayment = ({ amount, type, metadata, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);

        if (!stripe || !elements) {
            return;
        }

        try {
            // Create payment intent
            const response = await axios.post(`/api/payment/${type}-payment`, {
                amount,
                ...metadata
            });

            const { clientSecret } = response.data;

            // Confirm payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                }
            });

            if (result.error) {
                setError(result.error.message);
                onError?.(result.error);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    onSuccess?.(result.paymentIntent);
                }
            }
        } catch (err) {
            setError(err.message);
            onError?.(err);
        }

        setProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="stripe-payment-form">
            <div className="card-element-container">
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
                    }}
                />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button
                type="submit"
                disabled={!stripe || processing}
                className="payment-button"
            >
                {processing ? 'Processing...' : `Pay $${amount}`}
            </button>
        </form>
    );
};

export default StripePayment; 