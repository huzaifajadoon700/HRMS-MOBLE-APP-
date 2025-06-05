const Reservation = require("../Models/Reservations");
const Table = require("../Models/Table");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a new reservation
exports.createReservation = async (req, res) => {
  try {
    const { tableId, tableNumber, reservationDate, time, endTime, guests, payment, totalPrice, phone, fullName, email, specialRequests, paymentMethodId } = req.body;
    const userId = req.user._id; // Get the user ID from the authenticated request

    console.log("Reservation request body:", req.body);

    // Validate required fields
    if (!tableId || !reservationDate || !time || !endTime || !guests || !payment || !totalPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Ensure guests and totalPrice are numbers
    if (typeof guests !== "number" || typeof totalPrice !== "number") {
      return res.status(400).json({ error: "Invalid data types for guests or totalPrice" });
    }

    // Validate that endTime is after time
    const startTimeMinutes = convertTimeToMinutes(time);
    const endTimeMinutes = convertTimeToMinutes(endTime);
    
    if (endTimeMinutes <= startTimeMinutes) {
      return res.status(400).json({ 
        error: "Invalid time range",
        message: "End time must be after start time" 
      });
    }

    // Check if the table is already reserved for the requested date and time range
    const existingReservations = await Reservation.find({
      tableId,
      reservationDate,
    });

    // Check for time overlaps with existing reservations
    const hasOverlap = existingReservations.some(reservation => {
      const existingStartTimeMinutes = convertTimeToMinutes(reservation.time);
      const existingEndTimeMinutes = convertTimeToMinutes(reservation.endTime);
      
      // Check if the new reservation overlaps with an existing one
      return (
        (startTimeMinutes >= existingStartTimeMinutes && startTimeMinutes < existingEndTimeMinutes) || // new start time falls within existing reservation
        (endTimeMinutes > existingStartTimeMinutes && endTimeMinutes <= existingEndTimeMinutes) || // new end time falls within existing reservation
        (startTimeMinutes <= existingStartTimeMinutes && endTimeMinutes >= existingEndTimeMinutes) // new reservation completely encompasses existing one
      );
    });

    if (hasOverlap) {
      return res.status(400).json({ 
        error: "Table is already reserved",
        message: "This table is already reserved during the selected time range. Please choose a different time or select another table." 
      });
    }

    // Process payment with Stripe
    let paymentIntent;
    if (payment === 'card' && paymentMethodId) {
      try {
        // First create the payment intent
        paymentIntent = await stripe.paymentIntents.create({
          amount: totalPrice * 100, // Convert to cents
          currency: 'usd',
          payment_method_types: ['card'],
          metadata: {
            tableId,
            tableNumber,
            reservationDate,
            guests
          }
        });

        // Then confirm the payment intent with the payment method
        paymentIntent = await stripe.paymentIntents.confirm(paymentIntent.id, {
          payment_method: paymentMethodId
        });

        if (paymentIntent.status !== 'succeeded') {
          throw new Error('Payment failed: ' + paymentIntent.status);
        }
      } catch (error) {
        console.error('Stripe payment error:', error);
        return res.status(400).json({ 
          error: 'Payment failed',
          message: error.message 
        });
      }
    }

    const reservation = new Reservation({
      tableId,
      tableNumber,
      reservationDate,
      time,
      endTime,
      guests,
      payment,
      totalPrice,
      phone,
      fullName,
      email,
      specialRequests,
      userId,
      paymentIntentId: paymentIntent?.id,
      paymentStatus: paymentIntent?.status || 'pending'
    });

    console.log("Creating reservation with data:", reservation);

    const savedReservation = await reservation.save();
    
    // Update table status to 'Reserved'
    await Table.findByIdAndUpdate(tableId, { status: 'Reserved' });
    
    res.status(201).json({ 
      message: "Reservation confirmed", 
      reservation: savedReservation,
      paymentIntent: paymentIntent
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to convert time (HH:MM or HH:MM AM/PM) to minutes for easier comparison
function convertTimeToMinutes(timeString) {
  let hours, minutes;

  // Check if the time is in 12-hour format with AM/PM
  if (timeString.includes('AM') || timeString.includes('PM')) {
    const [timePart, modifier] = timeString.split(/\s+/);
    [hours, minutes] = timePart.split(':').map(Number);
    
    // Convert to 24-hour format
    if (hours === 12) {
      hours = modifier === 'PM' ? 12 : 0;
    } else if (modifier === 'PM') {
      hours += 12;
    }
  } else {
    // 24-hour format (HH:MM)
    [hours, minutes] = timeString.split(':').map(Number);
  }
  
  return hours * 60 + minutes;
}

// Fetch all reservations for the logged-in user
exports.getReservationsByUser = async (req, res) => {
  try {
    const userId = req.user._id; // Get the user ID from the authenticated request
    
    // Get user details for enriching reservations
    const User = mongoose.model('users');
    const user = await User.findById(userId).lean();
    
    console.log("User data found:", user ? { name: user.name, email: user.email, phone: user.phone } : "No user found");
    
    const reservations = await Reservation.find({ userId }).populate("tableId").lean();
    console.log("Reservations from database:", JSON.stringify(reservations, null, 2)); // Debug log
    
    // Enrich reservations with user data if fields are missing
    const enrichedReservations = reservations.map(reservation => {
      // Make sure we have user data, even if some fields are missing
      console.log("Processing reservation:", reservation._id);
      console.log("Reservation user data:", {
        fullName: reservation.fullName,
        email: reservation.email,
        phone: reservation.phone
      });
      
      return {
        ...reservation,
        fullName: reservation.fullName || user?.name || null,
        email: reservation.email || user?.email || null,
        phone: reservation.phone || user?.phone || null
      };
    });
    
    console.log("Enriched reservations:", enrichedReservations.map(r => ({
      id: r._id,
      fullName: r.fullName,
      email: r.email,
      phone: r.phone
    })));
    
    res.status(200).json(enrichedReservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).json({ error: "Error fetching reservations" });
  }
};

// Fetch all reservations (admin only)
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("tableId");
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: "Error fetching reservations" });
  }
};

// Update a reservation
exports.updateReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user._id; // Get the user ID from the authenticated request

    // Ensure the reservation belongs to the logged-in user
    const reservation = await Reservation.findOne({ _id: reservationId, userId });
    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found or unauthorized" });
    }

    // Check if reservation date is in the past
    const reservationDate = new Date(reservation.reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today

    if (reservationDate < today) {
      return res.status(400).json({ 
        error: "Cannot modify past reservation",
        message: "Reservations for past dates cannot be modified"
      });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      reservationId,
      {
        reservationDate: req.body.reservationDate,
        time: req.body.time,
        endTime: req.body.endTime,
        guests: req.body.guests,
        payment: req.body.payment,
      },
      { new: true } // Return the updated reservation
    );

    res.status(200).json({ message: "Reservation updated", updatedReservation });
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ error: "Error updating reservation" });
  }
};

