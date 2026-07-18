const prisma = require('../config/db');

/**
 * Create an invoice for a paid order.
 */
const createInvoice = async (orderId, amount, paymentMethod = 'ONLINE') => {
    // Check if invoice already exists
    const existing = await prisma.invoice.findUnique({ where: { orderId } });
    if (existing) return existing;

    const invoice = await prisma.invoice.create({
        data: {
            orderId,
            amount,
            status: 'PAID',
            paymentDate: new Date(),
            method: paymentMethod
        }
    });

    return invoice;
};

/**
 * Get invoice by ID
 */
const getInvoiceById = async (id) => {
    return await prisma.invoice.findUnique({
        where: { id },
        include: { order: true }
    });
};

/**
 * Get invoice by Order ID
 */
const getInvoiceByOrderId = async (orderId) => {
    return await prisma.invoice.findUnique({
        where: { orderId }
    });
};


module.exports = {
    createInvoice,
    getInvoiceById,
    getInvoiceByOrderId
};
