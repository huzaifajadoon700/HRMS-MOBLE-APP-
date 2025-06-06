import React, { useState, useEffect } from "react";
import { Table, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminManageTables.css";

const AdminViewTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "admin") {
      toast.error("Please login as admin to access this page");
      navigate("/login");
      return;
    }
    
    fetchTables();
  }, [navigate]);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8080/api/tables");
      console.log("Fetched tables:", response.data);
      setTables(response.data);
      toast.success("Tables loaded successfully");
    } catch (error) {
      console.error("Error fetching tables:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-manage-tables p-4">
      <h2 className="page-title mb-4">View Tables</h2>

      <div className="table-responsive cosmic-table-container">
        <Table striped bordered hover className="cosmic-table">
          <thead>
            <tr>
              <th>Table ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </td>
              </tr>
            ) : tables.length > 0 ? (
              tables.map((table) => (
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  No tables found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default AdminViewTables; 