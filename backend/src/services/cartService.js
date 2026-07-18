const prisma = require('../config/db');
const couponService = require('./couponService');

/**
 * Get or create cart for user. Returns cart with items and product details.
 */
async function getOrCreateCart(userId) {
    let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: { product: true },
            },
        },
    });
    if (!cart) {
        cart = await prisma.cart.create({
            data: { userId },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
    }
    return formatCart(cart);
}

function formatCart(cart) {
    const items = (cart.items || []).map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants || {},
        startDate: item.startDate,
        endDate: item.endDate,
        product: {
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            price: Number(item.product.price),
            durationType: item.product.durationType,
            imageUrl: item.product.imageUrl,
            stock: item.product.stock,
        },
    }));
    const subtotal = items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0);
    const discountPercent = cart.discountPercent || 0;
    const discountAmount = (subtotal * discountPercent) / 100;
    const total = Math.max(0, subtotal - discountAmount);

    return {
        id: cart.id,
        userId: cart.userId,
        items,
        discountPercent,
        discountAmount,
        couponCode: cart.couponCode,
        total,
    };
}

/**
 * Add item to cart. Creates cart if needed. selectedVariants = { optionName: optionValue }.
 */
async function addToCart(userId, { productId, quantity = 1, selectedVariants = {}, startDate, endDate }) {
    const productService = require('./productService'); // Import product service

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');
    if (product.stock < 1) throw new Error('Product is out of stock');
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (startDate && endDate) {
        // Validation: Check if stock is available for these dates
        const availability = await productService.checkAvailability(productId, startDate, endDate);
        if (availability.available < qty) {
            throw new Error(`Only ${availability.available} units available for selected dates`);
        }
    } else {
        // Fallback for non-rental or missing date items (though validation usually enforced in frontend)
        if (qty > product.stock) throw new Error(`Only ${product.stock} available`);
    }

    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
        cart = await prisma.cart.create({ data: { userId } });
    }

    const normalizedVariants = selectedVariants && typeof selectedVariants === 'object' ? selectedVariants : {};

    // Check for existing item with same Product + Variants + Dates
    const existingItems = await prisma.cartItem.findMany({
        where: { cartId: cart.id, productId },
        include: { product: true },
    });

    const existing = existingItems.find((i) => {
        const variantMatch = JSON.stringify(i.selectedVariants || {}) === JSON.stringify(normalizedVariants);
        // Date match check
        const startMatch = (!i.startDate && !startDate) || (i.startDate && startDate && new Date(i.startDate).getTime() === new Date(startDate).getTime());
        const endMatch = (!i.endDate && !endDate) || (i.endDate && endDate && new Date(i.endDate).getTime() === new Date(endDate).getTime());
        return variantMatch && startMatch && endMatch;
    });

    if (existing) {
        const newQty = Math.min(existing.quantity + qty, product.stock);
        await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: newQty },
        });
    } else {
        await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity: qty,
                selectedVariants: normalizedVariants,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            },
        });
    }

    return getOrCreateCart(userId);
}

/**
 * Update cart item quantity. Item id = CartItem id.
 */
async function updateItemQuantity(userId, itemId, quantity) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error('Cart not found');
    const item = await prisma.cartItem.findFirst({
        where: { id: itemId, cartId: cart.id },
        include: { product: true },
    });
    if (!item) throw new Error('Cart item not found');
    const qty = Math.max(0, parseInt(quantity, 10) || 0);
    if (qty === 0) {
        await prisma.cartItem.delete({ where: { id: itemId } });
        return getOrCreateCart(userId);
    }
    if (qty > item.product.stock) throw new Error(`Only ${item.product.stock} available`);
    await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: qty },
    });
    return getOrCreateCart(userId);
}

/**
 * Remove cart item.
 */
async function removeCartItem(userId, itemId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new Error('Cart not found');
    const item = await prisma.cartItem.findFirst({
        where: { id: itemId, cartId: cart.id },
    });
    if (!item) throw new Error('Cart item not found');
    await prisma.cartItem.delete({ where: { id: itemId } });
    return getOrCreateCart(userId);
}

/**
 * Validate coupon and return cart with discount applied (for display only; no CouponUsage created for cart).
 */
async function applyCouponToCart(userId, code) {
    const couponResult = await couponService.validateCoupon(code);
    const discountPercent = couponResult.coupon.discount;
    const cart = await getOrCreateCart(userId);

    // Save to DB
    await prisma.cart.update({
        where: { id: cart.id },
        data: {
            couponCode: couponResult.coupon.code,
            discountPercent: discountPercent
        }
    });

    // Re-fetch formatted
    return getOrCreateCart(userId);
}

module.exports = {
    getOrCreateCart,
    addToCart,
    updateItemQuantity,
    removeCartItem,
    applyCouponToCart,
};
