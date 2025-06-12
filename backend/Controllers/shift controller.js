const Shift = require('../Models/shift');
const Staff = require('../Models/staff');

exports.addShift = async (req, res) => {
  try {
    const { staffId, date, startTime, endTime, duration, notes } = req.body;

    // Validate required fields
    if (!staffId || !date || !startTime || !endTime || !duration) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if staff member exists
    const staffMember = await Staff.findById(staffId);
    if (!staffMember) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check for overlapping shifts
    const existingShift = await Shift.findOne({
      staffId,
      date,
      $or: [
        {
          startTime: { $lte: endTime },
          endTime: { $gte: startTime }
        }
      ]
    });

    if (existingShift) {
      return res.status(400).json({ 
        message: 'This staff member already has a shift scheduled for this time period' 
      });
    }

    const shift = new Shift({
      staffId,
      date,
      startTime,
      endTime,
      duration,
      notes,
      status: 'scheduled'
    });

    await shift.save();
    const populatedShift = await Shift.findById(shift._id)
      .populate('staffId', 'name role department');
    
    res.status(201).json(populatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllShifts = async (req, res) => {
  try {
    const { date, staffId, status } = req.query;
    let query = {};

    // Apply filters if provided
    if (date) query.date = new Date(date);
    if (staffId) query.staffId = staffId;
    if (status) query.status = status;

    const shifts = await Shift.find(query)
      .populate('staffId', 'name role department')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateShiftStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const shift = await Shift.findById(id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Update status and notes
    shift.status = status;
    if (notes) shift.notes = notes;

    // Update attended status based on new status
    if (status === 'completed') {
      shift.attended = true;
    } else if (status === 'no-show') {
      shift.attended = false;
    }

    await shift.save();
    const updatedShift = await Shift.findById(id)
      .populate('staffId', 'name role department');

    res.status(200).json(updatedShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    // Only allow deletion of future shifts
    const shiftDate = new Date(shift.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (shiftDate < today) {
      return res.status(400).json({ 
        message: 'Cannot delete past shifts' 
      });
    }

    await Shift.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};