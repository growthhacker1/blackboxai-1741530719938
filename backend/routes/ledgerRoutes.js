const express = require('express');
const router = express.Router();
const LedgerController = require('../controllers/ledgerController');
const { authenticateToken, authorize, checkBranchAccess } = require('../middleware/auth');
const { validateLedgerAccount, validateLedgerStatement } = require('../middleware/ledgerValidation');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Ledger Account Routes
 */

// Create new ledger account
router.post('/accounts',
    authorize(['admin', 'manager']),
    validateLedgerAccount,
    LedgerController.createLedgerAccount
);

// Get all ledger accounts
router.get('/accounts',
    authorize(['admin', 'manager', 'accountant']),
    LedgerController.getLedgerAccounts
);

// Get specific ledger account
router.get('/accounts/:id',
    authorize(['admin', 'manager', 'accountant']),
    LedgerController.getLedgerAccount
);

// Update ledger account
router.put('/accounts/:id',
    authorize(['admin', 'manager']),
    validateLedgerAccount,
    LedgerController.updateLedgerAccount
);

/**
 * Ledger Statement Routes
 */

// Get ledger statement
router.get('/accounts/:id/statement',
    authorize(['admin', 'manager', 'accountant']),
    validateLedgerStatement,
    LedgerController.getLedgerStatement
);

/**
 * Client Portal Routes
 */

// Get client's own ledger statement
router.get('/client-portal/statement',
    authorize(['client']),
    validateLedgerStatement,
    (req, res, next) => {
        // Set the ledger ID from the authenticated client's profile
        req.params.id = req.user.ledgerAccountId;
        next();
    },
    LedgerController.getLedgerStatement
);

module.exports = router;
