const { verifyToken } = require('../utils/auth');

/**
 * Auth middleware: read Bearer token from Authorization header,
 * verify JWT, attach decoded payload to req.user.
 * Rejects with 401 if token is missing or invalid.
 */
const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token',
        });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token',
        });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token invalid or expired',
        });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }
        next();
    };
};

/**
 * Middleware to require VENDOR or ADMIN role
 */
const requireVendor = (req, res, next) => {
    if (req.user.role !== 'VENDOR' && req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'This action requires VENDOR or ADMIN role'
        });
    }
    next();
};

/**
 * Middleware to require CUSTOMER role
 */
const requireCustomer = (req, res, next) => {
    if (req.user.role !== 'CUSTOMER') {
        return res.status(403).json({
            success: false,
            message: 'This action is only available to CUSTOMER role'
        });
    }
    next();
};

/**
 * Middleware to require ADMIN role
 */
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            message: 'This action is only available to ADMIN role'
        });
    }
    next();
};

module.exports = { protect, authorize, requireVendor, requireCustomer, requireAdmin };
