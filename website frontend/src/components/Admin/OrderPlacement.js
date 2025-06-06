import React, { useState } from "react";
import "./OnlineOrderManagement.css";

const mockOrders = [
  {
    id: 1,
    customerName: "John Doe",
    orderItem: "Pizza",
    orderQuantity: 2,
    deliveryAddress: "123 Main Street",
    deliveryTime: "12:30 PM",
    status: "Pending",
  },
  {
    id: 2,
    customerName: "Jane Smith",
    orderItem: "Burger",
    orderQuantity: 1,
    deliveryAddress: "456 Elm Street",
    deliveryTime: "1:15 PM",
    status: "Preparing",
  },
  {
    id: 3,
    customerName: "Alice Johnson",
    orderItem: "Pasta",
    orderQuantity: 3,
    deliveryAddress: "789 Pine Avenue",
    deliveryTime: "2:45 PM",
    status: "Delivered",
  },
];

const OnlineOrderManagement = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [search, setSearch] = useState("");

  const handleDeleteOrder = (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      setOrders(orders.filter((order) => order.id !== id));
      alert(`Deleted order ID: ${id}`);
    }
  };

  const handleChangeStatus = (id, status) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );
    alert(`Updated status for order ID: ${id} to ${status}`);
  };

  const filteredOrders = orders.filter((order) =>
    order.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="cosmic-container">
      {/* Header */}
      <div className="cosmic-header text-center">
        <h1 className="cosmic-title">Online Ordering</h1>
        <p className="cosmic-subtitle">
          Browse menu, place orders, and track delivery in real-time.
        </p>
      </div>

      {/* Order Management Section */}
      <section className="cosmic-section cosmic-card">
        <div className="cosmic-section-header d-flex justify-content-between align-items-center">
          <h2 className="cosmic-section-title">View & Manage Orders</h2>
          <input
            type="text"
            placeholder="Search by Customer Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control cosmic-input cosmic-search-input"
          />
        </div>
        <div className="table-responsive">
          <table className="table cosmic-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Order Item</th>
                <th>Quantity</th>
                <th>Delivery Address</th>
                <th>Delivery Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.customerName || "N/A"}</td>
                    <td>{order.orderItem || "N/A"}</td>
                    <td>{order.orderQuantity || "N/A"}</td>
                    <td>{order.deliveryAddress || "N/A"}</td>
                    <td>{order.deliveryTime || "N/A"}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleChangeStatus(order.id, e.target.value)
                        }
                        className="form-select cosmic-select cosmic-select-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <button
                        className="btn cosmic-btn-view btn-sm me-2"
                        onClick={() =>
                          alert(`Viewing details for order ID: ${order.id}`)
                        }
                      >
                        View
                      </button>
                      <button
                        className="btn cosmic-btn-danger btn-sm"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default OnlineOrderManagement;
