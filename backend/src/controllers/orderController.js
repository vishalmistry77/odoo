const { PrismaClient } = require('@prisma/client');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const https = require('https');
const cartService = require('../services/cartService');
const prisma = new PrismaClient();

const hasRazorpayTestConfig = () => {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    return keyId.startsWith('rzp_test_') && keySecret && !keyId.includes('replace') && !keySecret.includes('replace');
};

const razorpayRequest = (path, method = 'GET', body) => new Promise((resolve, reject) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!hasRazorpayTestConfig()) return reject(new Error('Razorpay Test Mode keys are not configured correctly.'));

    const payload = body ? JSON.stringify(body) : undefined;
    const request = https.request({
        hostname: 'api.razorpay.com', path, method,
        headers: {
            Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
            ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
        }
    }, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            let parsed;
            try { parsed = JSON.parse(data); } catch { return reject(new Error('Invalid response from Razorpay.')); }
            if (response.statusCode >= 200 && response.statusCode < 300) return resolve(parsed);
            reject(new Error(parsed.error?.description || 'Razorpay request failed.'));
        });
    });
    request.on('error', reject);
    if (payload) request.write(payload);
    request.end();
});

const formatInvoiceEmail = ({ order, invoice }) => {
    const amount = Number(invoice.amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    const items = order.items.map((item) => (
        `<li>${item.product?.name || 'Rental item'} × ${item.quantity}</li>`
    )).join('');

    return {
        subject: `Payment receipt for order ${order.orderNumber}`,
        message: `Your payment of Rs ${amount} for order ${order.orderNumber} was received. Your invoice is paid.`,
        html: `
            <div style="font-family:Arial,sans-serif;color:#1f2937;max-width:600px;margin:auto">
                <h2 style="color:#0f766e">Payment received</h2>
                <p>Hello ${order.user.name},</p>
                <p>We received your payment for rental order <strong>${order.orderNumber}</strong>.</p>
                <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px">
                    <p style="margin:0 0 8px"><strong>Invoice status:</strong> Paid</p>
                    <p style="margin:0"><strong>Amount paid:</strong> Rs ${amount}</p>
                </div>
                <p><strong>Items</strong></p><ul>${items}</ul>
                <p>Your agreed rental price is locked. Please keep this email as your payment receipt.</p>
                <p>Thank you,<br>RentFlow</p>
            </div>`
    };
};

const createOrder = async (req, res) => {
    try {
        let userId = req.user.userId; // Default to logged-in user

        // Allow Vendors/Admins to create orders for other users
        if ((req.user.role === 'VENDOR' || req.user.role === 'ADMIN') && req.body.customerId) {
            userId = req.body.customerId;
        }
        // Extract all new fields
        const { items, total, untaxedAmount, taxAmount, discountAmount, shippingCost, note } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items in order' });
        }

        // Generate a simple Order Number
        const orderNumber = `SO${Date.now().toString().slice(-6)}`;

        // Create Order transaction
        const order = await prisma.$transaction(async (prisma) => {
            // 1. Create the Order
            const newOrder = await prisma.order.create({
                data: {
                    userId,
                    orderNumber,
                    totalAmount: total,
                    untaxedAmount: untaxedAmount || 0,
                    taxAmount: taxAmount || 0,
                    discountAmount: discountAmount || 0,
                    shippingCost: shippingCost || 0,
                    note: note || null,
                    status: 'QUOTATION',
                    items: {
                        create: items.map(item => ({
                            productId: item.productId || item.id,
                            quantity: Number(item.quantity) || 1,
                            price: item.price, // Prisma handles string/number to Decimal
                            startDate: item.startDate ? new Date(item.startDate) : null,
                            endDate: item.endDate ? new Date(item.endDate) : null
                        }))
                    }
                },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });

            console.log('Order created successfully in transaction:', newOrder.id);

            // 2. Clear the User's Cart if it exists (only if userId matches logged in user, optional behavior)
            // For vendor creating for others, we probably shouldn't clear the customer's cart
            if (userId === req.user.userId) {
                await prisma.cart.delete({
                    where: { userId }
                }).catch(() => { });
            }

            return newOrder;
        });

        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        console.error('Request Body:', JSON.stringify(req.body, null, 2));
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message,
            stack: error.stack
        });
    }
};


