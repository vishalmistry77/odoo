const prisma = require('../config/db');
const { Prisma } = require('@prisma/client');

/**
 * List products with optional filters. All data from DB.
 */
async function listProducts(filters = {}) {
    const { brand, color, durationType, minPrice, maxPrice } = filters;
    const where = {};

    if (brand && String(brand).trim()) {
        where.brand = { equals: String(brand).trim(), mode: 'insensitive' };
    }
    if (filters.vendorId) {
        where.vendorId = filters.vendorId;
    }
    if (color && String(color).trim()) {
        where.color = { equals: String(color).trim(), mode: 'insensitive' };
    }
    if (durationType && String(durationType).trim()) {
        const dur = String(durationType).trim().toUpperCase();
        if (['HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR'].includes(dur)) {
            where.durationType = dur;
        }
    }
    if (minPrice != null && minPrice !== '') {
        const num = parseFloat(minPrice);
        if (!isNaN(num)) where.price = { ...where.price, gte: Prisma.Decimal(num) };
    }
    if (maxPrice != null && maxPrice !== '') {
        const num = parseFloat(maxPrice);
        if (!isNaN(num)) {
            where.price = where.price && typeof where.price === 'object'
                ? { ...where.price, lte: Prisma.Decimal(num) }
                : { lte: Prisma.Decimal(num) };
        }
    }

    const products = await prisma.product.findMany({
        where,
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
    });

    return products.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        color: p.color,
        description: p.description,
        price: Number(p.price),
        durationType: p.durationType,
        stock: p.stock,
        quantityOnHand: p.quantityOnHand, // Added for frontend consistency
        imageUrl: p.imageUrl,
        isPublished: p.isPublished, // Added to fix 'always unpublished' issue
        createdAt: p.createdAt,
        variants: p.variants.map((v) => ({ id: v.id, optionName: v.optionName, optionValue: v.optionValue })),
    }));
}

/**
 * Get product by id with variants. Returns null if not found.
 */
async function getProductById(id) {
    if (!id) return null;
    const product = await prisma.product.findUnique({
        where: { id },
        include: { variants: true },
    });
    if (!product) return null;
    return {
        id: product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        color: product.color,
        description: product.description,
        price: Number(product.price),
        durationType: product.durationType,
        stock: product.stock,
        imageUrl: product.imageUrl,
        createdAt: product.createdAt,
        variants: product.variants.map((v) => ({ id: v.id, optionName: v.optionName, optionValue: v.optionValue })),
    };
}

const checkAvailability = async (productId, startDate, endDate) => {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('Product not found');

    // Find all confirmed orders (SALES_ORDER, CONFIRMED, PAID, PICKED_UP)
    // that overlap with the requested period.
    // Overlap: (RequestedStart <= ExistingEnd) AND (RequestedEnd >= ExistingStart)
    const overlappingItems = await prisma.orderItem.findMany({
        where: {
            productId,
            order: {
                status: {
                    in: ['SALES_ORDER', 'CONFIRMED', 'PAID', 'PICKED_UP']
                }
            },
            AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(startDate) } }
            ]
        }
    });

    const reservedQuantity = overlappingItems.reduce((sum, item) => sum + item.quantity, 0);
    const availableQuantity = Math.max(0, product.stock - reservedQuantity);

    return {
        available: availableQuantity,  // Return quantity, not boolean
        totalStock: product.stock,
        reserved: reservedQuantity
    };
};

const createProduct = async (data) => {
    // Handle variants if passed (not fully implemented in frontend yet but good for backend)
    // data.attributes is passing as JSON

    // Map frontend priceUnit to DurationType enum
    let durationType = 'DAY';
    if (data.priceUnit) {
        const unit = data.priceUnit.toLowerCase();
        if (unit.includes('hour')) durationType = 'HOUR';
        else if (unit.includes('day')) durationType = 'DAY';
        else if (unit.includes('week')) durationType = 'WEEK';
        else if (unit.includes('month')) durationType = 'MONTH';
        else if (unit.includes('year')) durationType = 'YEAR';
    }

    const product = await prisma.product.create({
        data: {
            name: data.name,
            category: data.category,
            brand: data.brand || 'Generic',
            color: data.color || 'Generic',
            description: data.description,
            price: data.price,
            costPrice: data.costPrice,
            productType: data.productType,
            stock: data.stock || data.quantityOnHand,
            quantityOnHand: data.quantityOnHand,
            durationType: durationType,
            imageUrl: data.imageUrl,
            vendorId: data.vendorId,
            isPublished: data.isPublished,
            attributes: data.attributes ? data.attributes : undefined
        }
    });
    return product;
};

const updateProduct = async (id, data) => {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error('Product not found');

    // Map frontend priceUnit to DurationType enum
    let durationType = product.durationType; // Keep existing if not provided
    if (data.priceUnit) {
        const unit = data.priceUnit.toLowerCase();
        if (unit.includes('hour')) durationType = 'HOUR';
        else if (unit.includes('day')) durationType = 'DAY';
        else if (unit.includes('week')) durationType = 'WEEK';
        else if (unit.includes('month')) durationType = 'MONTH';
        else if (unit.includes('year')) durationType = 'YEAR';
    }

    const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
            name: data.name,
            category: data.category,
            brand: data.brand,
            color: data.color,
            description: data.description,
            price: data.price,
            costPrice: data.costPrice,
            productType: data.productType,
            stock: data.stock || data.quantityOnHand,
            quantityOnHand: data.quantityOnHand,
            durationType: durationType,
            imageUrl: data.imageUrl,
            isPublished: data.isPublished,
            attributes: data.attributes ? data.attributes : undefined
        }
    });
    return updatedProduct;
};

module.exports = {
    listProducts,
    getProductById,
    checkAvailability,
    createProduct,
    updateProduct
};
