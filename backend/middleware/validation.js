const Joi = require('joi');
const DateConverter = require('../utils/dateConverter');

/**
 * Validation schema for ledger account
 */
const ledgerAccountSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'Account name must be at least 3 characters long',
            'string.max': 'Account name cannot exceed 100 characters',
            'any.required': 'Account name is required'
        }),

    accountType: Joi.string()
        .valid('asset', 'liability', 'equity', 'income', 'expense')
        .required()
        .messages({
            'any.only': 'Invalid account type',
            'any.required': 'Account type is required'
        }),

    description: Joi.string()
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Description cannot exceed 500 characters'
        }),

    openingBalance: Joi.number()
        .precision(2)
        .optional()
        .default(0)
        .messages({
            'number.base': 'Opening balance must be a number',
            'number.precision': 'Opening balance cannot have more than 2 decimal places'
        })
});

/**
 * Validation schema for transactions
 */
const transactionSchema = Joi.object({
    ledgerAccountId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Ledger account ID must be a number',
            'number.integer': 'Ledger account ID must be an integer',
            'number.positive': 'Ledger account ID must be positive',
            'any.required': 'Ledger account ID is required'
        }),

    type: Joi.string()
        .valid('debit', 'credit')
        .required()
        .messages({
            'any.only': 'Transaction type must be either debit or credit',
            'any.required': 'Transaction type is required'
        }),

    amount: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.positive': 'Amount must be positive',
            'number.precision': 'Amount cannot have more than 2 decimal places',
            'any.required': 'Amount is required'
        }),

    description: Joi.string()
        .max(500)
        .required()
        .messages({
            'string.max': 'Description cannot exceed 500 characters',
            'any.required': 'Description is required'
        }),

    referenceNumber: Joi.string()
        .max(50)
        .optional()
        .messages({
            'string.max': 'Reference number cannot exceed 50 characters'
        }),

    transactionDate: Joi.date()
        .iso()
        .max('now')
        .required()
        .messages({
            'date.base': 'Invalid transaction date',
            'date.format': 'Transaction date must be in ISO format',
            'date.max': 'Transaction date cannot be in the future',
            'any.required': 'Transaction date is required'
        }),

    branchId: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'Branch ID must be a number',
            'number.integer': 'Branch ID must be an integer',
            'number.positive': 'Branch ID must be positive'
        })
});

/**
 * Validation schema for date range queries
 */
const dateRangeSchema = Joi.object({
    startDate: Joi.date()
        .iso()
        .required()
        .messages({
            'date.base': 'Invalid start date',
            'date.format': 'Start date must be in ISO format',
            'any.required': 'Start date is required'
        }),

    endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .required()
        .messages({
            'date.base': 'Invalid end date',
            'date.format': 'End date must be in ISO format',
            'date.min': 'End date must be after start date',
            'any.required': 'End date is required'
        })
});

/**
 * Middleware to validate ledger account creation/update
 */
const validateLedgerAccount = (req, res, next) => {
    const { error } = ledgerAccountSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors
        });
    }
    
    next();
};

/**
 * Middleware to validate transaction creation
 */
const validateTransaction = (req, res, next) => {
    const { error } = transactionSchema.validate(req.body, { abortEarly: false });
    
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors
        });
    }

    // Additional validation for Nepali date
    try {
        const nepaliDate = DateConverter.convertADToBS(req.body.transactionDate);
        if (!DateConverter.isValidBSDate(nepaliDate)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid Nepali date conversion'
            });
        }
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Error converting to Nepali date'
        });
    }
    
    next();
};

/**
 * Middleware to validate date range queries
 */
const validateDateRange = (req, res, next) => {
    const { error } = dateRangeSchema.validate(req.query, { abortEarly: false });
    
    if (error) {
        const errors = error.details.map(detail => detail.message);
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors
        });
    }

    // Additional validation for Nepali date range
    try {
        const startDateNP = DateConverter.convertADToBS(req.query.startDate);
        const endDateNP = DateConverter.convertADToBS(req.query.endDate);
        
        if (!DateConverter.isValidBSDate(startDateNP) || !DateConverter.isValidBSDate(endDateNP)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid Nepali date conversion'
            });
        }
    } catch (error) {
        return res.status(400).json({
            status: 'error',
            message: 'Error converting to Nepali date'
        });
    }
    
    next();
};

module.exports = {
    validateLedgerAccount,
    validateTransaction,
    validateDateRange
};
