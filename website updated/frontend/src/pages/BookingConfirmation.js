import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCalendar, FiUsers, FiCreditCard, FiArrowLeft, FiDownload, FiCheck, FiHome, FiDollarSign, FiPrinter, FiHash } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './BookingConfirmation.css';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const bookingData = location.state?.booking;
    if (bookingData) {
      setBooking(bookingData);
      localStorage.setItem('lastBooking', JSON.stringify(bookingData));
    } else {
      const storedBooking = localStorage.getItem('lastBooking');
      if (storedBooking) {
        setBooking(JSON.parse(storedBooking));
      } else {
        toast.error('No booking details found');
        navigate('/rooms');
      }
    }
  }, [location.state, navigate]);

  const handleViewInvoice = () => {
    setShowInvoice(true);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const generateInvoiceNumber = () => {
    return `INV-${booking._id?.substring(0, 8) || 'TEMP'}-${Math.floor(Math.random() * 1000)}`;
  };

  const handleGeneratePDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      setIsDownloading(true);
      
      // Clone the invoice element to modify it for PDF
      const invoiceElement = invoiceRef.current;
      const clone = invoiceElement.cloneNode(true);
      
      // Style the clone for PDF output
      clone.style.backgroundColor = '#ffffff';
      clone.style.color = '#000000';
      clone.style.padding = '20px';
      clone.style.boxShadow = 'none';
      
      // Temporarily add to document for rendering
      document.body.appendChild(clone);
      
      // Render to canvas with improved settings
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Remove clone
      document.body.removeChild(clone);
      
      // Create PDF with appropriate dimensions
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210 - 20; // A4 width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`room-booking-invoice-${booking._id || 'temp'}.pdf`);
      
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!booking) {
    return (
      <div className="confirmation-page">
        <div className="error-container">
          <h2>No booking details found</h2>
          <p>Please make a booking first</p>
          <button onClick={() => navigate('/rooms')} className="action-button">
            View Rooms
          </button>
        </div>
      </div>
    );
  }

  if (showInvoice) {
    // Display invoice view
    return (
      <div className="invoice-page">
        <div className="invoice-actions">
          <button className="action-button back" onClick={() => setShowInvoice(false)}>
            <FiArrowLeft /> Back
          </button>
          <button
            className="action-button download"
            onClick={handleGeneratePDF}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>Loading...</>
            ) : (
              <>
                <FiDownload /> Download PDF
              </>
            )}
          </button>
        </div>
        
        <div className="invoice-container" ref={invoiceRef}>
          <div className="invoice-header">
            <div className="hotel-info">
              <h1>Night Elegance</h1>
              <p>123 Luxury Avenue</p>
              <p>City, State 12345</p>
              <p>Tel: (555) 123-4567</p>
            </div>
            <div className="invoice-details">
              <h2>INVOICE</h2>
              <p><strong>Invoice No:</strong> {generateInvoiceNumber()}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>Booking ID:</strong> {booking._id}</p>
            </div>
          </div>

          <div className="invoice-to">
            <h3>INVOICE TO:</h3>
            <p><strong>{booking.fullName || 'Guest'}</strong></p>
            <p>{booking.email || 'N/A'}</p>
            <p>{booking.phone || 'N/A'}</p>
          </div>

          <div className="invoice-items">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Details</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <p>Room Booking</p>
                    <small>Check In: {formatDate(booking.checkInDate)}</small>
                    <br />
                    <small>Check Out: {formatDate(booking.checkOutDate)}</small>
                  </td>
                  <td>
                    <p>Room: {booking.roomNumber}</p>
                    <p>Type: {booking.roomType}</p>
                    <p>Guests: {booking.guests}</p>
                    <p>Duration: {booking.numberOfNights} night(s)</p>
                  </td>
                  <td>${booking.basePrice}</td>
                </tr>
                {booking.specialRequests && (
                  <tr>
                    <td colSpan="3">
                      <strong>Special Requests:</strong>
                      <p>{booking.specialRequests}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="invoice-summary">
            <div className="summary-item">
              <span>Subtotal:</span>
              <span>${booking.basePrice}</span>
            </div>
            <div className="summary-item">
              <span>Tax (10%):</span>
              <span>${booking.taxAmount}</span>
            </div>
            <div className="summary-item total">
              <span>Total:</span>
              <span>${booking.totalPrice}</span>
            </div>
            <div className="summary-item payment">
              <span>Payment Method:</span>
              <span>{booking.payment === 'card' ? 'Credit Card' : 'PayPal'}</span>
            </div>
          </div>

          <div className="invoice-footer">
            <p>Thank you for choosing Night Elegance</p>
            <small>This is a computer-generated invoice and requires no signature</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-confirmation-page">
      {/* Hero Section */}
      <div className="confirmation-hero">
        <div className="hero-content">
          <div className="success-animation">
            <FiCheck className="success-icon" />
          </div>
          <h1 className="hero-title">🎉 Booking Confirmed!</h1>
          <p className="hero-subtitle">Your luxury room has been successfully reserved</p>
          <div className="booking-id-badge">
            <FiHash className="badge-icon" />
            <span>Booking ID: {booking._id?.substring(0, 8).toUpperCase() || 'TEMP'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="confirmation-content">
        <div className="content-container">

          {/* Quick Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card primary">
              <div className="card-icon">
                <FiCalendar />
              </div>
              <div className="card-content">
                <h3>Check-in</h3>
                <p>{formatDate(booking.checkInDate)}</p>
              </div>
            </div>

            <div className="summary-card primary">
              <div className="card-icon">
                <FiCalendar />
              </div>
              <div className="card-content">
                <h3>Check-out</h3>
                <p>{formatDate(booking.checkOutDate)}</p>
              </div>
            </div>

            <div className="summary-card accent">
              <div className="card-icon">
                <FiHome />
              </div>
              <div className="card-content">
                <h3>Room {booking.roomNumber}</h3>
                <p>{booking.roomType}</p>
              </div>
            </div>

            <div className="summary-card success">
              <div className="card-icon">
                <FiDollarSign />
              </div>
              <div className="card-content">
                <h3>Total Paid</h3>
                <p>Rs. {booking.totalPrice}</p>
              </div>
            </div>
          </div>

          {/* Detailed Information Grid */}
          <div className="details-section">
            <h2 className="section-title">Booking Details</h2>
            <div className="details-grid">
              <div className="detail-card">
                <div className="detail-header">
                  <FiUsers className="detail-icon" />
                  <span>Guest Information</span>
                </div>
                <div className="detail-body">
                  <div className="detail-row">
                    <span className="label">Guests:</span>
                    <span className="value">{booking.guests} person(s)</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Duration:</span>
                    <span className="value">{booking.numberOfNights} night(s)</span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <div className="detail-header">
                  <FiCreditCard className="detail-icon" />
                  <span>Payment Information</span>
                </div>
                <div className="detail-body">
                  <div className="detail-row">
                    <span className="label">Method:</span>
                    <span className="value">{booking.payment === 'card' ? 'Credit Card' : 'PayPal'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className="value success">✓ Confirmed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-section">
            <button
              onClick={handleViewInvoice}
              className="action-btn primary"
            >
              <FiPrinter />
              <span>View & Download Invoice</span>
            </button>
            <button
              onClick={() => navigate('/my-bookings')}
              className="action-btn secondary"
            >
              <FiArrowLeft />
              <span>View All Bookings</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation; 