const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getCart, addToCart, updateCartItem, removeCartItem, applyCoupon } = require('../controllers/cartController');

router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/item/:id', updateCartItem);
router.delete('/item/:id', removeCartItem);
router.post('/apply-coupon', applyCoupon);

module.exports = router;
