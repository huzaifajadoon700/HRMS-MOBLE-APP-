import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiUsers, FiDollarSign, FiClock, FiInfo, FiDownload, FiUser, FiMail, FiPhone, FiCreditCard } from "react-icons/fi";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./MyReservations.css";

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  const fetchReservations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8080/api/reservations/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Raw response data:", response.data); // Debug log
      
      // Get user details from localStorage to fill in missing data
      const userFullName = localStorage.getItem("name");
      const userEmail = localStorage.getItem("email");
      const userPhone = localStorage.getItem("phone");
      
      // Enrich reservation data with user details if missing
      const enrichedReservations = response.data.map(reservation => ({
        ...reservation,
        fullName: reservation.fullName || userFullName || "",
        email: reservation.email || userEmail || "",
        phone: reservation.phone || userPhone || ""
      }));
      
      console.log("Enriched reservation data:", enrichedReservations);
      setReservations(enrichedReservations);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setError("Failed to load reservations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Pre-populate user data from localStorage when component mounts
    const userFullName = localStorage.getItem("name");
    const userEmail = localStorage.getItem("email");
    const userPhone = localStorage.getItem("phone");
    
    console.log("User data from localStorage:", {
      name: userFullName,
      email: userEmail,
      phone: userPhone
    });
    
    fetchReservations();
  }, [navigate]);

  const handleCancelReservation = async (reservationId, reservationDate) => {
    // Check if reservation date is in the past
    const reservationDateObj = new Date(reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    if (reservationDateObj < today) {
      toast.error("Reservations for past dates cannot be canceled");
      return;
    }
    
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(`http://localhost:8080/api/reservations/${reservationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Reservation cancelled successfully!");
      // Refresh the reservations list
      fetchReservations();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to cancel reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Generate and download PDF invoice for a reservation
  const handleDownloadInvoice = async (reservation) => {
    if (downloadingInvoice) return;
    try {
      setDownloadingInvoice(true);
      
      // Get user details from localStorage as backup
      const userFullName = localStorage.getItem("name");
      const userEmail = localStorage.getItem("email");
      const userPhone = localStorage.getItem("phone");
      
      // Use reservation data first, then fall back to localStorage
      const customerName = reservation.fullName || userFullName || 'Not provided';
      const customerEmail = reservation.email || userEmail || 'Not provided';
      const customerPhone = reservation.phone || userPhone || 'Not provided';
      
      console.log("Invoice data:", {
        name: customerName,
        email: customerEmail,
        phone: customerPhone
      });
      
      const invoiceElement = document.createElement('div');
      invoiceElement.className = 'invoice-container-pdf';
      invoiceElement.style.backgroundColor = '#fff';
      invoiceElement.style.padding = '20px';
      invoiceElement.style.color = '#000';
      invoiceElement.style.width = '800px';
      invoiceElement.style.fontFamily = 'Arial, sans-serif';
      
      // Create invoice content
      invoiceElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4a4a4a; margin-bottom: 5px;">NIGHT ELEGANCE RESTAURANT</h1>
          <p style="color: #666; font-size: 14px;">123 Luxury Avenue, City, Country</p>
          <p style="color: #666; font-size: 14px;">Tel: (555) 123-4567 | Email: contact@nightelegance.com</p>
          <h2 style="color: #4a4a4a; margin-top: 15px;">TABLE RESERVATION INVOICE</h2>
          <p style="color: #666; font-size: 14px;">Invoice #: INV-${reservation._id.substring(0, 8)}-${Math.floor(Math.random() * 1000)}</p>
          <p style="color: #666; font-size: 14px;">Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <h3 style="color: #4a4a4a; margin-bottom: 10px;">CUSTOMER DETAILS</h3>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>
        </div>

        <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <h3 style="color: #4a4a4a; margin-bottom: 10px;">RESERVATION DETAILS</h3>
          <p><strong>Table Number:</strong> ${reservation.tableNumber}</p>
          <p><strong>Reservation Date:</strong> ${formatDate(reservation.reservationDate)}</p>
          <p><strong>Time:</strong> ${formatTime(reservation.time)} - ${formatTime(reservation.endTime || '')}</p>
          <p><strong>Number of Guests:</strong> ${reservation.guests}</p>
          <p><strong>Special Requests:</strong> ${reservation.specialRequests || 'None'}</p>
        </div>

        <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
          <h3 style="color: #4a4a4a; margin-bottom: 10px;">PAYMENT DETAILS</h3>
          <p><strong>Payment Method:</strong> ${reservation.payment === 'card' ? 'Credit Card' : 'PayPal'}</p>
          <p><strong>Total Amount:</strong> $${reservation.totalPrice.toFixed(2)}</p>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          <p>Thank you for choosing Night Elegance Restaurant!</p>
          <p>We look forward to serving you.</p>
        </div>
      `;
      
      // Add to DOM temporarily
      document.body.appendChild(invoiceElement);
      
      // Generate PDF
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove from DOM
      document.body.removeChild(invoiceElement);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210 - 20; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`night-elegance-reservation-${reservation._id.substring(0, 6)}.pdf`);
      
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate invoice. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    console.log("Received time string:", timeString); // Debug log
    
    if (!timeString) {
      console.log("No time string provided");
      return "Not specified";
    }
    
    try {
      // If time is already in 12-hour format, return it
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
      }
      
      // Handle 24-hour format (HH:MM)
      const [hours, minutes] = timeString.split(':');
      if (!hours || !minutes) {
        console.log("Invalid time format:", timeString);
        return timeString;
      }
      
      // Create a date object with today's date and the specified time
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes));
      
      // Format the time in 12-hour format
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      console.log("Formatted time:", formattedTime); // Debug log
      return formattedTime;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  // Function to check if a date is in the past
  const isDateInPast = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    return date < today;
  };

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      pending: 'warning',
      succeeded: 'success',
      failed: 'danger',
      refunded: 'info'
    };

    return (
      <span className={`badge bg-${statusColors[status] || 'secondary'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="reservations-container">
        <div className="loading-spinner">Loading reservations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reservations-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Sort reservations: future first, then past
  const sortedReservations = [...reservations].sort((a, b) => {
    const aInPast = isDateInPast(a.reservationDate);
    const bInPast = isDateInPast(b.reservationDate);
    
    if (aInPast === bInPast) {
      // If both in same category (past or future), sort by date
      return new Date(a.reservationDate) - new Date(b.reservationDate);
    } else {
      // Future dates first
      return aInPast ? 1 : -1;
    }
  });

  return (
    <div className="reservations-container">
      <h2 className="reservations-title">My Reservations</h2>
      
      {/* Future Reservations Section */}
      <h3 className="section-title">Upcoming Reservations</h3>
      {!sortedReservations.some(r => !isDateInPast(r.reservationDate)) && (
        <div className="no-reservations">
          <p>No upcoming reservations found.</p>
        </div>
      )}
      
        <div className="reservations-grid">
        {sortedReservations.map((reservation) => {
          const isPast = isDateInPast(reservation.reservationDate);
          
          if (!isPast) {
            return (
              <div key={reservation._id} className="reservation-card">
                <div className="reservation-header">
                  <h3 className="table-name">Table {reservation.tableNumber}</h3>
                  <div className="status-badges">
                  <span className="reservation-status">Confirmed</span>
                    {reservation.paymentStatus && getPaymentStatusBadge(reservation.paymentStatus)}
                  </div>
                </div>
                
                <div className="reservation-details">
                  <div className="detail-item">
                    <FiUser className="detail-icon" />
                    <span>{reservation.fullName || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <span>{reservation.email || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiPhone className="detail-icon" />
                    <span>{reservation.phone || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiCalendar className="detail-icon" />
                    <span>{formatDate(reservation.reservationDate)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiClock className="detail-icon" />
                    <span>{formatTime(reservation.time)} - {formatTime(reservation.endTime || "")}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiUsers className="detail-icon" />
                    <span>{reservation.guests} Guests</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiDollarSign className="detail-icon" />
                    <span>${reservation.totalPrice}</span>
                  </div>

                  {reservation.specialRequests && (
                    <div className="detail-item special-requests">
                      <FiInfo className="detail-icon" />
                      <span>{reservation.specialRequests}</span>
                    </div>
                  )}
                </div>
                
                <div className="reservation-footer">
                  <button 
                    className="cancel-button"
                    onClick={() => handleCancelReservation(reservation._id, reservation.reservationDate)}
                  >
                    Cancel Reservation
                  </button>
                  <button 
                    className="modify-button"
                    onClick={() => navigate(`/reserve-table?edit=${reservation._id}`)}
                  >
                    Modify
                  </button>
                  <button
                    className="invoice-button"
                    onClick={() => handleDownloadInvoice(reservation)}
                    disabled={downloadingInvoice}
                  >
                    <FiDownload className="me-1" /> {downloadingInvoice ? 'Generating...' : 'Invoice'}
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
      
      {/* Past Reservations Section */}
      <h3 className="section-title">Past Reservations</h3>
      {!sortedReservations.some(r => isDateInPast(r.reservationDate)) && (
        <div className="no-reservations">
          <p>No past reservations found.</p>
        </div>
      )}
      
      <div className="reservations-grid">
        {sortedReservations.map((reservation) => {
          const isPast = isDateInPast(reservation.reservationDate);
          
          if (isPast) {
            return (
              <div key={reservation._id} className="reservation-card past-reservation">
                <div className="reservation-header">
                  <h3 className="table-name">Table {reservation.tableNumber}</h3>
                  <div className="status-badges">
                  <span className="reservation-status past">Past</span>
                    {reservation.paymentStatus && getPaymentStatusBadge(reservation.paymentStatus)}
                  </div>
                </div>
                
                <div className="reservation-details">
                  <div className="detail-item">
                    <FiUser className="detail-icon" />
                    <span>{reservation.fullName || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <span>{reservation.email || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiPhone className="detail-icon" />
                    <span>{reservation.phone || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiCalendar className="detail-icon" />
                    <span>{formatDate(reservation.reservationDate)}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiClock className="detail-icon" />
                    <span>{formatTime(reservation.time)} - {formatTime(reservation.endTime || "")}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiUsers className="detail-icon" />
                    <span>{reservation.guests} Guests</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiDollarSign className="detail-icon" />
                    <span>${reservation.totalPrice}</span>
                  </div>
                  
                  {reservation.specialRequests && (
                    <div className="detail-item special-requests">
                      <FiInfo className="detail-icon" />
                      <span>{reservation.specialRequests}</span>
                    </div>
                  )}
                </div>
                
                <div className="reservation-footer">
                  <button
                    className="invoice-button full-width"
                    onClick={() => handleDownloadInvoice(reservation)}
                    disabled={downloadingInvoice}
                  >
                    <FiDownload className="me-1" /> {downloadingInvoice ? 'Generating...' : 'Download Invoice'}
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default MyReservations;
