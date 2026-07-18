const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getVendorReports = async (req, res) => {
    try {
        const vendorId = req.user.userId;

        // 1. Revenue Overview (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const revenueData = await prisma.order.groupBy({
            by: ['createdAt'],
            where: {
                items: {
                    some: {
                        product: {
                            vendorId: vendorId
                        }
                    }
                },
                status: { in: ['PAID', 'PICKED_UP', 'RETURNED'] },
                createdAt: { gte: sixMonthsAgo }
            },
            _sum: {
                totalAmount: true
            }
        });

        // Group by month
        const monthlyRevenue = {};
        revenueData.forEach(item => {
            const month = new Date(item.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
            if (!monthlyRevenue[month]) {
                monthlyRevenue[month] = 0;
            }
            monthlyRevenue[month] += Number(item._sum.totalAmount || 0);
        });

        // 2. Top Renting Products
        const topProducts = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                product: {
                    vendorId: vendorId
                },
                order: {
                    status: { in: ['PAID', 'PICKED_UP', 'RETURNED'] }
                }
            },
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        });

        // Fetch product details
        const topProductsWithDetails = await Promise.all(
            topProducts.map(async (item) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                    select: { name: true, price: true }
                });
                return {
                    name: product?.name || 'Unknown',
                    rentals: item._count.id,
                    revenue: Number(product?.price || 0) * item._count.id
                };
            })
        );

        // 3. Total Statistics
        const totalRevenue = await prisma.order.aggregate({
            where: {
                items: {
                    some: {
                        product: {
                            vendorId: vendorId
                        }
                    }
                },
                status: { in: ['PAID', 'PICKED_UP', 'RETURNED'] }
            },
            _sum: {
                totalAmount: true
            }
        });

        const totalOrders = await prisma.order.count({
            where: {
                items: {
                    some: {
                        product: {
                            vendorId: vendorId
                        }
                    }
                }
            }
        });

        const activeRentals = await prisma.order.count({
            where: {
                items: {
                    some: {
                        product: {
                            vendorId: vendorId
                        }
                    }
                },
                status: 'PICKED_UP'
            }
        });

        res.status(200).json({
            success: true,
            data: {
                monthlyRevenue,
                topProducts: topProductsWithDetails,
                stats: {
                    totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
                    totalOrders,
                    activeRentals
                }
            }
        });

    } catch (error) {
        console.error("Get Vendor Reports Error:", error);
        res.status(500).json({ success: false, message: 'Failed to fetch reports data' });
    }
};

module.exports = { getVendorReports };
