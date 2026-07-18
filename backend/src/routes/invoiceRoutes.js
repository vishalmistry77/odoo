const express = require('express');
const router = express.Router();
const { protect, requireVendor } = require('../middlewares/authMiddleware');
const { createInvoice, getInvoice, voidInvoice, generateInvoicePDF } = require('../controllers/invoiceController');

// Invoice routes
router.post('/create/:orderId', protect, requireVendor, createInvoice); // Vendor creates invoice
router.get('/:id', protect, getInvoice); // Anyone can view invoice
router.get('/:id/pdf', protect, generateInvoicePDF); // Generate PDF
router.patch('/:id/void', protect, requireVendor, voidInvoice); // Vendor voids invoice

module.exports = router;