// Delete a reservation
exports.deleteReservation = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user._id; // Get the user ID from the authenticated request
    const isAdmin = req.user.isAdmin || req.user.role === 'admin'; // Check if user is admin
    
    console.log("Attempting to delete reservation with ID:", reservationId);
    console.log("User ID:", userId);
    console.log("Is Admin:", isAdmin);

    if (!reservationId) {
      return res.status(400).json({ error: "Reservation ID is required" });
    }

    // First check if reservation exists
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      console.log("Reservation not found with ID:", reservationId);
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Check if reservation date is in the past
    const reservationDate = new Date(reservation.reservationDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today

    if (reservationDate < today && !isAdmin) {
      return res.status(400).json({ 
        error: "Cannot cancel past reservation",
        message: "Reservations for past dates cannot be canceled"
      });
    }

    console.log("Found reservation:", reservation);
    console.log("Reservation userId:", reservation.userId);
    console.log("Current userId:", userId);

    // Check if user owns this reservation or is an admin
    if (!isAdmin && reservation.userId.toString() !== userId.toString()) {
      console.log("User not authorized to delete this reservation");
      return res.status(403).json({ error: "You are not authorized to delete this reservation" });
    }

    // Get the tableId before deleting the reservation
    const tableId = reservation.tableId;

    // Delete the reservation
    const result = await Reservation.findByIdAndDelete(reservationId);
    console.log("Delete operation result:", result);

    if (!result) {
      console.log("No reservation was deleted");
      return res.status(404).json({ error: "Failed to delete reservation" });
    }

    // Check if there are any other active reservations for this table
    const otherActiveReservations = await Reservation.findOne({
      tableId,
      // For today's date or later
      reservationDate: { $gte: new Date().toISOString().split('T')[0] }
    });

    console.log("Other active reservations:", otherActiveReservations);

    // If no other active reservations, update table status to 'Available'
    if (!otherActiveReservations) {
      console.log("No other active reservations found, updating table status");
      await Table.findByIdAndUpdate(tableId, { status: 'Available' });
    }

    console.log("Successfully deleted reservation with ID:", reservationId);
    res.status(200).json({ 
      success: true,
      message: "Reservation deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteReservation:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ 
        success: false,
        error: "Invalid reservation ID format" 
      });
    }
    res.status(500).json({ 
      success: false,
      error: "Error deleting reservation",
      message: error.message 
    });
  }
};

