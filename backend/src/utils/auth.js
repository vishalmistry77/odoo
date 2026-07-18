const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '1d';

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashed) => {
    return await bcrypt.compare(password, hashed);
};

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || typeof secret !== 'string' || secret.trim() === '') {
        throw new Error('JWT_SECRET is not set in environment');
    }
    return secret;
};

const generateToken = (userId, role) => {
    return jwt.sign(
        { userId, role },
        getJwtSecret(),
        { expiresIn: JWT_EXPIRY }
    );
};

const generateResetToken = (userId) => {
    return jwt.sign(
        { userId, type: 'reset' },
        getJwtSecret(),
        { expiresIn: '15m' } // 15 minutes expiry
    );
};

const verifyToken = (token) => {
    return jwt.verify(token, getJwtSecret());
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
    generateResetToken,
    verifyToken,
};
