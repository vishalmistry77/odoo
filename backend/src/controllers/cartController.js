const cartService = require('../services/cartService');

const getCart = async (req, res) => {
    try {
        const cart = await cartService.getOrCreateCart(req.user.userId);
        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to get cart' });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, quantity, selectedVariants, startDate, endDate } = req.body;
        if (!productId) {
            return res.status(400).json({ success: false, message: 'productId is required' });
        }
        const cart = await cartService.addToCart(req.user.userId, {
            productId,
            quantity: quantity || 1,
            selectedVariants: selectedVariants || {},
            startDate,
            endDate
        });
        res.status(200).json({ success: true, data: cart, message: 'Item added to cart' });
    } catch (error) {
        const status = error.message === 'Product not found' ? 404 : error.message?.includes('stock') ? 400 : 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to add to cart' });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { id: itemId } = req.params;
        const { quantity } = req.body;
        const cart = await cartService.updateItemQuantity(req.user.userId, itemId, quantity);
        res.status(200).json({ success: true, data: cart });
    } catch (error) {
        const status = error.message === 'Cart item not found' ? 404 : 400;
        res.status(status).json({ success: false, message: error.message || 'Failed to update item' });
    }
};

const removeCartItem = async (req, res) => {
    try {
        const { id: itemId } = req.params;
        const cart = await cartService.removeCartItem(req.user.userId, itemId);
        res.status(200).json({ success: true, data: cart, message: 'Item removed' });
    } catch (error) {
        const status = error.message === 'Cart item not found' ? 404 : 500;
        res.status(status).json({ success: false, message: error.message || 'Failed to remove item' });
    }
};

const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code || !String(code).trim()) {
            return res.status(400).json({ success: false, message: 'Coupon code is required' });
        }
        const cart = await cartService.applyCouponToCart(req.user.userId, code);
        res.status(200).json({ success: true, data: cart, message: 'Coupon applied' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message || 'Invalid or expired coupon' });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    applyCoupon,
};
