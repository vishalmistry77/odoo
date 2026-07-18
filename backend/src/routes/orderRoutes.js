const express = require('express');
const {
    createOrder,
    getOrder,
    getOrders,
    exportOrders,
    sendOrder,
    confirmOrder,
    payOrder,
    createRazorpayOrder,
    createCheckoutRazorpayOrder,
    createCodCheckoutOrder,
    verifyRazorpayPayment,
    pickupOrder,
    returnOrder
} = require('../controllers/orderController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// General routes (all authenticated users)
router.post('/', protect, createOrder); // Create order/quotation
router.post('/razorpay-checkout', protect, createCheckoutRazorpayOrder);
router.post('/cod-checkout', protect, createCodCheckoutOrder);
router.get('/export', protect, exportOrders); // Must be before /:id to avoid conflict
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);

// Order actions
router.post('/:id/send', protect, sendOrder); // Send quotation (vendor)
router.post('/:id/confirm', protect, confirmOrder); // Confirm order (vendor)
router.post('/:id/pay', protect, payOrder); // Pay order (customer)
router.post('/:id/razorpay-order', protect, createRazorpayOrder);
router.post('/:id/razorpay-verify', protect, verifyRazorpayPayment);
router.post('/:id/pickup', protect, pickupOrder); // Mark picked up (vendor)
router.post('/:id/return', protect, returnOrder); // Mark returned (vendor)

module.exports = router;
