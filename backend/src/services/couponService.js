const prisma = require('../config/db');

const INVALID_COUPON_MESSAGE = 'Invalid or expired coupon';

/**
 * Validate coupon without applying. Used before creating user so signup fails when coupon is invalid.
 * @param {string} code - Raw coupon code (will be normalized to uppercase)
 * @returns {{ valid: true, coupon: Coupon }} or throws
 */
async function validateCoupon(code) {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode) throw new Error(INVALID_COUPON_MESSAGE);

    const coupon = await prisma.coupon.findUnique({
        where: { code: normalizedCode },
    });
    if (!coupon) throw new Error(INVALID_COUPON_MESSAGE);
    if (!coupon.isActive) throw new Error(INVALID_COUPON_MESSAGE);
    if (new Date() > coupon.expiresAt) throw new Error(INVALID_COUPON_MESSAGE);
    if (coupon.usedCount >= coupon.usageLimit) throw new Error(INVALID_COUPON_MESSAGE);
    return { valid: true, coupon };
}

/**
 * Apply a coupon for a customer (increment usedCount, create CouponUsage). Call after user is created.
 * Assumes validateCoupon was already called successfully.
 * @param {string} code - Raw coupon code (will be normalized to uppercase)
 * @param {string} userId - Newly created customer user id
 * @returns {{ applied: true, discount: number }}
 */
async function applyCoupon(code, userId) {
    const normalizedCode = String(code || '').trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({
        where: { code: normalizedCode },
    });
    if (!coupon) throw new Error(INVALID_COUPON_MESSAGE);

    await prisma.$transaction([
        prisma.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
        }),
        prisma.couponUsage.create({
            data: { couponId: coupon.id, userId },
        }),
    ]);

    return { applied: true, discount: coupon.discount };
}

/**
 * Validate and apply a coupon for a customer. Used during customer signup only.
 * Validates first (so signup can fail before user creation), then applies after user is created.
 */
async function validateAndApplyCoupon(code, userId) {
    await validateCoupon(code);
    return applyCoupon(code, userId);
}

module.exports = {
    validateCoupon,
    applyCoupon,
    validateAndApplyCoupon,
    INVALID_COUPON_MESSAGE,
};
