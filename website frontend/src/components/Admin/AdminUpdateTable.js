import React, { useState, useEffect } from "react";
import { Card, Form, Button, Spinner, Table } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminManageTables.css";

const AdminUpdateTable = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    tableName: "",
    tableType: "",
    capacity: "",
    status: "Available",
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/tables");
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Failed to fetch tables");
    }
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSelectTable = (table) => {
    setSelectedTable(table);
    setFormData({
      tableName: table.tableName,
      tableType: table.tableType,
      capacity: table.capacity,
      status: table.status,
    });
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    if (!selectedTable) {
      toast.warning("Please select a table to update");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("tableName", formData.tableName);
    data.append("tableType", formData.tableType);
    data.append("capacity", formData.capacity);
    data.append("status", formData.status);
    if (image) {
      data.append("image", image);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8080/api/tables/${selectedTable._id}`,
        data,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          },
        }
      );

      toast.success("Table updated successfully!");
      setSelectedTable(null);
      setFormData({
        tableName: "",
        tableType: "",
        capacity: "",
        status: "Available",
      });
      setImage(null);
      
      // Reset file input
      const fileInput = document.getElementById("table-image");
      if (fileInput) fileInput.value = "";
      
      // Update tables list
      fetchTables();
    } catch (error) {
      console.error("Error updating table:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to update table");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-manage-tables p-4">
      <h2 className="page-title mb-4">Update Table</h2>

      <div className="row">
        <div className="col-md-6 mb-4">
          <Card className="cosmic-card">
            <Card.Header className="cosmic-card-header">
              <h5 className="mb-0">Select Table to Update</h5>
            </Card.Header>
            <Card.Body className="cosmic-card-body">
              <Table striped bordered hover responsive className="cosmic-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map((table) => (
                    <tr key={table._id}>
                      <td>{table.tableName}</td>
                      <td>{table.tableType}</td>
                      <td>{table.capacity}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSelectTable(table)}
                        >
                          Select
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-6">
          <Card className="cosmic-card">
            <Card.Header className="cosmic-card-header">
              <h5 className="mb-0">Update Table Details</h5>
            </Card.Header>
            <Card.Body className="cosmic-card-body">
              <Form onSubmit={handleUpdateTable} encType="multipart/form-data">
                <Form.Group className="mb-3">
                  <Form.Label>Table Name</Form.Label>
                  <Form.Control
                    type="text"
                    className="cosmic-input"
                    value={formData.tableName}
                    onChange={(e) =>
                      setFormData({ ...formData, tableName: e.target.value })
                    }
                    placeholder="Enter table name"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Table Type</Form.Label>
                  <Form.Select
                    className="cosmic-input"
                    value={formData.tableType}
                    onChange={(e) =>
                      setFormData({ ...formData, tableType: e.target.value })
                    }
                    required
                  >
                    <option value="">Choose...</option>
                    <option value="indoor">Indoor</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="private">Private</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Capacity</Form.Label>
                  <Form.Control
                    type="number"
                    className="cosmic-input"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    placeholder="Enter capacity"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    className="cosmic-input"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="Available">Available</option>
                    <option value="Booked">Booked</option>
                    <option value="Reserved">Reserved</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Update Image (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    className="cosmic-input"
                    id="table-image"
                    accept="image/jpeg, image/png"
                    onChange={handleImageChange}
                  />
                </Form.Group>

                <div className="text-center">
                  <Button
                    type="submit"
                    className="cosmic-btn-update"
                    disabled={loading || !selectedTable}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Updating Table...
                      </>
                    ) : (
                      "Update Table"
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminUpdateTable; 