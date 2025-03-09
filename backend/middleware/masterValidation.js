const { body, param, validationResult } = require('express-validator');

// Helper function to handle validation results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation error',
            errors: errors.array()
        });
    }
    next();
};

// Country Validation
const validateCountry = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Country name is required')
        .isLength({ max: 100 })
        .withMessage('Country name cannot exceed 100 characters'),
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Country code is required')
        .isLength({ max: 10 })
        .withMessage('Country code cannot exceed 10 characters')
        .matches(/^[A-Z]+$/)
        .withMessage('Country code must contain only uppercase letters'),
    handleValidationErrors
];

// Unit Validation
const validateUnit = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Unit name is required')
        .isLength({ max: 50 })
        .withMessage('Unit name cannot exceed 50 characters'),
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Unit code is required')
        .isLength({ max: 10 })
        .withMessage('Unit code cannot exceed 10 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    handleValidationErrors
];

// Branch Validation
const validateBranch = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Branch name is required')
        .isLength({ max: 100 })
        .withMessage('Branch name cannot exceed 100 characters'),
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Branch code is required')
        .isLength({ max: 20 })
        .withMessage('Branch code cannot exceed 20 characters'),
    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Address cannot exceed 500 characters'),
    body('contactPerson')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Contact person name cannot exceed 100 characters'),
    body('phone')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Phone number cannot exceed 20 characters')
        .matches(/^[0-9+\-\s()]*$/)
        .withMessage('Invalid phone number format'),
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .isLength({ max: 100 })
        .withMessage('Email cannot exceed 100 characters'),
    handleValidationErrors
];

// Godown Validation
const validateGodown = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Godown name is required')
        .isLength({ max: 100 })
        .withMessage('Godown name cannot exceed 100 characters'),
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Godown code is required')
        .isLength({ max: 20 })
        .withMessage('Godown code cannot exceed 20 characters'),
    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Address cannot exceed 500 characters'),
    body('capacity')
        .optional()
        .isNumeric()
        .withMessage('Capacity must be a number')
        .isFloat({ min: 0 })
        .withMessage('Capacity cannot be negative'),
    body('branchId')
        .optional()
        .isUUID()
        .withMessage('Invalid branch ID format'),
    handleValidationErrors
];

// Series Setup Validation
const validateSeriesSetup = [
    body('branchId')
        .notEmpty()
        .withMessage('Branch ID is required')
        .isUUID()
        .withMessage('Invalid branch ID format'),
    body('documentType')
        .trim()
        .notEmpty()
        .withMessage('Document type is required')
        .isLength({ max: 50 })
        .withMessage('Document type cannot exceed 50 characters'),
    body('prefix')
        .optional()
        .trim()
        .isLength({ max: 10 })
        .withMessage('Prefix cannot exceed 10 characters')
        .matches(/^[A-Z0-9-]*$/)
        .withMessage('Prefix can only contain uppercase letters, numbers, and hyphens'),
    body('startingNumber')
        .notEmpty()
        .withMessage('Starting number is required')
        .isInt({ min: 1 })
        .withMessage('Starting number must be a positive integer'),
    handleValidationErrors
];

// Parameter Validation
const validateBranchParam = [
    param('branchId')
        .isUUID()
        .withMessage('Invalid branch ID format'),
    handleValidationErrors
];

const validateDocumentNumberParams = [
    param('branchId')
        .isUUID()
        .withMessage('Invalid branch ID format'),
    param('documentType')
        .trim()
        .notEmpty()
        .withMessage('Document type is required')
        .isLength({ max: 50 })
        .withMessage('Document type cannot exceed 50 characters'),
    handleValidationErrors
];

module.exports = {
    validateCountry,
    validateUnit,
    validateBranch,
    validateGodown,
    validateSeriesSetup,
    validateBranchParam,
    validateDocumentNumberParams
};
