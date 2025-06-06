import axios from "axios";

const API_URL = "http://localhost:8080/api/orders"; // Backend URL

// ✅ Fetch menu items (from admin-side menus)
export const fetchMenuItems = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/menus");
    return response.data;
  } catch (error) {
    console.error("Error fetching menu:", error);
    return [];
  }
};

// ✅ Fetch user orders
export const fetchUserOrders = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};

// ✅ Place new order


export const placeOrder = async (orderData) => {
    try {
        const response = await axios.post(API_URL, orderData);
        return response.data;
    } catch (error) {
        console.error("Error placing order:", error.response ? error.response.data : error.message);
        throw error;
    }
};


// ✅ Update order before confirming
export const updateOrder = async (orderId, updatedItems) => {
  try {
    const response = await axios.put(`${API_URL}/${orderId}`, { items: updatedItems });
    return response.data;
  } catch (error) {
    console.error("Error updating order:", error);
    return null;
  }
};

// ✅ Cancel an order
export const cancelOrder = async (orderId) => {
  try {
    await axios.delete(`${API_URL}/${orderId}`);
    return { message: "Order cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return null;
  }
};
