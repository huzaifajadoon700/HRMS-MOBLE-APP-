import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button, Spinner } from "react-bootstrap";
import { FiDownload } from "react-icons/fi";
import "./Invoice.css";

export default function Invoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    // First check if we have order data in location state (coming from order confirmation)
    if (location.state?.order) {
      console.log("Using order data from location state:", location.state.order);
      setOrder(location.state.order);
      
      // Check if user details were passed directly
      if (location.state.userDetails) {
        console.log("Using user details from location state:", location.state.userDetails);
        setUserData(location.state.userDetails);
      }
      
      setLoading(false);
      return;
    }

    // Check if we have a valid order ID in params, otherwise try localStorage
    const currentOrderId = orderId && orderId !== 'undefined' ? orderId : localStorage.getItem("lastOrderId");
    
    if (!currentOrderId) {
      setError("Invalid order ID");
      setLoading(false);
      return;
    }

    // Check if user data is available in localStorage
    try {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const parsedUserData = JSON.parse(storedUserData);
        console.log("Using user data from localStorage:", parsedUserData);
        setUserData(parsedUserData);
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage:", e);
    }

    // Always fetch fresh order data from the server to ensure we have the latest
    fetchOrderDetails(currentOrderId);
  }, [orderId, navigate, location]);

  const fetchOrderDetails = async (currentOrderId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Check user role from stored data if available
      const role = localStorage.getItem("role");
      const userData = localStorage.getItem("userData");
      console.log("User role from localStorage:", role);
      console.log("User data from localStorage:", userData);
      
      console.log("Fetching order details for ID:", currentOrderId);
      console.log("Authorization token present:", !!token);
      console.log("Token:", token.substring(0, 15) + "...");
      
      const response = await axios.get(`http://localhost:8080/api/orders/${currentOrderId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Order details response:", response);
      
      if (!response.data) {
        setError("No data returned from server");
        return;
      }
      
      console.log("Order details received:", response.data);
      setOrder(response.data);
      
      // If order response includes userDetails, use it directly
      if (response.data && response.data.userDetails) {
        console.log("User details from order:", response.data.userDetails);
        setUserData(response.data.userDetails);
      }
      // Otherwise, try to fetch user data separately (fallback approach)
      else if (response.data && response.data.user) {
        try {
          console.log("Fetching user details for user ID:", response.data.user);
          const userResponse = await axios.get(`http://localhost:8080/api/user/${response.data.user}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log("User details:", userResponse.data);
          setUserData(userResponse.data);
        } catch (userError) {
          console.error("Error fetching user details:", userError);
          // Try to get the current user's data as a last resort
          try {
            const userResponse = await axios.get(`http://localhost:8080/api/user/profile`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUserData(userResponse.data);
          } catch (profileError) {
            console.error("Error fetching profile:", profileError);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      console.error("Error details:", error.response?.data);
      console.error("Status code:", error.response?.status);
      
      if (error.response?.status === 404) {
        setError("Order not found. Please check your order ID.");
      } else if (error.response?.status === 401) {
        setError("You need to login to view this invoice.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (error.response?.status === 403) {
        setError("You do not have permission to view this order. Access denied.");
      } else {
        setError("Failed to load order details. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      setGeneratingPDF(true);
      const invoiceElement = document.getElementById("invoice");
      
      // Create a clone of the invoice element
      const clone = invoiceElement.cloneNode(true);
      
      // Apply white background and black text to the clone and all its children
      const applyStyles = (element) => {
        element.style.backgroundColor = '#ffffff';
        element.style.color = '#000000';
        element.style.borderColor = '#000000';
        // Remove any glass effects or transparency
        element.classList.remove('glass');
        element.style.backdropFilter = 'none';
        element.style.background = '#ffffff';
        
        // Ensure table borders are visible
        if (element.tagName === 'TABLE') {
          element.style.borderCollapse = 'collapse';
          element.style.width = '100%';
        }
        if (element.tagName === 'TD' || element.tagName === 'TH') {
          element.style.border = '1px solid #000000';
          element.style.padding = '8px';
        }
        
        // Process all child elements
        Array.from(element.children).forEach(applyStyles);
      };
      
      applyStyles(clone);
      clone.style.padding = '20px';
      document.body.appendChild(clone);

      // Capture the clone with html2canvas
      const canvas = await html2canvas(clone, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        removeContainer: true,
        letterRendering: true,
        allowTaint: true,
        foreignObjectRendering: false,
        quality: 1,
        width: clone.offsetWidth,
        height: clone.offsetHeight
      });
      
      // Remove the clone after capturing
      document.body.removeChild(clone);

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      // Calculate dimensions
      const pageWidth = 210;  // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10;
      
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0), 
        'JPEG', 
        margin, 
        margin, 
        imgWidth, 
        imgHeight,
        '',
        'FAST'
      );

      // Handle multiple pages if needed
      if (imgHeight > pageHeight - (margin * 2)) {
        let heightLeft = imgHeight;
        let position = 0;
        
        for (let i = 1; heightLeft > 0; i++) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(
            canvas.toDataURL('image/jpeg', 1.0),
            'JPEG',
            margin,
            position + margin,
            imgWidth,
            imgHeight,
            '',
            'FAST'
          );
          heightLeft -= (pageHeight - (margin * 2));
        }
      }

      // Save PDF
      pdf.save(`Invoice_${orderId}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spinner animation="border" variant="primary" />
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <Button variant="outline-primary" onClick={fetchOrderDetails}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Order not found</h3>
          <Button variant="outline-primary" onClick={() => navigate("/my-orders")}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-wrapper">
      <div id="invoice" className="invoice-container">
        <div className="invoice-header">
          <div className="company-info">
            <h1>Hotel Management System</h1>
            <p>123 Main Street, Islamabad, Pakistan</p>
            <p>Phone: +92 123 456 7890</p>
            <p>Email: info@hotelmanagement.com</p>
          </div>
          <div className="invoice-info">
            <h2>INVOICE</h2>
            <p>Invoice #: INV-{orderId.slice(-6)}</p>
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Time: {new Date(order.createdAt).toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="bill-to">
          <h3>Bill To:</h3>
          <p>Name: {userData?.name || localStorage.getItem('name') || order?.userDetails?.name || "Customer"}</p>
          <p>Email: {userData?.email || localStorage.getItem('email') || order?.userDetails?.email || ""}</p>
          <p>Phone: {userData?.phone || localStorage.getItem('phone') || order?.userDetails?.phone || ""}</p>
        </div>

        <div className="order-items">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Add-ons</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => {
                // Improved extraction of item data from complex MongoDB object structure
                console.log("Raw item object:", JSON.stringify(item, null, 2));
                
                // First try to access directly 
                let itemName = item.name;
                let itemPrice = item.price;
                let itemQuantity = item.quantity;
                
                // If item has _doc property (mongoose document), try to get from there
                if (item._doc) {
                  console.log("Found _doc property:", item._doc);
                  itemName = itemName || item._doc.name;
                  itemPrice = typeof itemPrice === 'number' ? itemPrice : item._doc.price;
                  itemQuantity = typeof itemQuantity === 'number' ? itemQuantity : item._doc.quantity;
                }
                
                // If item has __parentArray (MongoDB internal), try to access from first element
                if (item.__parentArray && item.__parentArray[0]) {
                  console.log("Found __parentArray:", item.__parentArray[0]);
                  itemName = itemName || item.__parentArray[0].name;
                  itemPrice = typeof itemPrice === 'number' ? itemPrice : item.__parentArray[0].price;
                  itemQuantity = typeof itemQuantity === 'number' ? itemQuantity : item.__parentArray[0].quantity;
                }
                
                // Check if nested under $__parent structure
                if (item.$__parent && item.$__parent.items && Array.isArray(item.$__parent.items)) {
                  // Try to find matching item by index
                  const parentItem = item.$__parent.items[index];
                  if (parentItem) {
                    console.log("Found parent item:", parentItem);
                    itemName = itemName || parentItem.name;
                    itemPrice = typeof itemPrice === 'number' ? itemPrice : parentItem.price;
                    itemQuantity = typeof itemQuantity === 'number' ? itemQuantity : parentItem.quantity;
                  }
                }
                
                // Check for _doc nested properties as a last resort
                if (item._doc && item._doc.__parentArray && item._doc.__parentArray[0]) {
                  console.log("Found nested _doc.__parentArray:", item._doc.__parentArray[0]);
                  itemName = itemName || item._doc.__parentArray[0].name;
                  itemPrice = typeof itemPrice === 'number' ? itemPrice : item._doc.__parentArray[0].price;
                  itemQuantity = typeof itemQuantity === 'number' ? itemQuantity : item._doc.__parentArray[0].quantity;
                }
                
                // Final fallbacks
                itemName = itemName || 'Unknown Item';
                itemPrice = typeof itemPrice === 'number' ? itemPrice : 0;
                itemQuantity = typeof itemQuantity === 'number' ? itemQuantity : 1;
                
                console.log("Extracted item data:", { itemName, itemPrice, itemQuantity });
                
                // Calculate item totals
                const itemTotal = itemPrice * itemQuantity;
                const addOnsTotal = (item.addons || []).reduce((acc, addon) => 
                  acc + (addon.price || 0), 0) || 0;
                const total = itemTotal + (addOnsTotal * itemQuantity);

                return (
                  <tr key={index}>
                    <td>{itemName}</td>
                    <td>{itemQuantity}</td>
                    <td>${itemPrice.toFixed(2)}</td>
                    <td>
                      {item.addons && item.addons.length > 0 ? (
                        <ul className="addons-list">
                          {item.addons.map((addon, idx) => (
                            <li key={idx}>
                              {addon.name} (+${(addon.price || 0).toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        'No add-ons'
                      )}
                    </td>
                    <td>${total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>${(order.totalPrice - (order.deliveryFee || 0)).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (10%):</span>
            <span>${((order.totalPrice - (order.deliveryFee || 0)) * 0.1).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total Amount:</span>
            <span>${order.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <div className="invoice-footer">
          <Button 
            variant="primary" 
            onClick={generatePDF} 
            className="btn-cosmic btn-download"
            disabled={generatingPDF}
          >
            {generatingPDF ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Generating PDF...
              </>
            ) : (
              <>
                <FiDownload className="me-2" />
                Download Invoice
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
