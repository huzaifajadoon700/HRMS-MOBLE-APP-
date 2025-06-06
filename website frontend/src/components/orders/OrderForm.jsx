import React, { useState } from "react";
import { placeOrder } from "../../api/orders";
import { FiCheckCircle } from "react-icons/fi";
import "./OrderForm.css"; // Create this CSS file

const OrderForm = ({ cart, userId, clearCart, onOrderPlaced }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOrder = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty!");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const orderData = {
        userId,
        items: cart.map((item) => ({
          menuId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      const response = await placeOrder(orderData);
      
      if (response) {
        clearCart();
        onOrderPlaced();
        // Success state handled in UI
      } else {
        throw new Error("Order placement failed");
      }
    } catch (error) {
      setError(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="order-form-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button 
        className="order-button"
        onClick={handleOrder}
        disabled={isLoading || cart.length === 0}
      >
        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            <FiCheckCircle className="button-icon" />
            Place Order
          </>
        )}
      </button>

      {cart.length > 0 && (
        <div className="order-summary">
          <h4>Order Summary</h4>
          <ul>
            {cart.map((item) => (
              <li key={item._id}>
                {item.name} - {item.quantity} x ${item.price.toFixed(2)}
              </li>
            ))}
          </ul>
          <div className="total-amount">
            Total: $
            {cart
              .reduce((total, item) => total + item.price * item.quantity, 0)
              .toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderForm;