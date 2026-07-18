const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const placeholderImg = (emoji) =>
    `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect fill="%23252b4a" width="300" height="200"/><text x="50%" y="50%" font-size="48" fill="%239ca3af" text-anchor="middle" dy=".3em">${emoji}</text></svg>`
    )}`;

async function main() {
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    try {
        await prisma.coupon.upsert({
            where: { code: 'SAVE10' },
            update: {},
            create: {
                code: 'SAVE10',
                discount: 10,
                isActive: true,
                expiresAt,
                usageLimit: 100,
                usedCount: 0,
            },
        });
        await prisma.coupon.upsert({
            where: { code: 'RENT50' },
            update: {},
            create: {
                code: 'RENT50',
                discount: 50,
                isActive: true,
                expiresAt,
                usageLimit: 50,
                usedCount: 0,
            },
        });
        console.log('Seed: Sample coupons SAVE10 and RENT50 created/updated.');
    } catch (couponErr) {
        console.warn('Coupon seed skipped (run "npx prisma migrate deploy" if Coupon table is missing):', couponErr.message);
    }

    const productData = [
        {
            name: 'Modern Sofa',
            category: 'Furniture',
            brand: 'HomeComfort',
            color: 'Grey',
            description: 'Comfortable 3-seater modern sofa, perfect for living rooms.',
            price: 499,
            durationType: 'MONTH',
            stock: 10,
            imageUrl: placeholderImg('🛋️'),
        },
        {
            name: 'Smart TV 55"',
            category: 'Electronics',
            brand: 'TechView',
            color: 'Black',
            description: '55-inch Smart TV with 4K UHD, streaming apps included.',
            price: 299,
            durationType: 'MONTH',
            stock: 5,
            imageUrl: placeholderImg('📺'),
        },
        {
            name: 'Gaming Laptop',
            category: 'Electronics',
            brand: 'GamePro',
            color: 'Black',
            description: 'High-performance gaming laptop with RTX graphics.',
            price: 599,
            durationType: 'MONTH',
            stock: 3,
            imageUrl: placeholderImg('💻'),
        },
        {
            name: 'DSLR Camera',
            category: 'Electronics',
            brand: 'PhotoMax',
            color: 'Black',
            description: 'Professional DSLR camera with 24MP sensor and kit lens.',
            price: 399,
            durationType: 'WEEK',
            stock: 0,
            imageUrl: placeholderImg('📷'),
        },
        {
            name: 'Game Console',
            category: 'Electronics',
            brand: 'PlayBox',
            color: 'White',
            description: 'Next-gen game console with 1TB storage and controller.',
            price: 349,
            durationType: 'MONTH',
            stock: 8,
            imageUrl: placeholderImg('🎮'),
        },
    ];

    const { hashPassword } = require('../src/utils/auth');

    // Default password for all seed users
    const hashedPassword = await hashPassword('password123');

    // 1. Upsert Admin
    await prisma.user.upsert({
        where: { email: 'admin@rentflow.com' },
        update: {},
        create: {
            name: 'System Admin',
            email: 'admin@rentflow.com',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });

    // 2. Upsert Vendor
    await prisma.user.upsert({
        where: { email: 'vendor@rentflow.com' },
        update: {},
        create: {
            name: 'TechRent Pro',
            email: 'vendor@rentflow.com',
            password: hashedPassword,
            role: 'VENDOR',
            vendorCategory: 'Electronics',
            companyName: 'TechRent Solutions',
            gstin: '29ABCDE1234F1Z5'
        },
    });

    // 3. Upsert Customer
    await prisma.user.upsert({
        where: { email: 'customer@rentflow.com' },
        update: {},
        create: {
            name: 'John Doe',
            email: 'customer@rentflow.com',
            password: hashedPassword,
            role: 'CUSTOMER',
        },
    });

    console.log('Seed: Users admin/vendor/customer @rentflow.com created (pwd: password123)');

    try {
        for (const p of productData) {
            const existing = await prisma.product.findFirst({ where: { name: p.name } });
            let productId;
            if (existing) {
                await prisma.product.update({
                    where: { id: existing.id },
                    data: {
                        category: p.category,
                        brand: p.brand,
                        color: p.color,
                        description: p.description,
                        price: p.price,
                        durationType: p.durationType,
                        stock: Math.max(existing.stock, p.stock), // Ensure stock doesn't go down on seed
                        imageUrl: p.imageUrl,
                    },
                });
                productId = existing.id;
            } else {
                const created = await prisma.product.create({
                    data: {
                        name: p.name,
                        category: p.category,
                        brand: p.brand,
                        color: p.color,
                        description: p.description,
                        price: p.price,
                        durationType: p.durationType,
                        stock: p.stock,
                        imageUrl: p.imageUrl,
                    },
                });
                productId = created.id;
            }
            const variantCount = await prisma.productVariant.count({ where: { productId } });
            if (variantCount === 0 && p.name === 'Modern Sofa') {
                await prisma.productVariant.createMany({
                    data: [
                        { productId, optionName: 'Color', optionValue: 'Grey' },
                        { productId, optionName: 'Color', optionValue: 'Blue' },
                        { productId, optionName: 'Color', optionValue: 'Beige' },
                    ],
                });
            }
            if (variantCount === 0 && p.name === 'Smart TV 55"') {
                await prisma.productVariant.createMany({
                    data: [
                        { productId, optionName: 'Size', optionValue: '55"' },
                        { productId, optionName: 'Size', optionValue: '65"' },
                    ],
                });
            }
        }
        console.log('Seed: 5 products created/updated.');
    } catch (productErr) {
        console.error('Product seed failed:', productErr.message);
        if (productErr.message && productErr.message.includes('does not exist')) {
            console.error('\n→ Run "npx prisma migrate deploy" to create Product/Cart tables, then run "npx prisma db seed" again.');
        }
        throw productErr;
    }
}

main()
    .catch((e) => {
        console.error('Seed failed:', e.message || e);
        console.error('Full error:', e);
        if (e.message && e.message.includes('does not exist')) {
            console.error('\n→ Run "npx prisma migrate deploy" first to create all tables, then run "npx prisma db seed" again.');
        }
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