// Get a reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.isAdmin || req.user.role === 'admin';
    
    console.log("Fetching reservation with ID:", reservationId);
    console.log("User making request:", userId);
    
    // Find the reservation by ID and populate user data
    const reservation = await Reservation.findById(reservationId)
      .populate('userId', 'name email')
      .populate('tableId');
    
    if (!reservation) {
      console.log("Reservation not found with ID:", reservationId);
      return res.status(404).json({ 
        success: false,
        error: "Reservation not found" 
      });
    }
    
    console.log("Found reservation object:", JSON.stringify(reservation, null, 2));
    console.log("User data in reservation:", reservation.userId);
    
    // Check if the reservation belongs to the user or the user is an admin
    if (!isAdmin && reservation.userId && reservation.userId._id && reservation.userId._id.toString() !== userId.toString()) {
      console.log("User not authorized to access this reservation");
      console.log("Reservation user ID:", reservation.userId?._id);
      console.log("Current user ID:", userId);
      return res.status(403).json({ 
        success: false,
        error: "You don't have permission to access this reservation" 
      });
    }
    
    res.status(200).json({
      success: true,
      reservation
    });
  } catch (error) {
    console.error("Error getting reservation by ID:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ 
        success: false,
        error: "Invalid reservation ID format" 
      });
    }
    res.status(500).json({ 
      success: false,
      error: "Error retrieving reservation" 
    });
  }
};

