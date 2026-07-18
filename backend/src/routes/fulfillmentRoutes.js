const express = require('express');
const router = express.Router();
const { protect, requireVendor } = require('../middlewares/authMiddleware');
const { pickupOrder, returnOrder } = require('../controllers/fulfillmentController');

// VENDOR-ONLY ACTIONS
router.put('/:id/pickup', protect, requireVendor, pickupOrder);
router.put('/:id/return', protect, requireVendor, returnOrder);

module.exports = router;
