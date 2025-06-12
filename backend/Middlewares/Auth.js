const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    // Check if authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        code: "NO_TOKEN"
      });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
        code: "INVALID_FORMAT"
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user info to request object
    req.user = {
      id: decoded.id || decoded._id,
      _id: decoded.id || decoded._id, // Add _id for compatibility
      email: decoded.email,
      role: decoded.role || 'user',
      name: decoded.name,
      isAdmin: decoded.role === 'admin' || decoded.isAdmin
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token.",
        code: "INVALID_TOKEN"
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token has expired.",
        code: "TOKEN_EXPIRED"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
      code: "SERVER_ERROR"
    });
  }
};

const ensureAdmin = (req, res, next) => {
  try {
    // Check if user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not authenticated.",
        code: "NOT_AUTHENTICATED"
      });
    }

    // Check if user has admin role
    if (req.user.role !== "admin") {
      console.warn(`Access denied for user ${req.user.id}: Not an admin (role: ${req.user.role})`);
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrator privileges required.",
        code: "INSUFFICIENT_PRIVILEGES"
      });
    }

    console.log(`Admin access granted for user ${req.user.id}`);
    next();
  } catch (error) {
    console.error('Admin authorization error:', error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authorization.",
      code: "SERVER_ERROR"
    });
  }
};

// Optional middleware for role-based access
const ensureRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Access denied. User not authenticated.",
          code: "NOT_AUTHENTICATED"
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          code: "INSUFFICIENT_PRIVILEGES"
        });
      }

      next();
    } catch (error) {
      console.error('Role authorization error:', error.message);
      return res.status(500).json({
        success: false,
        message: "Internal server error during authorization.",
        code: "SERVER_ERROR"
      });
    }
  };
};

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  ensureRole,
  auth: ensureAuthenticated  // Alias for compatibility
};
