const Staff = require('../Models/staff');
const Shift = require('../Models/shift');

exports.addStaff = async (req, res) => {
  try {
    const { name, email, phone, role, department, status } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !role || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const staff = new Staff({
      name,
      email,
      phone,
      role,
      department,
      status: status || 'active'
    });

    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().select('-__v');
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { name, email, phone, role, department, status } = req.body;
    const staffId = req.params.id;

    // Check if staff exists
    const existingStaff = await Staff.findById(staffId);
    if (!existingStaff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // If email is being updated, check if it's already taken
    if (email && email !== existingStaff.email) {
      const emailExists = await Staff.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      staffId,
      { name, email, phone, role, department, status },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedStaff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staffId = req.params.id;

    // Check if staff exists
    const existingStaff = await Staff.findById(staffId);
    if (!existingStaff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Delete all shifts associated with the staff member
    await Shift.deleteMany({ staffId });

    // Delete the staff member
    await Staff.findByIdAndDelete(staffId);
    
    res.status(200).json({ message: 'Staff and associated shifts deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};