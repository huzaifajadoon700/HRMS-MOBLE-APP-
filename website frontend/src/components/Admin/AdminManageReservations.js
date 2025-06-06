import React, { useState, useEffect } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AdminManageTables.css";

const AdminManageReservations = () => {
  const [reservations, setReservations] = useState([]);
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
    
    fetchReservations();
  }, [navigate]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/reservations", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Fetched reservations:", response.data);
      setReservations(response.data);
      toast.success("Reservations loaded successfully");
      
    } catch (error) {
      console.error("Error fetching reservations:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      toast.error(error.response?.data?.message || "Failed to fetch reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReservation = async (reservationId) => {
    if (!window.confirm("Are you sure you want to delete this reservation?")) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const deleteToast = toast.loading("Deleting reservation...");
      
      const response = await axios.delete(`http://localhost:8080/api/reservations/${reservationId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.message === "Reservation deleted") {
        setReservations(prevReservations => 
          prevReservations.filter(reservation => reservation._id !== reservationId)
        );
        toast.update(deleteToast, {
          render: "Reservation deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000
        });
      } else {
        throw new Error(response.data.message || "Failed to delete reservation");
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }
      
      toast.error(error.response?.data?.message || "Failed to delete reservation");
      await fetchReservations(); // Refresh the list to ensure UI is in sync
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="admin-manage-tables p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Manage Table Reservations</h2>
        <Button 
          variant="primary" 
          onClick={fetchReservations}
          disabled={loading}
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
              Loading...
            </>
          ) : (
            'Refresh Reservations'
          )}
        </Button>
      </div>

      <Table striped bordered hover responsive className="cosmic-table">
        <thead>
          <tr>
            <th>Reservation ID</th>
            <th>Table Number</th>
            <th>Date</th>
            <th>Guests</th>
            <th>Payment Method</th>
            <th>Total Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="text-center p-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </td>
            </tr>
          ) : reservations.length > 0 ? (
            reservations.map((reservation) => (
              <tr key={reservation._id}>
                <td>{reservation._id}</td>
                <td>{reservation.tableNumber}</td>
                <td>{formatDate(reservation.reservationDate)}</td>
                <td>{reservation.guests}</td>
                <td>{reservation.payment}</td>
                <td>${reservation.totalPrice}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteReservation(reservation._id)}
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No reservations found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminManageReservations; 