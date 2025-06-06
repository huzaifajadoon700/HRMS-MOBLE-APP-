import React, { useState } from "react";
import { Modal, Button, Form, InputGroup, FormControl } from "react-bootstrap";
import "./AdminManageCustomers.css";

const AdminManageCustomers = () => {
  const [customers, setCustomers] = useState([
    {
      id: "CUST001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      address: "123 Main St, City, Country",
      preferences: "Vegetarian",
      feedback: "Great service!",
    },
    {
      id: "CUST002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+0987654321",
      address: "456 Elm St, City, Country",
      preferences: "Window seating",
      feedback: "Loved the ambiance!",
    },
  ]);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleShowDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleDelete = (customerId) => {
    setShowDeleteModal(true);
    setSelectedCustomer(customers.find((customer) => customer.id === customerId));
  };

  const confirmDelete = () => {
    const updatedCustomers = customers.filter(
      (customer) => customer.id !== selectedCustomer.id
    );
    setCustomers(updatedCustomers);
    setShowDeleteModal(false);
    alert("Customer deleted successfully!");
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const form = e.target;
    const newCustomer = {
      id: `CUST${customers.length + 1}`,
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      address: form.address.value,
      preferences: form.preferences.value,
      feedback: form.feedback.value,
    };
    setCustomers([...customers, newCustomer]);
    setShowAddCustomerModal(false);
    alert("Customer added successfully!");
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-manage-customers">
      <div className="header">
        <h2 className="cosmic-title">Manage Customers</h2>
        <InputGroup className="cosmic-input-group">
          <FormControl
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="cosmic-input"
          />
        </InputGroup>
        <Button
          variant="cosmic"
          onClick={() => setShowAddCustomerModal(true)}
          className="cosmic-button"
        >
          Add Customer
        </Button>
      </div>

      <table className="table cosmic-table">
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleShowDetails(customer)}
                  className="me-2 cosmic-action-btn"
                >
                  Details
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(customer.id)}
                  className="cosmic-action-btn"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Customer Details */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        centered
        className="cosmic-modal"
      >
        <Modal.Header closeButton className="cosmic-modal-header">
          <Modal.Title>Customer Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="cosmic-modal-body">
          {selectedCustomer && (
            <div>
              <p>
                <strong>Customer ID:</strong> {selectedCustomer.id}
              </p>
              <p>
                <strong>Name:</strong> {selectedCustomer.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedCustomer.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedCustomer.phone}
              </p>
              <p>
                <strong>Address:</strong> {selectedCustomer.address}
              </p>
              <p>
                <strong>Preferences:</strong> {selectedCustomer.preferences}
              </p>
              <p>
                <strong>Feedback:</strong> {selectedCustomer.feedback}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="cosmic-modal-footer">
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Deletion Confirmation */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        className="cosmic-modal"
      >
        <Modal.Header closeButton className="cosmic-modal-header">
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="cosmic-modal-body">
          Are you sure you want to delete customer{" "}
          {selectedCustomer?.name}?
        </Modal.Body>
        <Modal.Footer className="cosmic-modal-footer">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Confirm Deletion
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Adding Customer */}
      <Modal
        show={showAddCustomerModal}
        onHide={() => setShowAddCustomerModal(false)}
        centered
        className="cosmic-modal"
      >
        <Modal.Header closeButton className="cosmic-modal-header">
          <Modal.Title>Add New Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body className="cosmic-modal-body">
          <Form onSubmit={handleAddCustomer}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" name="name" className="cosmic-input" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" className="cosmic-input" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="text" name="phone" className="cosmic-input" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control type="text" name="address" className="cosmic-input" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Preferences</Form.Label>
              <Form.Control type="text" name="preferences" className="cosmic-input" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Feedback</Form.Label>
              <Form.Control type="text" name="feedback" className="cosmic-input" />
            </Form.Group>
            <Button variant="cosmic" type="submit" className="cosmic-button">
              Add Customer
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminManageCustomers;
