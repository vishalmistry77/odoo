const express = require('express');
const router = express.Router();
const { listProducts, getProductById, checkAvailability, createProduct, updateProduct } = require('../controllers/productController');
const { protect, requireVendor } = require('../middlewares/authMiddleware');

router.get('/', listProducts);
router.post('/', protect, requireVendor, createProduct);
router.put('/:id', protect, requireVendor, updateProduct);
router.get('/:id', getProductById);
router.get('/:id/availability', checkAvailability); // New route

module.exports = router;
