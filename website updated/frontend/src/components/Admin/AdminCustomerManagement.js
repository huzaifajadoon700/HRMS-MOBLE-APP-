import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Container, Row, Col, Card, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FiUsers, FiPlus, FiSearch, FiEye, FiTrash2, FiMail, FiPhone,
  FiMapPin, FiUser, FiRefreshCw, FiX, FiSave, FiEdit, FiHeart,
  FiStar, FiMessageCircle, FiGrid, FiList
} from "react-icons/fi";
import "./AdminManageRooms.css";

const AdminCustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([
    {
      id: "CUST001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+92-300-1234567",
      address: "123 Main St, Lahore, Pakistan",
      preferences: "Vegetarian, Non-smoking",
      feedback: "Great service! Loved the food quality.",
      joinDate: "2024-01-15",
      totalOrders: 12,
      totalSpent: 45000,
      status: "active"
    },
    {
      id: "CUST002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+92-321-9876543",
      address: "456 Elm St, Karachi, Pakistan",
      preferences: "Window seating, Quiet area",
      feedback: "Loved the ambiance! Will definitely come back.",
      joinDate: "2024-02-20",
      totalOrders: 8,
      totalSpent: 32000,
      status: "active"
    },
    {
      id: "CUST003",
      name: "Ahmed Ali",
      email: "ahmed.ali@example.com",
      phone: "+92-333-5555555",
      address: "789 Oak St, Islamabad, Pakistan",
      preferences: "Halal food only",
      feedback: "Excellent service and authentic taste.",
      joinDate: "2024-03-10",
      totalOrders: 15,
      totalSpent: 67500,
      status: "vip"
    }
  ]);

  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Filter customers based on search and status
  useEffect(() => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter]);

  const handleShowDetails = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleDelete = (id) => {
    const customer = customers.find(c => c.id === id);
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setCustomers(customers.filter(customer => customer.id !== selectedCustomer.id));
    setShowDeleteModal(false);
    setSelectedCustomer(null);
    toast.success("Customer deleted successfully!");
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newCustomer = {
      id: `CUST${String(customers.length + 1).padStart(3, '0')}`,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      preferences: formData.get('preferences') || '',
      feedback: formData.get('feedback') || '',
      joinDate: new Date().toISOString().split('T')[0],
      totalOrders: 0,
      totalSpent: 0,
      status: 'active'
    };

    setCustomers([...customers, newCustomer]);
    setShowAddCustomerModal(false);
    toast.success("Customer added successfully!");
    e.target.reset();
  };

  return (
    <Container fluid className="admin-manage-customers p-4">
      {/* Enhanced Header */}
      <div className="admin-header mb-4">
        <Row className="align-items-center">
          <Col>
            <h1 className="admin-title">
              <FiUsers className="me-2" />
              Customer Management
            </h1>
            <p className="admin-subtitle">Manage customer relationships and preferences</p>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => setFilteredCustomers([...customers])}
              >
                <FiRefreshCw className="me-1" />
                Refresh
              </Button>
              <Button 
                variant="primary"
                onClick={() => setShowAddCustomerModal(true)}
              >
                <FiPlus className="me-1" />
                Add Customer
              </Button>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <FiUsers size={32} className="text-primary mb-2" />
                <h4 className="mb-1">{customers.length}</h4>
                <small className="text-muted">Total Customers</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <FiStar size={32} className="text-warning mb-2" />
                <h4 className="mb-1">{customers.filter(c => c.status === 'vip').length}</h4>
                <small className="text-muted">VIP Customers</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <FiHeart size={32} className="text-success mb-2" />
                <h4 className="mb-1">
                  Rs. {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
                </h4>
                <small className="text-muted">Total Revenue</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <FiMessageCircle size={32} className="text-info mb-2" />
                <h4 className="mb-1">{customers.reduce((sum, c) => sum + c.totalOrders, 0)}</h4>
                <small className="text-muted">Total Orders</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Enhanced Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="search-box">
                <FiSearch className="search-icon" />
                <Form.Control
                  type="text"
                  placeholder="Search customers by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </Col>
            <Col md={3}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <div className="view-toggle d-flex">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('grid')}
                  className="me-1"
                >
                  <FiGrid />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline-primary'}
                  onClick={() => setViewMode('list')}
                >
                  <FiList />
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Customer Display */}
      {viewMode === 'grid' ? (
        <Row>
          {filteredCustomers.map((customer) => (
            <Col key={customer.id} lg={4} md={6} className="mb-4">
              <Card className="customer-card h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="customer-avatar">
                      <FiUser size={32} />
                    </div>
                    <span className={`badge bg-${customer.status === 'vip' ? 'warning' : customer.status === 'active' ? 'success' : 'secondary'}`}>
                      {customer.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <h5 className="customer-name">{customer.name}</h5>
                  <p className="customer-id text-muted small">ID: {customer.id}</p>
                  
                  <div className="customer-details">
                    <div className="detail-item">
                      <FiMail className="me-2" />
                      <small>{customer.email}</small>
                    </div>
                    <div className="detail-item">
                      <FiPhone className="me-2" />
                      <small>{customer.phone}</small>
                    </div>
                    <div className="detail-item">
                      <FiMapPin className="me-2" />
                      <small>{customer.address}</small>
                    </div>
                  </div>
                  
                  <div className="customer-stats mt-3">
                    <Row className="text-center">
                      <Col>
                        <strong>{customer.totalOrders}</strong>
                        <br />
                        <small className="text-muted">Orders</small>
                      </Col>
                      <Col>
                        <strong>Rs. {customer.totalSpent.toLocaleString()}</strong>
                        <br />
                        <small className="text-muted">Spent</small>
                      </Col>
                    </Row>
                  </div>
                </Card.Body>
                
                <Card.Footer className="bg-transparent">
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleShowDetails(customer)}
                      className="flex-fill"
                    >
                      <FiEye className="me-1" />
                      Details
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(customer.id)}
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Card>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <FiUser className="me-2" />
                      {customer.name}
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <span className={`badge bg-${customer.status === 'vip' ? 'warning' : customer.status === 'active' ? 'success' : 'secondary'}`}>
                      {customer.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{customer.totalOrders}</td>
                  <td>Rs. {customer.totalSpent.toLocaleString()}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleShowDetails(customer)}
                      >
                        <FiEye />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(customer.id)}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* Customer Details Modal */}
      <Modal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FiUser className="me-2" />
            Customer Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCustomer && (
            <Row>
              <Col md={6}>
                <h6>Personal Information</h6>
                <p><strong>ID:</strong> {selectedCustomer.id}</p>
                <p><strong>Name:</strong> {selectedCustomer.name}</p>
                <p><strong>Email:</strong> {selectedCustomer.email}</p>
                <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
                <p><strong>Address:</strong> {selectedCustomer.address}</p>
                <p><strong>Join Date:</strong> {selectedCustomer.joinDate}</p>
              </Col>
              <Col md={6}>
                <h6>Preferences & Activity</h6>
                <p><strong>Status:</strong> 
                  <span className={`badge bg-${selectedCustomer.status === 'vip' ? 'warning' : selectedCustomer.status === 'active' ? 'success' : 'secondary'} ms-2`}>
                    {selectedCustomer.status.toUpperCase()}
                  </span>
                </p>
                <p><strong>Total Orders:</strong> {selectedCustomer.totalOrders}</p>
                <p><strong>Total Spent:</strong> Rs. {selectedCustomer.totalSpent.toLocaleString()}</p>
                <p><strong>Preferences:</strong> {selectedCustomer.preferences}</p>
                <p><strong>Feedback:</strong> {selectedCustomer.feedback}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete customer <strong>{selectedCustomer?.name}</strong>?
          <br />
          <small className="text-muted">This action cannot be undone.</small>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <FiTrash2 className="me-1" />
            Delete Customer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Customer Modal */}
      <Modal
        show={showAddCustomerModal}
        onHide={() => setShowAddCustomerModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FiPlus className="me-2" />
            Add New Customer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddCustomer}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control type="text" name="name" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address *</Form.Label>
                  <Form.Control type="email" name="email" required />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number *</Form.Label>
                  <Form.Control type="text" name="phone" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <Form.Control type="text" name="address" required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Preferences</Form.Label>
              <Form.Control type="text" name="preferences" placeholder="e.g., Vegetarian, Window seating" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Initial Feedback</Form.Label>
              <Form.Control as="textarea" name="feedback" rows={2} placeholder="Any initial comments..." />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit">
                <FiSave className="me-1" />
                Add Customer
              </Button>
              <Button variant="secondary" onClick={() => setShowAddCustomerModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminCustomerManagement;
