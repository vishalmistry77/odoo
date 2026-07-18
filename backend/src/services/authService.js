const prisma = require('../config/db');
const { hashPassword, comparePassword, generateToken, generateResetToken, verifyToken } = require('../utils/auth');
const couponService = require('./couponService');

const signup = async (userData) => {
    const { name, email, companyName, gstin, password, role, vendorCategory, couponCode } = userData;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) throw new Error('Email is required');
    if (!password || typeof password !== 'string' || password.trim() === '') {
        throw new Error('Password is required');
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
        throw new Error('User already exists with this email');
    }

    const isCustomerWithCoupon = role === 'CUSTOMER' && couponCode && String(couponCode).trim();
    if (isCustomerWithCoupon) {
        await couponService.validateCoupon(couponCode.trim());
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            name: name?.trim() || '',
            email: normalizedEmail,
            companyName,
            gstin,
            password: hashedPassword,
            role: role || 'CUSTOMER',
            vendorCategory: role === 'VENDOR' ? vendorCategory : null,
        },
    });

    let couponApplied = false;
    if (isCustomerWithCoupon) {
        await couponService.applyCoupon(couponCode.trim(), user.id);
        couponApplied = true;
    }

    const token = generateToken(user.id, user.role);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token, couponApplied };
};

const login = async (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) throw new Error('Invalid email or password');
    const user = await prisma.user.findFirst({
        where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = generateToken(user.id, user.role);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};

/**
 * Get user by ID for protected routes. Never returns password.
 */
const getMe = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });
    if (!user) {
        throw new Error('User not found');
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

const forgotPassword = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    
    if (!user) {
        // We do not throw error to avoid enumerating emails
        return null;
    }

    const resetToken = generateResetToken(user.id);
    return { user, resetToken };
};

const resetPassword = async (token, newPassword) => {
    try {
        const decoded = verifyToken(token);
        if (decoded.type !== 'reset') {
            throw new Error('Invalid token type');
        }
        
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user) {
            throw new Error('User not found');
        }

        const hashedPassword = await hashPassword(newPassword);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        });
        
        return true;
    } catch (error) {
        throw new Error('Invalid or expired password reset token');
    }
};

module.exports = {
    signup,
    login,
    getMe,
    forgotPassword,
    resetPassword,
};