// Generate invoice for a reservation
exports.generateInvoice = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user._id;

    console.log("Generating invoice for reservation:", reservationId);

    // Find the reservation (don't use populate here)
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      console.log("Reservation not found");
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    console.log("Found reservation:", reservation);

    // Check if user owns this reservation or is admin
    if (reservation.userId.toString() !== userId.toString() && !req.user.isAdmin) {
      console.log("User not authorized:", userId, "Reservation userId:", reservation.userId);
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this reservation'
      });
    }

    // Now get the user data separately
    const User = mongoose.model('users');
    const user = await User.findById(reservation.userId);

    console.log("User data for invoice:", user);

    // Get table details
    const table = await Table.findById(reservation.tableId);
    const tableName = table ? table.tableName : 'Table ' + reservation.tableNumber;

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      bufferPages: true
    });
    
    const invoicePath = path.join(__dirname, '../uploads/invoices', `invoice-${reservationId}.pdf`);
    
    // Ensure the invoices directory exists
    const invoiceDir = path.join(__dirname, '../uploads/invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    // Pipe the PDF to a file
    const writeStream = fs.createWriteStream(invoicePath);
    doc.pipe(writeStream);

    // Add styling
    const titleColor = '#1a1a1a';
    const accentColor = '#3498db';
    const textColor = '#4a4a4a';
    const lightTextColor = '#6c757d';

    // Helper functions for consistent styling
    const addSectionTitle = (text) => {
      doc.fontSize(14).fillColor(titleColor).font('Helvetica-Bold').text(text, { paragraphGap: 5 });
      doc.moveDown(0.5);
    };

    const addNormalText = (text) => {
      doc.fontSize(10).fillColor(textColor).font('Helvetica').text(text, { paragraphGap: 5 });
    };

    const addLightText = (text) => {
      doc.fontSize(9).fillColor(lightTextColor).font('Helvetica').text(text, { paragraphGap: 5 });
    };

    // Draw a line divider
    const drawDivider = () => {
      doc.strokeColor('#eeeeee').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();
      doc.moveDown(1);
    };

    // Add content to the PDF
    // Header
    doc.rect(50, 50, doc.page.width - 100, 85).fill('#f8f9fa');
    doc.fontSize(25).fillColor(accentColor).font('Helvetica-Bold').text('NIGHT ELEGANCE', 70, 65);
    doc.fontSize(10).fillColor(textColor).font('Helvetica').text('123 Luxury Avenue, City, State 12345', 70, 95);
    doc.text('Tel: (555) 123-4567', 70, 110);
    
    // Invoice title
    doc.fontSize(20).fillColor(titleColor).font('Helvetica-Bold').text('TABLE RESERVATION INVOICE', doc.page.width - 270, 65, { width: 200, align: 'right' });
    doc.fontSize(10).fillColor(textColor).font('Helvetica').text(`Date: ${new Date().toLocaleDateString()}`, doc.page.width - 270, 90, { width: 200, align: 'right' });
    doc.text(`Invoice #: INV-${reservationId.substring(0, 8)}`, doc.page.width - 270, 105, { width: 200, align: 'right' });
    
    doc.moveDown(2);

    // Bill To section
    addSectionTitle('BILL TO:');
    addNormalText(`${user ? user.name : (reservation.fullName || 'Guest')}`);
    addNormalText(`Email: ${user ? user.email : (reservation.email || 'N/A')}`);
    addNormalText(`Phone: ${reservation.phone || 'N/A'}`);
    
    doc.moveDown(1);
    drawDivider();

    // Reservation Details section
    addSectionTitle('RESERVATION DETAILS:');
    
    // Create a table for reservation details
    const tableTop = doc.y;
    const tableWidth = doc.page.width - 100;
    
    // Table headers
    doc.rect(50, tableTop, tableWidth, 20).fill('#f8f9fa');
    doc.fontSize(10).fillColor(titleColor).font('Helvetica-Bold').text('Description', 60, tableTop + 5, { width: tableWidth * 0.5 });
    doc.text('Details', 60 + tableWidth * 0.5, tableTop + 5, { width: tableWidth * 0.5 });
    doc.moveTo(50, tableTop + 20).lineTo(50 + tableWidth, tableTop + 20).stroke();
    
    // Helper function to add table row
    const addTableRow = (label, value, isLast = false) => {
      const rowTop = doc.y;
      doc.fontSize(10).fillColor(textColor).font('Helvetica-Bold').text(label, 60, rowTop, { width: tableWidth * 0.5 });
      doc.fontSize(10).fillColor(textColor).font('Helvetica').text(value, 60 + tableWidth * 0.5, rowTop, { width: tableWidth * 0.5 });
      if (!isLast) {
        doc.moveTo(50, rowTop + 20).lineTo(50 + tableWidth, rowTop + 20).stroke();
      }
      doc.moveDown(1);
    };
    
    // Add rows to the table
    doc.moveDown(0.5);
    addTableRow('Table', tableName);
    addTableRow('Date', new Date(reservation.reservationDate).toLocaleDateString());
    addTableRow('Time', `${reservation.time} - ${reservation.endTime}`);
    addTableRow('Number of Guests', reservation.guests.toString());
    
    doc.moveDown(0.5);
    drawDivider();
    
    // Payment Details
    addSectionTitle('PAYMENT DETAILS:');
    
    // Create payment summary table
    const paymentTop = doc.y;
    
    // Helper function to add payment rows
    const addPaymentRow = (label, value, isBold = false, isTotal = false) => {
      const rowTop = doc.y;
      if (isTotal) {
        doc.rect(50, rowTop - 5, tableWidth, 25).fill('#f8f9fa');
      }
      doc.fontSize(10)
        .fillColor(isBold || isTotal ? titleColor : textColor)
        .font(isBold || isTotal ? 'Helvetica-Bold' : 'Helvetica')
        .text(label, 60, rowTop, { width: tableWidth * 0.7 });
      
      doc.fontSize(10)
        .fillColor(isBold || isTotal ? titleColor : textColor)
        .font(isBold || isTotal ? 'Helvetica-Bold' : 'Helvetica')
        .text(value, 60 + tableWidth * 0.7, rowTop, { width: tableWidth * 0.3 });
      
      doc.moveDown(0.75);
    };
    
    addPaymentRow('Subtotal', `$${reservation.totalPrice.toFixed(2)}`);
    addPaymentRow('Tax (0%)', '$0.00');
    addPaymentRow('', '', true);
    addPaymentRow('Total Amount:', `$${reservation.totalPrice.toFixed(2)}`, true, true);
    addPaymentRow('Payment Method:', reservation.payment === 'card' ? 'Credit Card' : 'PayPal', false);
    
    doc.moveDown(1);
    drawDivider();
    
    // Terms and conditions
    addSectionTitle('TERMS AND CONDITIONS:');
    addNormalText('1. Please arrive 15 minutes before your reservation time.');
    addNormalText('2. The restaurant reserves the right to cancel reservations if the customer is more than 15 minutes late.');
    addNormalText('3. Cancellations must be made at least 24 hours in advance.');
    
    doc.moveDown(2);
    
    // Footer
    const pageCount = doc.bufferedPageRange().count;
    let y = doc.page.height - 50;
    
    doc.fontSize(10).fillColor(accentColor).font('Helvetica-Bold').text('Thank you for choosing Night Elegance', 50, y, { align: 'center' });
    doc.fontSize(8).fillColor(lightTextColor).font('Helvetica').text('This is a computer-generated invoice and requires no signature', 50, y + 15, { align: 'center' });
    
    // Add page numbers
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor(lightTextColor).text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 20, { align: 'center' });
    }

    // Finalize the PDF
    doc.end();

    // Wait for the write stream to finish
    await new Promise((resolve, reject) => {
      writeStream.on('finish', () => {
        console.log("PDF file created successfully at:", invoicePath);
        resolve();
      });
      writeStream.on('error', (error) => {
        console.error("Error writing PDF file:", error);
        reject(error);
      });
    });

    res.json({
      success: true,
      message: 'Invoice generated successfully'
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice: ' + error.message
    });
  }
};

