import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiCalendar, FiClock, FiUsers, FiCheckCircle, FiDownload, FiArrowLeft, FiDollarSign, FiCreditCard, FiHash, FiUser, FiMail, FiPhone, FiPrinter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import PageLayout from '../components/layout/PageLayout';
import './TableConfirmationPage.css';

const TableConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const invoiceRef = useRef(null);

  useEffect(() => {
    const fetchReservationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First try to get from location state
        const reservationData = location.state?.reservation;
        if (reservationData) {
          setReservation(reservationData);
          localStorage.setItem('lastReservation', JSON.stringify(reservationData));
          await fetchUserData(reservationData._id);
          setLoading(false);
          return;
        }

        // Then try to get from localStorage
        const storedReservation = localStorage.getItem('lastReservation');
        if (storedReservation) {
          const parsedReservation = JSON.parse(storedReservation);
          setReservation(parsedReservation);
          await fetchUserData(parsedReservation._id);
          setLoading(false);
          return;
        }

        // If we have a reservationId in URL, try to fetch from API
        if (reservationId) {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Please login to view reservation details');
          }

          const response = await axios.get(
            `http://localhost:8080/api/reservations/${reservationId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data.success && response.data.reservation) {
            setReservation(response.data.reservation);
            localStorage.setItem('lastReservation', JSON.stringify(response.data.reservation));
            await fetchUserData(response.data.reservation._id);
          } else {
            throw new Error(response.data.error || 'Failed to fetch reservation details');
          }
        } else {
          throw new Error('No reservation details found');
        }
      } catch (error) {
        console.error('Error fetching reservation:', error);
        setError(error.response?.data?.error || error.message || 'Failed to load reservation details');
        if (error.message === 'Please login to view reservation details') {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservationData();
  }, [location.state, navigate, reservationId]);

  const fetchUserData = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const userResponse = await axios.get(
        `http://localhost:8080/api/user/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (userResponse.data) {
        setUserData(userResponse.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Don't set error state here, we'll just show N/A for user data
    }
  };

  const handleViewInvoice = () => {
    setShowInvoice(true);
  };

  const handleGeneratePDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      setDownloadLoading(true);
      
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
      pdf.save(`table-reservation-invoice-${reservation._id}.pdf`);
      
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const generateInvoiceNumber = () => {
    return `INV-${reservation._id.substring(0, 8)}-${Math.floor(Math.random() * 1000)}`;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="confirmation-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading reservation details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="confirmation-container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/reserve-table')} className="btn btn-primary">
              Make a Reservation
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!reservation) {
    return (
      <PageLayout>
        <div className="confirmation-container">
          <div className="error-message">
            <h2>No reservation details found</h2>
            <p>Please make a reservation first</p>
            <button onClick={() => navigate('/reserve-table')} className="btn btn-primary">
              Make a Reservation
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (showInvoice) {
    // Display invoice view
    return (
      <PageLayout>
        <div className="invoice-page">
          <div className="invoice-actions">
            <button className="action-button back" onClick={() => setShowInvoice(false)}>
              <FiArrowLeft /> Back
            </button>
            <button
              className="action-button download"
              onClick={handleGeneratePDF}
              disabled={downloadLoading}
            >
              {downloadLoading ? (
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
                <p><strong>Reservation ID:</strong> {reservation._id}</p>
              </div>
            </div>

            <div className="invoice-to">
              <h3>INVOICE TO:</h3>
              <p><strong>{userData?.name || reservation.fullName || 'Guest'}</strong></p>
              <p>{userData?.email || reservation.email || 'N/A'}</p>
              <p>{reservation.phone || userData?.phone || 'N/A'}</p>
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
                      <p>Table Reservation</p>
                      <small>Date: {formatDate(reservation.reservationDate)}</small>
                      <br />
                      <small>Time: {reservation.time} - {reservation.endTime}</small>
                    </td>
                    <td>
                      <p>Table: {reservation.tableNumber}</p>
                      <p>Guests: {reservation.guests}</p>
                    </td>
                    <td>${reservation.totalPrice}</td>
                  </tr>
                  {reservation.specialRequests && (
                    <tr>
                      <td colSpan="3">
                        <strong>Special Requests:</strong>
                        <p>{reservation.specialRequests}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="invoice-summary">
              <div className="summary-item">
                <span>Subtotal:</span>
                <span>${reservation.totalPrice}</span>
              </div>
              <div className="summary-item">
                <span>Tax (0%):</span>
                <span>$0.00</span>
              </div>
              <div className="summary-item total">
                <span>Total:</span>
                <span>${reservation.totalPrice}</span>
              </div>
              <div className="summary-item payment">
                <span>Payment Method:</span>
                <span>{reservation.payment === 'card' ? 'Credit Card' : 'PayPal'}</span>
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
  }

  return (
    <PageLayout>
      <div className="confirmation-container">
        <div className="confirmation-card">
          <div className="confirmation-header">
            <FiCheckCircle className="success-icon" />
            <h2>Reservation Confirmed!</h2>
            <p>Your table has been successfully reserved</p>
          </div>

          <div className="confirmation-details">
            <div className="details-grid">
              <div className="detail-item">
                <FiCalendar className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{new Date(reservation.reservationDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="detail-item">
                <FiClock className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">{reservation.time}</span>
                </div>
              </div>

              <div className="detail-item">
                <FiUsers className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Guests</span>
                  <span className="detail-value">{reservation.guests}</span>
                </div>
              </div>

              <div className="detail-item">
                <FiHash className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Table</span>
                  <span className="detail-value">{reservation.tableNumber}</span>
                </div>
              </div>

              <div className="detail-item">
                <FiUser className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Name</span>
                  <span className="detail-value">{userData?.name || reservation.fullName || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-item">
                <FiMail className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{userData?.email || reservation.email || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-item">
                <FiPhone className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Phone</span>
                  <span className="detail-value">{reservation.phone || userData?.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="detail-item">
                <FiDollarSign className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Total Amount</span>
                  <span className="detail-value">${reservation.totalPrice}</span>
                </div>
              </div>

              <div className="detail-item">
                <FiCreditCard className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">{reservation.payment}</span>
                </div>
              </div>

              <div className="detail-item">
                <FiHash className="detail-icon" />
                <div className="detail-content">
                  <span className="detail-label">Reservation ID</span>
                  <span className="detail-value">{reservation._id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <button 
              onClick={handleViewInvoice}
              className="btn btn-primary"
            >
              <FiPrinter className="me-2" />
              View & Print Invoice
            </button>
            <button 
              onClick={() => navigate('/reserve-table')} 
              className="btn btn-secondary"
            >
              <FiArrowLeft className="me-2" />
              Back to Reservation
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TableConfirmationPage; 