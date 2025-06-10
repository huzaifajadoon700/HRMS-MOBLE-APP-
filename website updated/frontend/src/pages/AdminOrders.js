import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form } from "react-bootstrap";
import { initializeSocket, disconnectSocket } from "../services/socketService";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    
    // Initialize socket for admin updates
    initializeSocket('admin');
    
    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:8080/api/orders/${orderId}/status`, { status });
      // Update local state immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, deliveryStatus: status }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered':
        return 'status-success';
      case 'pending':
      case 'preparing':
        return 'status-warning';
      case 'out for delivery':
        return 'status-warning';
      default:
        return 'status-error';
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="loading-spinner">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2>Admin Orders</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Food Items</th>
            <th>Total Price</th>
            <th>Delivery Status</th>
            <th>Update Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order.items.map(item => `${item.name} (x${item.quantity})`).join(", ")}</td>
              <td>${order.totalPrice}</td>
              <td>
                <span className={`status-badge ${getStatusClass(order.deliveryStatus)}`}>
                  {order.deliveryStatus}
                </span>
              </td>
              <td>
                <Form.Select
                  value={order.deliveryStatus}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="update-indicator"
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                </Form.Select>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminOrders;
