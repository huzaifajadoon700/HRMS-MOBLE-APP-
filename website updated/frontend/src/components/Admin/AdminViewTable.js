import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AdminViewTable.css';

const AdminViewTable = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchTables();
  }, [navigate]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/tables', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setTables(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        toast.error('Failed to load tables');
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast.error(error.response?.data?.message || 'Error fetching tables');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'status-available';
      case 'occupied':
        return 'status-occupied';
      case 'reserved':
        return 'status-reserved';
      case 'maintenance':
        return 'status-maintenance';
      default:
        return 'status-unknown';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="view-table-container">
      <div className="view-table-header">
        <h2>View Tables</h2>
      </div>

      {tables.length === 0 ? (
        <div className="no-tables-message">
          <h4>No tables found</h4>
          <p>There are no tables available in the system.</p>
        </div>
      ) : (
        <div className="tables-grid">
          {tables.map((table) => (
            <Card key={table._id} className="table-card">
              <Card.Body>
                <div className="table-header">
                  <h3>Table {table.tableNumber}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(table.status)}`}>
                    {table.status}
                  </span>
                </div>
                
                <div className="table-details">
                  <div className="detail-item">
                    <span className="detail-label">Capacity:</span>
                    <span className="detail-value">{table.capacity} persons</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{table.location}</span>
                  </div>
                  
                  {table.description && (
                    <div className="detail-item">
                      <span className="detail-label">Description:</span>
                      <span className="detail-value">{table.description}</span>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default AdminViewTable; 