const express = require('express');
const router = express.Router();
const { protect, requireAdmin } = require('../middlewares/authMiddleware');
const { getPeriods, createPeriod, deletePeriod } = require('../controllers/rentalPeriodController');
const { getAttributes, createAttribute, addAttributeValue } = require('../controllers/attributeController');

// Rental Periods
router.get('/periods', getPeriods); // Public? Maybe needed for vendors too.
router.post('/periods', protect, requireAdmin, createPeriod);
router.delete('/periods/:id', protect, requireAdmin, deletePeriod);

// Attributes
router.get('/attributes', getAttributes);
router.post('/attributes', protect, requireAdmin, createAttribute);
router.post('/attributes/:attributeId/values', protect, requireAdmin, addAttributeValue);

module.exports = router;
