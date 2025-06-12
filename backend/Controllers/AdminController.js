const User = require('../Models/User');
const bcrypt = require('bcrypt');

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message,
      details: 'Please try again later or contact support if the issue persists'
    });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;
    const adminId = req.user._id;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        details: 'The requested user does not exist in the system'
      });
    }

    // If email is being updated, check if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ 
          message: 'Email already exists',
          details: 'Please choose a different email address'
        });
      }
    }

    // Prevent changing role of the last admin
    if (role && role !== user.role && user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot change role of the last admin user',
          details: 'At least one admin user must remain in the system'
        });
      }
    }

    // Prevent deactivating the last admin
    if (isActive === false && user.role === 'admin') {
      const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot deactivate the last active admin user',
          details: 'At least one active admin user must remain in the system'
        });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();
    const updatedUser = await User.findById(id).select('-password');
    
    // Log the admin action
    console.log(`Admin ${adminId} updated user ${id}: ${JSON.stringify({ name, email, role, isActive })}`);
    
    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      message: 'Error updating user', 
      error: error.message,
      details: 'Please try again later or contact support if the issue persists'
    });
  }
};

// Toggle user status (admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        details: 'The requested user does not exist in the system'
      });
    }

    // Prevent deactivating the last admin
    if (user.role === 'admin' && !user.isActive) {
      const activeAdminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (activeAdminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot deactivate the last active admin user',
          details: 'At least one active admin user must remain in the system'
        });
      }
    }

    // Toggle the status
    user.isActive = !user.isActive;
    await user.save();

    // Log the admin action
    console.log(`Admin ${adminId} toggled user ${id} status to ${user.isActive ? 'active' : 'inactive'}`);
    
    res.status(200).json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ 
      message: 'Error toggling user status', 
      error: error.message,
      details: 'Please try again later or contact support if the issue persists'
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    // Prevent self-deletion
    if (id === adminId.toString()) {
      return res.status(400).json({ 
        message: 'Cannot delete your own account',
        details: 'Please use a different admin account to delete this user'
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        details: 'The requested user does not exist in the system'
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ 
          message: 'Cannot delete the last admin user',
          details: 'At least one admin user must remain in the system'
        });
      }
    }

    await User.findByIdAndDelete(id);
    
    // Log the admin action
    console.log(`Admin ${adminId} deleted user ${id}`);
    
    res.status(200).json({ 
      message: 'User deleted successfully',
      details: 'The user has been permanently removed from the system'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error.message,
      details: 'Please try again later or contact support if the issue persists'
    });
  }
}; 