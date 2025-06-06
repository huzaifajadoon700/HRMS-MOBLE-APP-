import React, { useState } from "react";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import "./AdminUserManagement.css";

const initialUsers = [
  { id: 1, name: "John Doe", email: "johndoe@example.com", phone: "+1234567890", address: "123 Main St, Springfield" },
  { id: 2, name: "Jane Smith", email: "janesmith@example.com", phone: "+9876543210", address: "456 Elm Street, Shelbyville" },
  { id: 3, name: "Alice Johnson", email: "alicejohnson@example.com", phone: "+1029384756", address: "789 Pine Ave, Capital City" },
];

const AdminUserManagement = () => {
  const [users, setUsers] = useState(initialUsers);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Open the Edit modal and set the current user
  const handleEditClick = (user) => {
    setCurrentUser(user);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setCurrentUser(null);
  };

  // Update user information
  const handleUserSave = () => {
    setUsers(
      users.map((user) =>
        user.id === currentUser.id
          ? { ...user, name: currentUser.name, email: currentUser.email, phone: currentUser.phone, address: currentUser.address }
          : user
      )
    );
    handleCloseModal();
  };

  // Delete a user after confirmation
  const handleDeleteUser = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      setUsers(users.filter((user) => user.id !== id));
    }
  };

  return (
    <Container className="cosmic-container">
      <h2 className="cosmic-title text-center mb-4">Admin - User Management</h2>

      {/* Users Table */}
      <Table striped bordered hover responsive className="cosmic-table">
        <thead>
          <tr>
            <th className="cosmic-th">Name</th>
            <th className="cosmic-th">Email</th>
            <th className="cosmic-th">Phone Number</th>
            <th className="cosmic-th">Address</th>
            <th className="cosmic-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="cosmic-td">{user.name}</td>
              <td className="cosmic-td">{user.email}</td>
              <td className="cosmic-td">{user.phone}</td>
              <td className="cosmic-td">{user.address}</td>
              <td className="cosmic-td">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleEditClick(user)}
                  className="cosmic-button me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteUser(user.id)}
                  className="cosmic-button"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Modal */}
      {currentUser && (
        <Modal show={showEditModal} onHide={handleCloseModal} className="cosmic-modal">
          <Modal.Header closeButton className="cosmic-modal-header">
            <Modal.Title>Edit User Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="cosmic-modal-body">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="cosmic-label">Name</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.name}
                  onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                  className="cosmic-input"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="cosmic-label">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={currentUser.email}
                  onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                  className="cosmic-input"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="cosmic-label">Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  value={currentUser.phone}
                  onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                  className="cosmic-input"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="cosmic-label">Address</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={currentUser.address}
                  onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })}
                  className="cosmic-input"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="cosmic-modal-footer">
            <Button variant="secondary" onClick={handleCloseModal} className="cosmic-button-secondary">
              Close
            </Button>
            <Button variant="success" onClick={handleUserSave} className="cosmic-button">
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default AdminUserManagement;
