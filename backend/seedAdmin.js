const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@rentflow.com';
    const password = 'admin123';

    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        console.log('Admin user already exists.');
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                password: hashedPassword
            }
        });
        console.log('Admin role/password updated.');
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                name: 'System Admin',
                email,
                password: hashedPassword,
                role: 'ADMIN',
                companyName: 'RentFlow HQ'
            }
        });
        console.log('Admin user created.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
