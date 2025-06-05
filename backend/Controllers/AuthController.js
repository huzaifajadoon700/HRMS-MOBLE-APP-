const bcrypt = require('bcrypt');
const UserModel = require('../models/User');
const jwt = require('jsonwebtoken');

// Signup Controller
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const user = await UserModel.findOne({ email });
        if (user) {
            return res.status(409).json({ msg: "Email already exists, you can login", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const assignedRole = req.user?.role === 'admin' && role === 'admin' ? 'admin' : 'user';
        const userModel = new UserModel({ name, email, password: hashedPassword, role: assignedRole });
        await userModel.save();

        res.status(201).json({ message: "Signup successful", success: true });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(403).json({ msg: "Auth failed, email or password is wrong", success: false });
        }

        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(403).json({ msg: "Auth failed, email or password is wrong", success: false });
        }

        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({
            message: "Login successful",
            success: true,
            jwtToken,
            email: user.email,
            name: user.name,
            phone: user.phone || null,
            userId: user._id,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error", success: false });
    }
};

// Promote User to Admin
const promoteToAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await UserModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.role = 'admin';
        await user.save();

        res.status(200).json({ message: "User promoted to admin successfully" });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    signup,
    login,
    promoteToAdmin
};
