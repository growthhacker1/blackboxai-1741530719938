const express = require('express');
const router = express.Router();
const MasterController = require('../controllers/masterController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateCountry, validateUnit, validateBranch, validateGodown, validateSeriesSetup } = require('../middleware/validation');

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Country Routes
 */
router.post('/countries',
    authorize(['admin']),
    validateCountry,
    MasterController.createCountry
);

router.get('/countries',
    authorize(['admin', 'manager', 'accountant']),
    MasterController.getCountries
);

/**
 * Unit Routes
 */
router.post('/units',
    authorize(['admin']),
    validateUnit,
    MasterController.createUnit
);

router.get('/units',
    authorize(['admin', 'manager', 'accountant']),
    MasterController.getUnits
);

/**
 * Branch Routes
 */
router.post('/branches',
    authorize(['admin']),
    validateBranch,
    MasterController.createBranch
);

router.get('/branches',
    authorize(['admin', 'manager', 'accountant']),
    MasterController.getBranches
);

/**
 * Godown Routes
 */
router.post('/godowns',
    authorize(['admin']),
    validateGodown,
    MasterController.createGodown
);

router.get('/godowns',
    authorize(['admin', 'manager', 'accountant']),
    MasterController.getGodowns
);

/**
 * Series Setup Routes
 */
router.post('/series-setup',
    authorize(['admin']),
    validateSeriesSetup,
    MasterController.createSeriesSetup
);

router.get('/series-setup/:branchId',
    authorize(['admin', 'manager']),
    MasterController.getSeriesSetup
);

/**
 * Document Number Generation
 */
router.get('/next-document-number/:branchId/:documentType',
    authorize(['admin', 'manager', 'accountant']),
    MasterController.getNextDocumentNumber
);

module.exports = router;