const { Parser } = require('json2csv');

const getOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        let queryOptions = {
            include: {
                items: { include: { product: true } },
                user: { select: { name: true, email: true } } // Include customer details for vendors
            },
            orderBy: { createdAt: 'desc' }
        };

        // Customers see only their own orders. Vendors/Admins see all.
        if (role !== 'VENDOR' && role !== 'ADMIN') {
            queryOptions.where = { userId };
        }

        const orders = await prisma.order.findMany(queryOptions);
        res.status(200).json({ success: true, count: orders.length, data: orders });
    } catch (error) {
        console.error("Get Orders Error", error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
};

const getOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } } }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Authorization check: ensure order belongs to user
        if (order.userId !== userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error("Get Order Error", error);
        res.status(500).json({ success: false, message: 'Failed to fetch order' });
    }
};

const exportOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                user: true,
                items: {
                    include: { product: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders found to export' });
        }

        // Flatten data for CSV
        const simplifiedOrders = orders.map(order => {
            // Join all items into a string for the CSV cell
            const itemNames = order.items.map(i => `${i.product.name} (x${i.quantity})`).join('; ');
            return {
                OrderNumber: order.orderNumber,
                Date: order.createdAt.toISOString().split('T')[0],
                Customer: order.user ? order.user.name : 'Unknown',
                Items: itemNames,
                TotalAmount: order.totalAmount,
                Status: order.status
            };
        });

        const fields = ['OrderNumber', 'Date', 'Customer', 'Items', 'TotalAmount', 'Status'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(simplifiedOrders);

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', `attachment; filename=orders_export_${Date.now()}.csv`);
        res.status(200).send(csv);

    } catch (error) {
        console.error('Export Error:', error);
        res.status(500).json({ success: false, message: 'Export failed' });
    }
};

const sendOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({ where: { id } });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.status !== 'QUOTATION') {
            return res.status(400).json({ success: false, message: 'Order must be a draft Quotation to send.' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status: 'QUOTATION_SENT' }
        });

        // Mock Email Sending Logic here in future
        console.log(`Sending quotation email to order ${order.orderNumber}`);

        res.status(200).json({ success: true, message: 'Quotation sent successfully', data: updatedOrder });

    } catch (error) {
        console.error('Send Order Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send quotation' });
    }
};

const confirmOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { renterProtectionAccepted } = req.body;

        // 1. Get the order with items
        const order = await prisma.order.findUnique({
            where: { id },
            include: { items: { include: { product: true } } }
        });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.userId !== userId && req.user.role !== 'VENDOR' && req.user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: 'Not authorized to confirm this order' });
        }

        // Only allow confirming Quotations
        if (order.status !== 'QUOTATION' && order.status !== 'QUOTATION_SENT') {
            return res.status(400).json({ success: false, message: 'Only quotations can be confirmed' });
        }

        // A customer must acknowledge the protection terms before a rental is committed.
        // Existing staff workflows are not blocked by this customer-facing acknowledgement.
        if (req.user.role === 'CUSTOMER' && !renterProtectionAccepted) {
            return res.status(400).json({
                success: false,
                message: 'Please accept the rental protection terms before confirming.'
            });
        }

        // 2. Validate Stock for each item
        for (const item of order.items) {
            if (!item.startDate || !item.endDate) continue; // Skip non-rental items if any

            // Check total reserved quantity for this product in the overlapping period
            // Overlap formula: (StartA <= EndB) and (EndA >= StartB)
            const overlappingItems = await prisma.orderItem.findMany({
                where: {
                    productId: item.productId,
                    order: {
                        status: { in: ['SALES_ORDER', 'CONFIRMED', 'PAID'] }, // Only count confirmed bookings
                        id: { not: id } // Exclude current order
                    },
                    AND: [
                        { startDate: { lte: item.endDate } },
                        { endDate: { gte: item.startDate } }
                    ]
                }
            });

            const reservedQuantity = overlappingItems.reduce((sum, i) => sum + i.quantity, 0);

            if (reservedQuantity + item.quantity > item.product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.product.name} is out of stock for the selected dates. Available: ${item.product.stock - reservedQuantity}, Requested: ${item.quantity}`
                });
            }
        }

        // 3. Update Status
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status: 'SALES_ORDER',
                // Freeze the agreed quotation total. Later invoices cannot add charges.
                lockedTotalAmount: order.totalAmount,
                priceLockedAt: new Date(),
                renterAcceptedAt: req.user.role === 'CUSTOMER' ? new Date() : null
            }
        });

        res.status(200).json({ success: true, message: 'Order confirmed successfully', data: updatedOrder });

    } catch (error) {
        console.error('Confirm Order Error:', error);
        res.status(500).json({ success: false, message: 'Failed to confirm order' });
    }
};

const payOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { method } = req.body; // e.g. 'CREDIT_CARD', 'UPI'

        // Mock Payment Processing
        // In real app: verify Stripe/PaymentGateway transaction here.

        const order = await prisma.order.findUnique({
            where: { id },
            include: { invoice: true, user: { select: { name: true, email: true } }, items: { include: { product: true } } }
        });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (order.status !== 'SALES_ORDER' && order.status !== 'CONFIRMED') {
            return res.status(400).json({ success: false, message: 'Only confirmed orders can be paid.' });
        }

        // ERP RULE: Invoice must exist before payment
        if (!order.invoice) {
            return res.status(400).json({
                success: false,
                message: 'No invoice has been generated for this order yet. Please wait for the vendor to invoice the order.'
            });
        }

        if (order.invoice.status === 'PAID') {
            return res.status(400).json({ success: false, message: 'This order is already paid.' });
        }

        // Transaction: Update Order -> Update Invoice
        const result = await prisma.$transaction(async (prisma) => {
            const updatedOrder = await prisma.order.update({
                where: { id },
                data: { status: 'PAID' }
            });

            const updatedInvoice = await prisma.invoice.update({
                where: { id: order.invoice.id },
                data: {
                    status: 'PAID',
                    paymentDate: new Date(),
                    method: method || 'ONLINE'
                }
            });

            return { order: updatedOrder, invoice: updatedInvoice };
        });

        // Payment is never rolled back because an email provider is temporarily unavailable.
        // The receipt is sent only after both the order and invoice are marked paid.
        let receiptEmailSent = false;
        try {
            const email = formatInvoiceEmail({ order, invoice: result.invoice });
            await sendEmail({ email: order.user.email, ...email });
            await prisma.invoice.update({
                where: { id: result.invoice.id },
                data: { receiptSentAt: new Date() }
            });
            receiptEmailSent = true;
        } catch (emailError) {
            console.error(`Invoice receipt email failed for order ${order.orderNumber}:`, emailError.message);
        }

        res.status(200).json({
            success: true,
            message: receiptEmailSent
                ? 'Payment successful. Invoice settled and receipt emailed.'
                : 'Payment successful. Invoice settled. The receipt email could not be sent.',
            data: result.order,
            invoiceId: result.invoice.id,
            receiptEmailSent
        });
    } catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ success: false, message: 'Payment failed' });
    }
};

const createRazorpayOrder = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
            include: { invoice: true }
        });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.userId !== req.user.userId && req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Not authorized to pay this order' });
        if (!order.invoice || order.invoice.status === 'PAID') return res.status(400).json({ success: false, message: 'A payable unpaid invoice is required.' });
        if (order.status !== 'SALES_ORDER' && order.status !== 'CONFIRMED') return res.status(400).json({ success: false, message: 'Only confirmed orders can be paid.' });

        const razorpayOrder = await razorpayRequest('/v1/orders', 'POST', {
            amount: Math.round(Number(order.invoice.amount) * 100),
            currency: 'INR',
            receipt: order.orderNumber.slice(0, 40),
            notes: { rentflowOrderId: order.id }
        });
        res.json({ success: true, key: process.env.RAZORPAY_KEY_ID, order: razorpayOrder });
    } catch (error) {
        console.error('Razorpay order creation error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Could not start Razorpay payment.' });
    }
};

// Direct customer checkout: reserve the cart as an unpaid order, then open Razorpay.
// The order is marked paid only after the signature is verified in verifyRazorpayPayment.
const createCheckoutRazorpayOrder = async (req, res) => {
    try {
        if (!hasRazorpayTestConfig()) {
            return res.status(400).json({ success: false, message: 'Razorpay Test Mode keys are not configured correctly.' });
        }

        const cart = await cartService.getOrCreateCart(req.user.userId);
        if (!cart.items.length) return res.status(400).json({ success: false, message: 'Your cart is empty.' });

        const orderNumber = `SO${Date.now().toString().slice(-6)}`;
        const order = await prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    userId: req.user.userId,
                    orderNumber,
                    totalAmount: cart.total,
                    untaxedAmount: cart.total,
                    discountAmount: cart.discountAmount || 0,
                    status: 'SALES_ORDER',
                    lockedTotalAmount: cart.total,
                    priceLockedAt: new Date(),
                    renterAcceptedAt: new Date(),
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                            startDate: item.startDate ? new Date(item.startDate) : null,
                            endDate: item.endDate ? new Date(item.endDate) : null
                        }))
                    }
                }
            });
            await tx.invoice.create({
                data: { orderId: createdOrder.id, amount: cart.total, status: 'UNPAID', method: 'RAZORPAY_TEST' }
            });
            await tx.cart.delete({ where: { userId: req.user.userId } });
            return createdOrder;
        });

        const razorpayOrder = await razorpayRequest('/v1/orders', 'POST', {
            amount: Math.round(Number(cart.total) * 100),
            currency: 'INR',
            receipt: order.orderNumber.slice(0, 40),
            notes: { rentflowOrderId: order.id }
        });
        res.status(201).json({ success: true, key: process.env.RAZORPAY_KEY_ID, order: razorpayOrder, orderId: order.id });
    } catch (error) {
        console.error('Direct Razorpay checkout error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Could not start checkout.' });
    }
};

const createCodCheckoutOrder = async (req, res) => {
    try {
        const cart = await cartService.getOrCreateCart(req.user.userId);
        if (!cart.items.length) return res.status(400).json({ success: false, message: 'Your cart is empty.' });

        const orderNumber = `SO${Date.now().toString().slice(-6)}`;
        const order = await prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    userId: req.user.userId,
                    orderNumber,
                    totalAmount: cart.total,
                    untaxedAmount: cart.total,
                    discountAmount: cart.discountAmount || 0,
                    status: 'SALES_ORDER',
                    lockedTotalAmount: cart.total,
                    priceLockedAt: new Date(),
                    renterAcceptedAt: new Date(),
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price,
                            startDate: item.startDate ? new Date(item.startDate) : null,
                            endDate: item.endDate ? new Date(item.endDate) : null
                        }))
                    }
                },
                include: { invoice: true }
            });
            await tx.invoice.create({
                data: { orderId: createdOrder.id, amount: cart.total, status: 'UNPAID', method: 'COD' }
            });
            await tx.cart.delete({ where: { userId: req.user.userId } });
            return createdOrder;
        });

        res.status(201).json({
            success: true,
            message: 'COD order placed successfully.',
            orderId: order.id,
            data: order
        });
    } catch (error) {
        console.error('COD checkout error:', error.message);
        res.status(500).json({ success: false, message: error.message || 'Could not place COD order.' });
    }
};

const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) return res.status(400).json({ success: false, message: 'Incomplete Razorpay payment response.' });
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
        if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(razorpay_signature))) return res.status(400).json({ success: false, message: 'Razorpay payment verification failed.' });

        const [order, razorpayOrder] = await Promise.all([
            prisma.order.findUnique({ where: { id: req.params.id }, include: { invoice: true } }),
            razorpayRequest(`/v1/orders/${razorpay_order_id}`)
        ]);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (order.userId !== req.user.userId && req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Not authorized to pay this order' });
        if (!order.invoice || razorpayOrder.notes?.rentflowOrderId !== order.id || razorpayOrder.amount !== Math.round(Number(order.invoice.amount) * 100)) return res.status(400).json({ success: false, message: 'Payment does not match this invoice.' });

        req.body.method = 'RAZORPAY_TEST';
        return payOrder(req, res);
    } catch (error) {
        console.error('Razorpay verification error:', error.message);
        return res.status(500).json({ success: false, message: error.message || 'Could not verify Razorpay payment.' });
    }
};

const pickupOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Transaction: Update status and Decrement Stock
        const updatedOrder = await prisma.$transaction(async (prisma) => {
            const order = await prisma.order.findUnique({
                where: { id },
                include: { items: { include: { product: true } } }
            });

            if (!order) throw new Error('Order not found');
            if (order.status !== 'PAID') throw new Error('Order must be PAID before pickup.');

            // Decrement Stock
            for (const item of order.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { quantityOnHand: { decrement: item.quantity } }
                });
            }

            return await prisma.order.update({
                where: { id },
                data: { status: 'PICKED_UP' }
            });
        });

        res.status(200).json({ success: true, message: 'Order picked up. Stock updated.', data: updatedOrder });
    } catch (error) {
        console.error('Pickup Error:', error);
        res.status(error.message === 'Order not found' ? 404 : 400).json({
            success: false,
            message: error.message || 'Failed to pickup order'
        });
    }
};

const returnOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedOrder = await prisma.$transaction(async (prisma) => {
            const order = await prisma.order.findUnique({
                where: { id },
                include: { items: { include: { product: true } } }
            });

            if (!order) throw new Error('Order not found');
            if (order.status !== 'PICKED_UP') throw new Error('Order must be picked up before return.');

            // Increment Stock
            for (const item of order.items) {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: { quantityOnHand: { increment: item.quantity } }
                });
            }

            // Calculate Late Fee
            let totalLateFee = 0;
            const now = new Date();

            for (const item of order.items) {
                if (item.endDate && now > new Date(item.endDate)) {
                    // Simple logic: Full daily rate per overdue day
                    const endDate = new Date(item.endDate);
                    const diffTime = Math.abs(now - endDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays > 0) {
                        const dailyRate = Number(item.price); // Assuming price is basically daily rate roughly
                        const fee = dailyRate * item.quantity * diffDays;
                        totalLateFee += fee;
                    }
                }
            }

            return await prisma.order.update({
                where: { id },
                data: {
                    status: 'RETURNED',
                    lateFee: totalLateFee
                }
            });
        });

        res.status(200).json({
            success: true,
            message: 'Order returned. Stock restored.',
            data: updatedOrder,
            lateFee: updatedOrder.lateFee
        });
    } catch (error) {
        console.error('Return Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to return order' });
    }
};

module.exports = { createOrder, getOrder, getOrders, exportOrders, sendOrder, confirmOrder, payOrder, createRazorpayOrder, createCheckoutRazorpayOrder, createCodCheckoutOrder, verifyRazorpayPayment, pickupOrder, returnOrder };
