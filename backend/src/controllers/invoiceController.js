const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { method } = req.body; // Optional payment method

        // 1. Get the order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { invoice: true }
        });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.invoice) {
            return res.status(400).json({ success: false, message: 'Invoice already exists for this order', invoiceId: order.invoice.id });
        }

        // 2. Create Invoice
        const invoice = await prisma.invoice.create({
            data: {
                orderId,
                amount: order.totalAmount,
                status: 'UNPAID',
                method: method || 'BANK_TRANSFER'
            }
        });

        res.status(201).json({ success: true, message: 'Invoice created', data: invoice });
    } catch (error) {
        console.error('Create Invoice Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create invoice' });
    }
};

const getInvoice = async (req, res) => {
    try {
        const { id } = req.params; // Can be Invoice ID or Order ID (we should handle both or be specific)

        // Try finding by Invoice ID first
        let invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { order: { include: { user: true, items: { include: { product: true } } } } }
        });

        // If not found, try finding by Order ID (common pattern)
        if (!invoice) {
            invoice = await prisma.invoice.findUnique({
                where: { orderId: id },
                include: { order: { include: { user: true, items: { include: { product: true } } } } }
            });
        }

        if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        console.error('Get Invoice Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
    }
};

const voidInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const invoice = await prisma.invoice.update({
            where: { id },
            data: { status: 'VOID' }
        });
        res.status(200).json({ success: true, message: 'Invoice voided', data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to void invoice' });
    }
};

const generateInvoicePDF = async (req, res) => {
    // Mock PDF generation
    res.status(200).json({ success: true, message: 'PDF generation not implemented yet' });
};

module.exports = {
    createInvoice,
    getInvoice,
    voidInvoice,
    generateInvoicePDF
};
