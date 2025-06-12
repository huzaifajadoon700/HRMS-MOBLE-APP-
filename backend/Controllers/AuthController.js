const bcrypt = require('bcrypt');
const UserModel = require('../Models/User');
const jwt = require('jsonwebtoken');

// Signup Controller
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists. Please login instead.",
                success: false,
                code: "EMAIL_EXISTS"
            });
        }

        // Hash password with higher salt rounds for better security
        const hashedPassword = await bcrypt.hash(password, 12);

        // Role assignment logic - only admins can create other admins
        const assignedRole = req.user?.role === 'admin' && role === 'admin' ? 'admin' : 'user';

        // Create new user
        const userModel = new UserModel({
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword,
            role: assignedRole
        });

        await userModel.save();

        // Generate JWT token for automatic login after signup
        const jwtToken = jwt.sign(
            {
                id: userModel._id,
                email: userModel.email,
                name: userModel.name,
                role: userModel.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        console.log(`New user registered: ${userModel.email} (${userModel.role})`);

        res.status(201).json({
            message: "Account created successfully! Welcome aboard!",
            success: true,
            jwtToken,
            email: userModel.email,
            name: userModel.name,
            phone: userModel.phone || null,
            userId: userModel._id,
            role: userModel.role
        });
    } catch (err) {
        console.error('Signup error:', err.message);
        res.status(500).json({
            message: "Internal server error during signup",
            success: false,
            code: "SERVER_ERROR"
        });
    }
};

// Login Controller
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email (case insensitive)
        const user = await UserModel.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.warn(`Login attempt with non-existent email: ${email}`);
            return res.status(401).json({
                message: "Invalid email or password. Please check your credentials.",
                success: false,
                code: "INVALID_CREDENTIALS"
            });
        }

        // Compare password
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            console.warn(`Failed login attempt for user: ${user.email}`);
            return res.status(401).json({
                message: "Invalid email or password. Please check your credentials.",
                success: false,
                code: "INVALID_CREDENTIALS"
            });
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save();

        console.log(`Successful login: ${user.email} (${user.role})`);

        res.status(200).json({
            message: `Welcome back, ${user.name}!`,
            success: true,
            jwtToken,
            email: user.email,
            name: user.name,
            phone: user.phone || null,
            userId: user._id,
            role: user.role
        });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({
            message: "Internal server error during login",
            success: false,
            code: "SERVER_ERROR"
        });
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
