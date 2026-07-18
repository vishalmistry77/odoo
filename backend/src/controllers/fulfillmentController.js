const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Mark order as Picked Up.
 * Stock is already reserved since Confirmation, but this tracks physical movement.
 */
const pickupOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: { invoice: true }
        });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        // CRITICAL: Verify invoice exists and is paid
        if (!order.invoice) {
            return res.status(400).json({ success: false, message: 'No invoice found. Create invoice first.' });
        }

        if (order.invoice.status !== 'PAID') {
            return res.status(400).json({ success: false, message: 'Invoice must be PAID before pickup. Current status: ' + order.invoice.status });
        }

        if (order.status !== 'PAID') {
            return res.status(400).json({ success: false, message: 'Order must be PAID before pickup. Current status: ' + order.status });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status: 'PICKED_UP' }
        });

        res.status(200).json({ success: true, message: 'Order marked as Picked Up. Rental period started.', data: updatedOrder });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Mark order as Returned.
 * Checks for late returns.
 */
const returnOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: true }
        });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.status !== 'PICKED_UP') {
            return res.status(400).json({ success: false, message: 'Order must be PICKED_UP before return.' });
        }

        // Check for late return on any item
        // Simplification: iterate all items, if any is overdue, flag it.
        // In real ERP, we might charge per item.
        const now = new Date();
        let isLate = false;
        let lateMessage = '';

        for (const item of order.items) {
            if (item.endDate && new Date(item.endDate) < now) {
                isLate = true;
                break;
            }
        }

        if (isLate) {
            lateMessage = ' (Return was late. Late fee logic placeholder.)';
            // TODO: Implement Late Fee Invoice creation here
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status: 'RETURNED' } // Could define logic to complete it or move to verification
        });

        res.status(200).json({ success: true, message: `Order marked as Returned${lateMessage}`, data: updatedOrder });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    pickupOrder,
    returnOrder
};
