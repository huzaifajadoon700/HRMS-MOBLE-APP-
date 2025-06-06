import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiHome, FiCalendar, FiUsers, FiDollarSign, FiCreditCard, FiEdit2, FiTrash2, FiDownload, FiInfo, FiUser, FiMail, FiPhone, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./MyBookings.css";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const navigate = useNavigate();
  const invoiceRef = useRef(null);

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      // Fetch bookings with additional user details
      const response = await axios.get("http://localhost:8080/api/bookings/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Raw bookings data:", response.data);
      
      // Try to get the current user's information, but don't fail if it's not available
      let userProfileData = {};
      try {
        const userProfile = await axios.get("http://localhost:8080/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        userProfileData = userProfile.data;
        console.log("User profile data:", userProfileData);
      } catch (profileError) {
        console.warn("Could not fetch user profile, using fallback data:", profileError);
        // Continue without profile data
      }
      
      // Enhance bookings with user data if needed
      const enhancedBookings = response.data.map(booking => {
        // If the booking form data is present, use it
        if (booking.fullName && booking.email && booking.phone) {
          return booking;
        }
        
        // Otherwise use profile data or fallbacks
        return {
          ...booking,
          fullName: booking.fullName || userProfileData.name || localStorage.getItem("name") || "",
          email: booking.email || userProfileData.email || localStorage.getItem("email") || "",
          phone: booking.phone || userProfileData.phone || localStorage.getItem("phone") || ""
        };
      });
      
      setBookings(enhancedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      // More descriptive error message based on the issue
      if (error.response && error.response.status === 401) {
        setError("Your session has expired. Please log in again.");
        navigate("/login");
      } else {
        setError("Failed to load bookings. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

  const handleCancelBooking = async (bookingId, checkInDate) => {
    // Check if check-in date is in the past
    const checkInDateObj = new Date(checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    if (checkInDateObj < today) {
      toast.error("Bookings for past dates cannot be canceled");
      return;
    }
    
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        navigate("/login");
        return;
      }
      
      await axios.delete(`http://localhost:8080/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Booking cancelled successfully!");
      // Refresh the bookings list instead of filtering locally
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to cancel booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (booking) => {
    // Navigate to the booking confirmation page with the booking data
    navigate(`/booking-confirmation`, { state: { booking } });
  };

  const handleDownloadInvoice = async (booking) => {
    try {
      setDownloadingInvoice(true);
      
      // Create an invisible container to render the invoice
      const invoiceElement = document.createElement('div');
      invoiceElement.style.position = 'absolute';
      invoiceElement.style.left = '-9999px';
      invoiceElement.style.top = '-9999px';
      
      // Use the booking's customer information directly
      const customerName = booking.fullName || "Guest";
      const customerEmail = booking.email || "N/A";
      const customerPhone = booking.phone || "N/A";
      
      // Calculate the number of nights
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);
      const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

      // Calculate invoice ID using booking ID and random number
      const invoiceId = `INV-${booking._id.substring(0, 8)}-${Math.floor(Math.random() * 1000)}`;
      
      // This style matches the booking confirmation page invoice
      invoiceElement.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; background: white; color: #333; padding: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
            <div>
              <h1 style="font-size: 24px; color: #333; margin-bottom: 5px;">Night Elegance</h1>
              <p style="color: #666; margin: 5px 0;">123 Luxury Avenue</p>
              <p style="color: #666; margin: 5px 0;">City, State 12345</p>
              <p style="color: #666; margin: 5px 0;">Tel: (555) 123-4567</p>
            </div>
            <div style="text-align: right;">
              <h2 style="font-size: 22px; color: #333; margin-bottom: 10px;">INVOICE</h2>
              <p style="margin: 5px 0;"><strong>Invoice No:</strong> ${invoiceId}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${booking._id}</p>
            </div>
          </div>

          <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 8px;">
            <h3 style="font-size: 16px; color: #666; margin-bottom: 10px; text-transform: uppercase;">INVOICE TO:</h3>
            <p style="margin: 5px 0;"><strong>${customerName}</strong></p>
            <p style="margin: 5px 0;">${customerEmail}</p>
            <p style="margin: 5px 0;">${customerPhone}</p>
          </div>

          <div style="margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Details</th>
                  <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px; border: 1px solid #eee; vertical-align: top;">
                    <p style="margin: 5px 0; font-weight: 500;">Room Booking</p>
                    <small style="color: #666;">Check In: ${formatDate(booking.checkInDate)}</small><br />
                    <small style="color: #666;">Check Out: ${formatDate(booking.checkOutDate)}</small>
                  </td>
                  <td style="padding: 10px; border: 1px solid #eee; vertical-align: top;">
                    <p style="margin: 5px 0;">Room: ${booking.roomNumber}</p>
                    <p style="margin: 5px 0;">Type: ${booking.roomType}</p>
                    <p style="margin: 5px 0;">Guests: ${booking.guests}</p>
                    <p style="margin: 5px 0;">Duration: ${nights} night(s)</p>
                  </td>
                  <td style="padding: 10px; border: 1px solid #eee;">$${booking.basePrice || (booking.totalPrice * 0.9).toFixed(2)}</td>
                </tr>
                ${booking.specialRequests ? `
                <tr>
                  <td colspan="3" style="padding: 10px; border: 1px solid #eee;">
                    <strong>Special Requests:</strong>
                    <p style="margin: 5px 0;">${booking.specialRequests}</p>
                  </td>
                </tr>` : ''}
              </tbody>
            </table>
          </div>

          <div style="margin-top: 20px; background-color: #f9f9f9; border-radius: 8px; padding: 15px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Subtotal:</span>
              <span>$${booking.basePrice || (booking.totalPrice * 0.9).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Tax (10%):</span>
              <span>$${booking.taxAmount || (booking.totalPrice * 0.1).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 12px; padding-top: 12px; border-top: 2px solid #eee; font-weight: 700; font-size: 16px;">
              <span>Total:</span>
              <span>$${booking.totalPrice}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; font-style: italic;">
              <span>Payment Method:</span>
              <span>${booking.payment === 'card' ? 'Credit Card' : 'PayPal'}</span>
            </div>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #666;">
            <p style="font-weight: 600; margin-bottom: 5px;">Thank you for choosing Night Elegance</p>
            <small style="font-size: 12px; color: #999;">This is a computer-generated invoice and requires no signature</small>
          </div>
        </div>
      `;
      
      document.body.appendChild(invoiceElement);
      
      // Convert the HTML to a PDF
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`room-booking-invoice-${booking._id}.pdf`);
      
      // Clean up
      document.body.removeChild(invoiceElement);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating invoice:', error);
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

  // Function to check if a date is in the past
  const isDateInPast = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    return date < today;
  };

  if (loading) {
    return (
      <div className="bookings-container">
        <div className="loading-spinner">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // Sort bookings: future first, then past
  const sortedBookings = [...bookings].sort((a, b) => {
    const aInPast = isDateInPast(a.checkInDate);
    const bInPast = isDateInPast(b.checkInDate);
    
    if (aInPast === bInPast) {
      // If both in same category (past or future), sort by date
      return new Date(a.checkInDate) - new Date(b.checkInDate);
    } else {
      // Future dates first
      return aInPast ? 1 : -1;
    }
  });

  return (
    <div className="bookings-container">
      <h2 className="bookings-title">My Room Bookings</h2>
      
      {/* Upcoming Bookings Section */}
      <h3 className="section-title">Upcoming Bookings</h3>
      {!sortedBookings.some(b => !isDateInPast(b.checkInDate)) && (
        <div className="no-bookings">
          <p>No upcoming bookings found.</p>
        </div>
      )}
      
      <div className="bookings-grid">
        {sortedBookings.map((booking) => {
          const isPast = isDateInPast(booking.checkInDate);
          
          if (!isPast) {
            return (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3 className="room-name">{booking.roomType}</h3>
                  <span className="booking-status">Confirmed</span>
                </div>
                
                <div className="booking-details">
                  <div className="detail-item">
                    <FiUser className="detail-icon" />
                    <span>{booking.fullName || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <span>{booking.email || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiPhone className="detail-icon" />
                    <span>{booking.phone || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiHome className="detail-icon" />
                    <span>Room {booking.roomNumber}</span>
                  </div>
                  
                  <div className="detail-item date-item">
                    <FiCalendar className="detail-icon" />
                    <div className="date-range">
                      <div className="date-label">Check-in:</div>
                      <div className="date-value">{formatDate(booking.checkInDate)}</div>
                      <div className="date-label">Check-out:</div>
                      <div className="date-value">{formatDate(booking.checkOutDate)}</div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <FiUsers className="detail-icon" />
                    <span>{booking.guests} Guests</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiDollarSign className="detail-icon" />
                    <span>${booking.totalPrice}</span>
                  </div>

                  <div className="detail-item">
                    <FiCreditCard className="detail-icon" />
                    <span>{booking.payment === 'card' ? 'Credit Card' : 'PayPal'}</span>
                  </div>
                </div>
                
                <div className="booking-footer">
                  <button 
                    className="cancel-button"
                    onClick={() => handleCancelBooking(booking._id, booking.checkInDate)}
                    disabled={loading}
                  >
                    <FiTrash2 className="me-2" /> Cancel
                  </button>
                  <button 
                    className="modify-button"
                    onClick={() => navigate(`/book-room?edit=${booking._id}`)}
                    disabled={loading}
                  >
                    <FiEdit2 className="me-2" /> Modify
                  </button>
                  <button
                    className="invoice-button"
                    onClick={() => handleViewInvoice(booking)}
                  >
                    <FiDownload className="me-1" /> Invoice
                  </button>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
      
      {/* Past Bookings Section */}
      <h3 className="section-title">Past Bookings</h3>
      {!sortedBookings.some(b => isDateInPast(b.checkInDate)) && (
        <div className="no-bookings">
          <p>No past bookings found.</p>
        </div>
      )}
      
      <div className="bookings-grid">
        {sortedBookings.map((booking) => {
          const isPast = isDateInPast(booking.checkInDate);
          
          if (isPast) {
            return (
              <div key={booking._id} className="booking-card past-booking">
                <div className="booking-header">
                  <h3 className="room-name">{booking.roomType}</h3>
                  <span className="booking-status past">Past</span>
                </div>
                
                <div className="booking-details">
                  <div className="detail-item">
                    <FiUser className="detail-icon" />
                    <span>{booking.fullName || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiMail className="detail-icon" />
                    <span>{booking.email || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiPhone className="detail-icon" />
                    <span>{booking.phone || 'Not provided'}</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiHome className="detail-icon" />
                    <span>Room {booking.roomNumber}</span>
                  </div>
                  
                  <div className="detail-item date-item">
                    <FiCalendar className="detail-icon" />
                    <div className="date-range">
                      <div className="date-label">Check-in:</div>
                      <div className="date-value">{formatDate(booking.checkInDate)}</div>
                      <div className="date-label">Check-out:</div>
                      <div className="date-value">{formatDate(booking.checkOutDate)}</div>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <FiUsers className="detail-icon" />
                    <span>{booking.guests} Guests</span>
                  </div>
                  
                  <div className="detail-item">
                    <FiDollarSign className="detail-icon" />
                    <span>${booking.totalPrice}</span>
                  </div>

                  <div className="detail-item">
                    <FiCreditCard className="detail-icon" />
                    <span>{booking.payment === 'card' ? 'Credit Card' : 'PayPal'}</span>
                  </div>
                </div>
                
                <div className="booking-footer">
                  <button 
                    className="view-button"
                    onClick={() => navigate(`/booking-confirmation`, { state: { booking } })}
                  >
                    <FiCheck className="me-2" /> View Details
                  </button>
                  <button
                    className="invoice-button"
                    onClick={() => handleViewInvoice(booking)}
                  >
                    <FiDownload className="me-1" /> Invoice
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

export default MyBookings; 