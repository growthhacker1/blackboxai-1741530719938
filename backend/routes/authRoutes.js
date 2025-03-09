const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateRegistration, validateLogin, validatePasswordChange, validateClientPortalRegistration } = require('../middleware/authValidation');

/**
 * User Authentication Routes
 */

// User Registration (Admin only)
router.post('/register',
    authenticateToken,
    authorize(['admin']),
    validateRegistration,
    AuthController.register
);

// User Login
router.post('/login',
    validateLogin,
    AuthController.login
);

// Change Password (Authenticated users)
router.post('/change-password',
    authenticateToken,
    validatePasswordChange,
    AuthController.changePassword
);

/**
 * Client Portal Routes
 */

// Client Portal User Registration (Admin/Manager only)
router.post('/client-portal/register',
    authenticateToken,
    authorize(['admin', 'manager']),
    validateClientPortalRegistration,
    AuthController.registerClientPortalUser
);

// Client Portal Login
router.post('/client-portal/login',
    validateLogin,
    AuthController.clientPortalLogin
);

module.exports = router;
