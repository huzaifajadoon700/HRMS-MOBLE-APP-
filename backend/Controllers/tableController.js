const Table = require('../Models/Table');
const Reservation = require('../Models/Reservations');

// Add a new table
const addTable = async (req, res) => {
  try {
    const { tableName, tableType, capacity, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newTable = new Table({
      tableName,
      tableType,
      capacity,
      image,
      status: status || 'Available',
    });

    await newTable.save();

    res.status(201).json({
      message: 'Table added successfully!',
      table: newTable,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all tables
const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find();
    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check table availability for a specific date and time
const checkTableAvailability = async (req, res) => {
  try {
    const { reservationDate, time, endTime, excludeReservationId } = req.query;
    
    if (!reservationDate || !time || !endTime) {
      return res.status(400).json({ error: "Reservation date, start time, and end time are required" });
    }

    // Convert times to minutes for comparison
    const startTimeMinutes = convertTimeToMinutes(time);
    const endTimeMinutes = convertTimeToMinutes(endTime);
    
    if (endTimeMinutes <= startTimeMinutes) {
      return res.status(400).json({ 
        error: "Invalid time range",
        message: "End time must be after start time" 
      });
    }

    // Get all tables
    const tables = await Table.find();
    
    // Check reservations for each table
    const availabilityResults = await Promise.all(
      tables.map(async (table) => {
        // Find existing reservations for this table on the requested date
        let reservationQuery = {
          tableId: table._id,
          reservationDate
        };
        
        // If we're excluding a reservation (for editing purposes), add that to the query
        if (excludeReservationId) {
          reservationQuery._id = { $ne: excludeReservationId };
        }
        
        const existingReservations = await Reservation.find(reservationQuery);
        
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
        
        const isAvailable = !hasOverlap;
        
        return {
          table: {
            _id: table._id,
            tableName: table.tableName,
            capacity: table.capacity,
            status: table.status,
            description: table.description,
            location: table.location,
            image: table.image
          },
          isAvailable,
          status: isAvailable ? 'Available' : 'Reserved',
          reservations: isAvailable ? [] : existingReservations.map(r => ({
            reservationDate: r.reservationDate,
            time: r.time,
            endTime: r.endTime
          }))
        };
      })
    );
    
    res.status(200).json(availabilityResults);
  } catch (error) {
    console.error("Error checking table availability:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to convert time string to minutes for comparison
function convertTimeToMinutes(timeString) {
  try {
    const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
    return hours * 60 + minutes;
  } catch (error) {
    console.error("Error converting time to minutes:", error);
    return 0;
  }
}

// Update a table
const updateTable = async (req, res) => {
  try {
    const { tableName, tableType, capacity, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      {
        tableName,
        tableType,
        capacity,
        image: image || undefined, // Update image only if provided
        status: status || undefined,
      },
      { new: true }
    );

    if (!updatedTable) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.status(200).json(updatedTable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a table
const deleteTable = async (req, res) => {
  try {
    const deletedTable = await Table.findByIdAndDelete(req.params.id);
    if (!deletedTable) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.status(200).json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addTable, getAllTables, updateTable, deleteTable, checkTableAvailability };