// Download invoice for a reservation
exports.downloadInvoice = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user._id;

    console.log("Attempting to download invoice for reservation:", reservationId);

    // Find the reservation
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Check if user owns this reservation or is admin
    if (reservation.userId.toString() !== userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this reservation'
      });
    }

    const invoicePath = path.join(__dirname, '../uploads/invoices', `invoice-${reservationId}.pdf`);

    // Check if invoice exists
    if (!fs.existsSync(invoicePath)) {
      console.log("Invoice file not found at path:", invoicePath);
      return res.status(404).json({
        success: false,
        message: 'Invoice not found. Please generate it first.'
      });
    }

    console.log("Invoice file found, sending to client");

    // Set appropriate headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${reservationId}.pdf`);

    // Send the file as a stream
    const fileStream = fs.createReadStream(invoicePath);
    fileStream.pipe(res);

    // Handle stream errors
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      // If headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading invoice'
        });
      }
    });

  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading invoice: ' + error.message
    });
  }
};

// Get user details for a reservation
exports.getReservationUserDetails = async (req, res) => {
  try {
    const reservationId = req.params.id;
    
    console.log("Fetching user details for reservation ID:", reservationId);
    
    // First find the reservation to get the userId
    const reservation = await Reservation.findById(reservationId);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: "Reservation not found"
      });
    }
    
    console.log("Reservation found:", reservation);
    console.log("User ID from reservation:", reservation.userId);
    
    // Now try to find the user directly
    const User = mongoose.model('users');
    const user = await User.findById(reservation.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found for this reservation"
      });
    }
    
    console.log("User found:", user);
    
    res.status(200).json({
      success: true,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching user details"
    });
  }
};