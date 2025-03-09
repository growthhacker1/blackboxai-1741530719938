const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const winston = require('winston');

// Initialize database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication token is required'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        winston.error('Token verification failed:', error);
        return res.status(403).json({
            status: 'error',
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Middleware to authorize based on roles
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not authenticated'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Insufficient permissions'
            });
        }

        next();
    };
};

/**
 * Middleware to check branch access
 */
const checkBranchAccess = async (req, res, next) => {
    try {
        const branchId = req.body.branchId || req.params.branchId || req.query.branchId;
        
        if (!branchId) {
            return res.status(400).json({
                status: 'error',
                message: 'Branch ID is required'
            });
        }

        // Skip check for admin role
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user has access to the specified branch
        if (!req.user.branchAccess.includes(branchId)) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. User does not have access to this branch'
            });
        }

        next();
    } catch (error) {
        winston.error('Error checking branch access:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to verify branch access'
        });
    }
};

/**
 * Middleware to check client portal access
 */
const checkClientPortalAccess = async (req, res, next) => {
    try {
        if (!req.user.isClientPortal) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Client portal access required'
            });
        }

        // Check if the requested ledger account matches the user's assigned ledger
        const requestedLedgerId = req.body.ledgerAccountId || req.params.ledgerAccountId || req.query.ledgerAccountId;
        
        if (requestedLedgerId && requestedLedgerId !== req.user.ledgerAccountId) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Invalid ledger account access'
            });
        }

        next();
    } catch (error) {
        winston.error('Error checking client portal access:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to verify client portal access'
        });
    }
};

/**
 * Middleware to check permission
 * @param {string} permission - Required permission
 */
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not authenticated'
            });
        }

        if (!req.user.permissions.includes(permission)) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Required permission not found'
            });
        }

        next();
    };
};

/**
 * Middleware to validate API version
 */
const validateApiVersion = (req, res, next) => {
    const apiVersion = process.env.API_VERSION || 'v1';
    const requestedVersion = req.headers['x-api-version'];

    if (!requestedVersion || requestedVersion !== apiVersion) {
        return res.status(400).json({
            status: 'error',
            message: `Invalid API version. Please use version ${apiVersion}`
        });
    }

    next();
};

/**
 * Middleware to check rate limiting
 */
const checkRateLimit = async (req, res, next) => {
    try {
        const clientIp = req.ip;
        const windowSize = process.env.RATE_LIMIT_WINDOW || '15m';
        const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

        // Convert window size to milliseconds
        const windowMs = windowSize.endsWith('m') 
            ? parseInt(windowSize) * 60 * 1000 
            : parseInt(windowSize) * 1000;

        const result = await pool.query(
            `SELECT COUNT(*) as request_count 
            FROM audit_logs 
            WHERE ip_address = $1 
            AND created_at > NOW() - INTERVAL '${windowSize}'`,
            [clientIp]
        );

        if (result.rows[0].request_count >= maxRequests) {
            return res.status(429).json({
                status: 'error',
                message: 'Too many requests. Please try again later.'
            });
        }

        next();
    } catch (error) {
        winston.error('Error checking rate limit:', error);
        next();
    }
};

module.exports = {
    authenticateToken,
    authorize,
    checkBranchAccess,
    checkClientPortalAccess,
    checkPermission,
    validateApiVersion,
    checkRateLimit
};
