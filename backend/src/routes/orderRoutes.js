const express = require('express');
const {
    createOrder,
    getOrder,
    getOrders,
    exportOrders,
    sendOrder,
    confirmOrder,
    payOrder,
    pickupOrder,
    returnOrder
} = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// General routes (all authenticated users)
router.post('/', protect, createOrder); // Create order/quotation
router.get('/export', protect, exportOrders); // Must be before /:id to avoid conflict
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);

// Order actions
router.post('/:id/send', protect, sendOrder); // Send quotation (vendor)
router.post('/:id/confirm', protect, confirmOrder); // Confirm order (vendor)
router.post('/:id/pay', protect, payOrder); // Pay order (customer)
router.post('/:id/pickup', protect, pickupOrder); // Mark picked up (vendor)
router.post('/:id/return', protect, returnOrder); // Mark returned (vendor)

module.exports = router;

