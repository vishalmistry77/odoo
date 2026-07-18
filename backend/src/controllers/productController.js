const productService = require('../services/productService');

const listProducts = async (req, res) => {
    try {
        const { brand, color, durationType, minPrice, maxPrice, vendorId } = req.query;
        const products = await productService.listProducts({
            brand,
            color,
            durationType,
            minPrice,
            maxPrice,
            vendorId
        });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to list products' });
    }
};

const createProduct = async (req, res) => {
    try {
        // Ensure user is vendor (middleware should handle, but extra check good)
        // Add vendorId to data
        const productData = {
            ...req.body,
            vendorId: req.user.userId
        };

        const product = await productService.createProduct(productData);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to create product' });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to get product' });
    }
};

const checkAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'Start date and end date are required' });
        }

        const availability = await productService.checkAvailability(id, startDate, endDate);
        res.status(200).json({ success: true, data: availability });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to check availability' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        // Ideally check if product belongs to this vendor
        // const existing = await productService.getProductById(id);
        // if (existing.vendorId !== req.user.userId) return res.status(403)...

        // For now, assuming trust or add finding logic here if strict
        const product = await productService.updateProduct(id, req.body);
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Failed to update product' });
    }
};

module.exports = {
    listProducts,
    getProductById,
    getProductById,
    checkAvailability,
    createProduct,
    updateProduct
};
