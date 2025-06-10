import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import { FaTrash, FaEdit, FaEye } from "react-icons/fa";
import "./AdminManageTables.css";

const AdminManageTables = () => {
  const [showAddTable, setShowAddTable] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    tableName: "",
    tableType: "",
    capacity: "",
    status: "Available",
    description: "",
  });

  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/tables");
      setTables(response.data);
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  };

  const handleShowAddTable = () => {
    setShowAddTable(!showAddTable);
    setImage(null);
    setFormData({
      tableName: "",
      tableType: "",
      capacity: "",
      status: "Available",
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("tableName", formData.tableName);
    data.append("tableType", formData.tableType);
    data.append("capacity", formData.capacity);
    data.append("status", formData.status);
    data.append("description", formData.description);
    if (image) {
      data.append("image", image);
    }
    try {
      await axios.post("http://localhost:8080/api/tables/add", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Table added successfully!");
      fetchTables();
      setShowAddTable(false);
    } catch (error) {
      console.error("Error adding table:", error);
      alert("Failed to add table. Please try again.");
    }
  };

  const handleShowDetails = (table) => {
    setSelectedTable(table);
    setShowDetailsModal(true);
  };

  const handleShowUpdateModal = (table) => {
    setSelectedTable(table);
    setFormData({
      tableName: table.tableName,
      tableType: table.tableType,
      capacity: table.capacity,
      status: table.status,
    });
    setShowUpdateModal(true);
  };

  const handleUpdateTable = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("tableName", formData.tableName);
    data.append("tableType", formData.tableType);
    data.append("capacity", formData.capacity);
    data.append("status", formData.status);
    if (image) {
      data.append("image", image);
    }
    try {
      await axios.put(
        `http://localhost:8080/api/tables/${selectedTable._id}`,
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert("Table updated successfully!");
      fetchTables();
      setShowUpdateModal(false);
    } catch (error) {
      console.error("Error updating table:", error);
      alert("Failed to update table. Please try again.");
    }
  };

  const handleDeleteTable = async (id) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      try {
        await axios.delete(`http://localhost:8080/api/tables/${id}`);
        fetchTables();
      } catch (error) {
        console.error("Error deleting table:", error);
        alert("Failed to delete table.");
      }
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  return (
    <div className="admin-manage-tables">
      <div className="header">
        <h2 className="cosmic-title">Manage Tables</h2>
        <Button variant="cosmic" onClick={handleShowAddTable} className="cosmic-button">
          <i className="bi bi-plus-circle"></i> Add Table
        </Button>
      </div>

      {showAddTable && (
        <div className="card cosmic-card">
          <div className="card-header cosmic-card-header">
            <h4>Add a New Table</h4>
          </div>
          <div className="card-body cosmic-card-body">
            <form onSubmit={handleAddTable} encType="multipart/form-data">
              <div className="form-group">
                <label htmlFor="table-name">Table Name</label>
                <input
                  type="text"
                  className="form-control cosmic-input"
                  id="table-name"
                  value={formData.tableName}
                  onChange={(e) =>
                    setFormData({ ...formData, tableName: e.target.value })
                  }
                  placeholder="Enter table name (e.g., Family Table)"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="table-type">Table Type</label>
                <select
                  className="form-select cosmic-input"
                  id="table-type"
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
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="table-capacity">Capacity (Number of Guests)</label>
                <input
                  type="number"
                  className="form-control cosmic-input"
                  id="table-capacity"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  placeholder="Enter maximum number of guests"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="table-status">Status</label>
                <select
                  className="form-select cosmic-input"
                  id="table-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="table-description">Description</label>
                <textarea
                  className="form-control cosmic-input"
                  id="table-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter table description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="table-image">Upload Table Image</label>
                <input
                  type="file"
                  className="form-control cosmic-input"
                  id="table-image"
                  accept="image/jpeg, image/png"
                  onChange={handleImageChange}
                />
              </div>
              <div className="text-center mt-3">
                <button type="submit" className="btn cosmic-btn-add">
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-responsive cosmic-table-container">
        <table className="table cosmic-table">
          <thead>
            <tr>
              <th>Table ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table._id}>
                <td>{table._id}</td>
                <td>{table.tableName}</td>
                <td>{table.tableType}</td>
                <td>{table.capacity}</td>
                <td>
                  <span
                    className={`badge cosmic-badge ${
                      table.status === "Available" ? "available" : "unavailable"
                    }`}
                  >
                    {table.status}
                  </span>
                </td>
                <td>
                  {table.image && (
                    <img
                      src={`http://localhost:8080${table.image}`}
                      alt={table.tableName}
                      className="cosmic-table-image"
                    />
                  )}
                </td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowDetails(table)}
                    className="cosmic-action-btn"
                  >
                    <FaEye />
                  </Button>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleShowUpdateModal(table)}
                    className="ms-2 cosmic-action-btn"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteTable(table._id)}
                    className="ms-2 cosmic-action-btn"
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered className="cosmic-modal">
        <Modal.Header closeButton className="cosmic-modal-header">
          <Modal.Title>Table Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="cosmic-modal-body">
          {selectedTable && (
            <div>
              <p><strong>Table ID:</strong> {selectedTable._id}</p>
              <p><strong>Name:</strong> {selectedTable.tableName}</p>
              <p><strong>Type:</strong> {selectedTable.tableType}</p>
              <p><strong>Capacity:</strong> {selectedTable.capacity}</p>
              <p><strong>Status:</strong> {selectedTable.status}</p>
              <p>
                <strong>Image:</strong>
                {selectedTable.image && (
                  <img
                    src={`http://localhost:8080${selectedTable.image}`}
                    alt="Table"
                    className="img-fluid cosmic-modal-img mt-2 rounded"
                  />
                )}
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

      {/* Update Table Modal */}
      <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered className="cosmic-modal">
        <Modal.Header closeButton className="cosmic-modal-header">
          <Modal.Title>Update Table</Modal.Title>
        </Modal.Header>
        <Modal.Body className="cosmic-modal-body">
          {selectedTable && (
            <form onSubmit={handleUpdateTable} encType="multipart/form-data">
              <div className="form-group">
                <label htmlFor="update-table-name">Table Name</label>
                <input
                  type="text"
                  className="form-control cosmic-input"
                  id="update-table-name"
                  value={formData.tableName}
                  onChange={(e) =>
                    setFormData({ ...formData, tableName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="update-table-type">Table Type</label>
                <select
                  className="form-select cosmic-input"
                  id="update-table-type"
                  value={formData.tableType}
                  onChange={(e) =>
                    setFormData({ ...formData, tableType: e.target.value })
                  }
                  required
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="update-table-capacity">Capacity (Number of Guests)</label>
                <input
                  type="number"
                  className="form-control cosmic-input"
                  id="update-table-capacity"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="update-table-status">Status</label>
                <select
                  className="form-select cosmic-input"
                  id="update-table-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Available">Available</option>
                  <option value="Booked">Booked</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="update-table-image">Upload New Image (optional)</label>
                <input
                  type="file"
                  className="form-control cosmic-input"
                  id="update-table-image"
                  accept="image/jpeg, image/png"
                  onChange={handleImageChange}
                />
              </div>
              <div className="text-center mt-3">
                <button type="submit" className="btn cosmic-btn-update">
                  Update Table
                </button>
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer className="cosmic-modal-footer">
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminManageTables;
