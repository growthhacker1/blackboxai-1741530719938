const { body, query, param, validationResult } = require('express-validator');
const { Pool } = require('pg');

// Initialize database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

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

// Custom validation: Check if account group exists
const checkAccountGroupExists = async (groupId) => {
    const result = await pool.query(
        'SELECT id FROM account_groups WHERE id = $1',
        [groupId]
    );
    if (result.rows.length === 0) {
        throw new Error('Account group does not exist');
    }
    return true;
};

// Custom validation: Check if country exists
const checkCountryExists = async (countryId) => {
    if (!countryId) return true; // Optional field
    const result = await pool.query(
        'SELECT id FROM countries WHERE id = $1',
        [countryId]
    );
    if (result.rows.length === 0) {
        throw new Error('Country does not exist');
    }
    return true;
};

// Ledger Account Validation
const validateLedgerAccount = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Ledger name is required')
        .isLength({ max: 100 })
        .withMessage('Ledger name cannot exceed 100 characters'),

    body('code')
        .trim()
        .notEmpty()
        .withMessage('Ledger code is required')
        .isLength({ max: 20 })
        .withMessage('Ledger code cannot exceed 20 characters')
        .custom(async (code, { req }) => {
            const result = await pool.query(
                'SELECT id FROM ledger_accounts WHERE code = $1 AND id != $2',
                [code, req.params.id || null]
            );
            if (result.rows.length > 0) {
                throw new Error('Ledger code already exists');
            }
            return true;
        }),

    body('groupId')
        .notEmpty()
        .withMessage('Account group is required')
        .isUUID()
        .withMessage('Invalid account group ID format')
        .custom(checkAccountGroupExists),

    body('allowSubledger')
        .isBoolean()
        .withMessage('Allow subledger must be a boolean value'),

    body('transactionTypes')
        .isArray()
        .withMessage('Transaction types must be an array')
        .custom((value) => {
            const validTypes = [
                'transaction', 'normal', 'cn_freight', 'cn_thella',
                'cn_commission', 'detail', 'statement', 'advance',
                'balance', 'cnote', 'challan'
            ];
            return value.every(type => validTypes.includes(type));
        })
        .withMessage('Invalid transaction type(s)'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Address cannot exceed 500 characters'),

    body('city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City cannot exceed 100 characters'),

    body('state')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('State cannot exceed 100 characters'),

    body('countryId')
        .optional()
        .isUUID()
        .withMessage('Invalid country ID format')
        .custom(checkCountryExists),

    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9+\-\s()]*$/)
        .withMessage('Invalid phone number format')
        .isLength({ max: 20 })
        .withMessage('Phone number cannot exceed 20 characters'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Invalid email format')
        .isLength({ max: 100 })
        .withMessage('Email cannot exceed 100 characters'),

    body('mobile')
        .optional()
        .trim()
        .matches(/^[0-9+\-\s()]*$/)
        .withMessage('Invalid mobile number format')
        .isLength({ max: 20 })
        .withMessage('Mobile number cannot exceed 20 characters'),

    body('alternateMobile')
        .optional()
        .trim()
        .matches(/^[0-9+\-\s()]*$/)
        .withMessage('Invalid alternate mobile number format')
        .isLength({ max: 20 })
        .withMessage('Alternate mobile number cannot exceed 20 characters'),

    body('panNumber')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('PAN number cannot exceed 50 characters'),

    body('panType')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('PAN type cannot exceed 20 characters'),

    body('creditLimit')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Credit limit must be a positive number'),

    body('creditDays')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Credit days must be a positive integer'),

    body('contactPerson')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Contact person name cannot exceed 100 characters'),

    body('bankName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Bank name cannot exceed 100 characters'),

    body('bankAccountNo')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Bank account number cannot exceed 50 characters'),

    body('openingBalance')
        .optional()
        .isFloat()
        .withMessage('Opening balance must be a number'),

    handleValidationErrors
];

// Ledger Statement Validation
const validateLedgerStatement = [
    param('id')
        .if(param('id').exists())
        .isUUID()
        .withMessage('Invalid ledger account ID format')
        .custom(async (id) => {
            const result = await pool.query(
                'SELECT id FROM ledger_accounts WHERE id = $1',
                [id]
            );
            if (result.rows.length === 0) {
                throw new Error('Ledger account does not exist');
            }
            return true;
        }),

    query('startDate')
        .notEmpty()
        .withMessage('Start date is required')
        .isDate()
        .withMessage('Invalid start date format'),

    query('endDate')
        .notEmpty()
        .withMessage('End date is required')
        .isDate()
        .withMessage('Invalid end date format')
        .custom((endDate, { req }) => {
            const start = new Date(req.query.startDate);
            const end = new Date(endDate);
            if (end < start) {
                throw new Error('End date must be after start date');
            }
            return true;
        }),

    handleValidationErrors
];

module.exports = {
    validateLedgerAccount,
    validateLedgerStatement
};
