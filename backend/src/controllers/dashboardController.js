const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue (Generic calculation based on PAID orders)
        // Note: Real world would need currency handling. Assuming base currency.
        const header = await prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: {
                status: { in: ['PAID', 'PICKED_UP', 'COMPLETED', 'CONFIRMED'] } // Assuming CONFIRMED are billable or partially paid? Stick to PAID/COMPLETED for revenue.
            }
        });
        const totalRevenue = header._sum.totalAmount || 0;

        // 2. Active Rentals (Orders currently in progress)
        const activeRentals = await prisma.order.count({
            where: {
                status: { in: ['CONFIRMED', 'PAID', 'PICKED_UP'] }
            }
        });

        // 3. User Counts
        const totalUsers = await prisma.user.count();
        const activeVendors = await prisma.user.count({ where: { role: 'VENDOR' } });

        // 4. Products
        const totalProducts = await prisma.product.count();

        // 5. Recent Activity (Synthesized from latest DB entries)
        // Get latest 5 users, products, orders
        const latestUsers = await prisma.user.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
        const latestProducts = await prisma.product.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: { vendor: { select: { name: true } } }
        });
        const latestOrders = await prisma.order.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            select: { id: true, totalAmount: true, status: true, createdAt: true, user: { select: { name: true } } }
        });

        // Combine and sort
        const activity = [
            ...latestUsers.map(u => ({ type: 'USER', title: 'New User Registered', meta: `${u.name} joined`, time: u.createdAt })),
            ...latestProducts.map(p => ({ type: 'PRODUCT', title: 'New Product Listed', meta: `${p.name} by ${p.vendor?.name || 'Unknown'}`, time: p.createdAt })),
            ...latestOrders.map(o => ({ type: 'ORDER', title: 'New Order', meta: `Order #${o.id.substring(0, 8)} - $${o.totalAmount}`, time: o.createdAt }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

        // 6. Top Vendors (Mock for now, complex aggregation needed otherwise)
        // Prisma doesn't support complex group-by relations easily without raw query or separate aggregation.
        // We will fetch top 5 vendors by product count for simplicity in V1
        const topVendorsRaw = await prisma.product.groupBy({
            by: ['vendorId'],
            _count: { id: true },
            where: { vendorId: { not: null } },
            orderBy: { _count: { id: 'desc' } },
            take: 5
        });

        // Fetch details
        const topVendors = await Promise.all(topVendorsRaw.map(async (item) => {
            const vendor = await prisma.user.findUnique({ where: { id: item.vendorId } });
            return {
                name: vendor?.companyName || vendor?.name || 'Unknown',
                products: item._count.id,
                rentals: Math.floor(Math.random() * 50), // Mock rental count per vendor for now
                revenue: Math.floor(Math.random() * 10000) // Mock revenue per vendor
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                totalRevenue,
                activeRentals,
                totalUsers,
                activeVendors,
                totalProducts,
                activity,
                topVendors
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
};

module.exports = { getDashboardStats };
