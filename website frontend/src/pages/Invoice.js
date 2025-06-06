import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiDownload, FiArrowLeft } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PageLayout from '../components/layout/PageLayout';
import './Invoice.css';

const Invoice = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef(null);
  const booking = location.state?.booking;

  if (!booking) {
    navigate('/rooms');
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generateInvoiceNumber = () => {
    const timestamp = new Date().getTime();
    return `INV-${timestamp}-${Math.floor(Math.random() * 1000)}`;
  };

  const handleDownloadPDF = async () => {
    const element = invoiceRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`invoice-${generateInvoiceNumber()}.pdf`);
  };

  return (
    <PageLayout>
      <div className="invoice-page">
        <div className="invoice-actions">
          <button className="action-button back" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
          <button className="action-button download" onClick={handleDownloadPDF}>
            <FiDownload /> Download PDF
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
              <p><strong>Date:</strong> {formatDate(new Date())}</p>
              <p><strong>Booking ID:</strong> {booking._id}</p>
            </div>
          </div>

          <div className="invoice-to">
            <h3>INVOICE TO:</h3>
            <p><strong>{booking.fullName}</strong></p>
            <p>{booking.email}</p>
            <p>{booking.phone}</p>
          </div>

          <div className="invoice-items">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Nights</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <p>{booking.roomType}</p>
                    <small>Check-in: {formatDate(booking.checkInDate)}</small>
                    <br />
                    <small>Check-out: {formatDate(booking.checkOutDate)}</small>
                  </td>
                  <td>{booking.numberOfNights}</td>
                  <td>${(booking.basePrice / booking.numberOfNights).toFixed(2)}</td>
                  <td>${booking.basePrice}</td>
                </tr>
                {booking.specialRequests && (
                  <tr>
                    <td colSpan="4">
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
    </PageLayout>
  );
};

export default Invoice; 