const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Clearing existing data...');

    // Clear all data in correct order (respecting foreign keys)
    // Wrap in try-catch to handle missing tables gracefully
    try { await prisma.orderItem.deleteMany(); console.log('  ✓ Cleared order items'); } catch (e) { console.log('  ⚠ Skip order items'); }
    try { await prisma.order.deleteMany(); console.log('  ✓ Cleared orders'); } catch (e) { console.log('  ⚠ Skip orders'); }
    try { await prisma.invoice.deleteMany(); console.log('  ✓ Cleared invoices'); } catch (e) { console.log('  ⚠ Skip invoices'); }
    try { await prisma.cartItem.deleteMany(); console.log('  ✓ Cleared cart items'); } catch (e) { console.log('  ⚠ Skip cart items'); }
    try { await prisma.cart.deleteMany(); console.log('  ✓ Cleared carts'); } catch (e) { console.log('  ⚠ Skip carts'); }
    try { await prisma.productVariant.deleteMany(); console.log('  ✓ Cleared variants'); } catch (e) { console.log('  ⚠ Skip variants'); }
    try { await prisma.product.deleteMany(); console.log('  ✓ Cleared products'); } catch (e) { console.log('  ⚠ Skip products'); }
    try { await prisma.user.deleteMany(); console.log('  ✓ Cleared users'); } catch (e) { console.log('  ⚠ Skip users'); }

    console.log('✅ Existing data cleared');

    console.log('👥 Creating users...');

    // Create Admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@rentflow.com',
            password: await bcrypt.hash('admin123', 10),
            name: 'Admin User',
            role: 'ADMIN'
        }
    });

    // Create Vendors
    const vendor1 = await prisma.user.create({
        data: {
            email: 'vendor1@rentflow.com',
            password: await bcrypt.hash('vendor123', 10),
            name: 'TechRentals Pro',
            role: 'VENDOR'
        }
    });

    const vendor2 = await prisma.user.create({
        data: {
            email: 'vendor2@rentflow.com',
            password: await bcrypt.hash('vendor123', 10),
            name: 'Gaming Gear Hub',
            role: 'VENDOR'
        }
    });

    const vendor3 = await prisma.user.create({
        data: {
            email: 'vendor3@rentflow.com',
            password: await bcrypt.hash('vendor123', 10),
            name: 'Camera & Photo Rentals',
            role: 'VENDOR'
        }
    });

    // Create Customers
    const customer1 = await prisma.user.create({
        data: {
            email: 'customer@rentflow.com',
            password: await bcrypt.hash('customer123', 10),
            name: 'John Doe',
            role: 'CUSTOMER'
        }
    });

    const customer2 = await prisma.user.create({
        data: {
            email: 'customer2@rentflow.com',
            password: await bcrypt.hash('customer123', 10),
            name: 'Jane Smith',
            role: 'CUSTOMER'
        }
    });

    console.log('✅ Users created');

    console.log('📦 Creating 100 products...');

    const vendors = [vendor1, vendor2, vendor3];

    const products = [
        // Cameras & Photography (20 products)
        { name: 'Sony A7S III Mirrorless Camera', category: 'Cameras', brand: 'Sony', price: 2500, durationType: 'DAY', stock: 5, description: 'Professional full-frame mirrorless camera with 4K video' },
        { name: 'Canon EOS R5 Camera Body', category: 'Cameras', brand: 'Canon', price: 3000, durationType: 'DAY', stock: 4, description: '45MP full-frame mirrorless with 8K video' },
        { name: 'Nikon Z9 Professional Camera', category: 'Cameras', brand: 'Nikon', price: 3500, durationType: 'DAY', stock: 3, description: 'Flagship mirrorless camera with 8K video' },
        { name: 'Sony FX3 Cinema Camera', category: 'Cameras', brand: 'Sony', price: 2800, durationType: 'DAY', stock: 4, description: 'Compact cinema camera for filmmakers' },
        { name: 'Canon 24-70mm f/2.8 L Lens', category: 'Lenses', brand: 'Canon', price: 150, durationType: 'DAY', stock: 10, description: 'Professional zoom lens' },
        { name: 'Sony 70-200mm f/2.8 GM Lens', category: 'Lenses', brand: 'Sony', price: 180, durationType: 'DAY', stock: 8, description: 'Telephoto zoom lens' },
        { name: 'Sigma 35mm f/1.4 Art Lens', category: 'Lenses', brand: 'Sigma', price: 100, durationType: 'DAY', stock: 12, description: 'Wide-angle prime lens' },
        { name: 'DJI Ronin 4D Cinema Camera', category: 'Cameras', brand: 'DJI', price: 4000, durationType: 'DAY', stock: 2, description: 'All-in-one cinema camera system' },
        { name: 'RED Komodo 6K Cinema Camera', category: 'Cameras', brand: 'RED', price: 5000, durationType: 'DAY', stock: 2, description: 'Compact 6K cinema camera' },
        { name: 'Blackmagic Pocket 6K Pro', category: 'Cameras', brand: 'Blackmagic', price: 1800, durationType: 'DAY', stock: 5, description: 'Portable cinema camera' },
        { name: 'GoPro Hero 12 Black', category: 'Action Cameras', brand: 'GoPro', price: 80, durationType: 'DAY', stock: 15, description: 'Waterproof action camera' },
        { name: 'DJI Osmo Action 4', category: 'Action Cameras', brand: 'DJI', price: 75, durationType: 'DAY', stock: 12, description: '4K action camera with stabilization' },
        { name: 'Insta360 X3 360° Camera', category: 'Action Cameras', brand: 'Insta360', price: 90, durationType: 'DAY', stock: 8, description: '360-degree action camera' },
        { name: 'Canon EF 50mm f/1.2 L Lens', category: 'Lenses', brand: 'Canon', price: 120, durationType: 'DAY', stock: 10, description: 'Professional portrait lens' },
        { name: 'Nikon 14-24mm f/2.8 Lens', category: 'Lenses', brand: 'Nikon', price: 140, durationType: 'DAY', stock: 7, description: 'Ultra-wide zoom lens' },
        { name: 'Sony 85mm f/1.4 GM Lens', category: 'Lenses', brand: 'Sony', price: 130, durationType: 'DAY', stock: 9, description: 'Portrait prime lens' },
        { name: 'Tamron 28-75mm f/2.8 Lens', category: 'Lenses', brand: 'Tamron', price: 90, durationType: 'DAY', stock: 11, description: 'Versatile zoom lens' },
        { name: 'Fujifilm X-T5 Camera', category: 'Cameras', brand: 'Fujifilm', price: 1500, durationType: 'DAY', stock: 6, description: 'APS-C mirrorless camera' },
        { name: 'Leica Q2 Full-Frame Camera', category: 'Cameras', brand: 'Leica', price: 3500, durationType: 'DAY', stock: 2, description: 'Premium compact camera' },
        { name: 'Hasselblad X2D 100C Medium Format', category: 'Cameras', brand: 'Hasselblad', price: 6000, durationType: 'DAY', stock: 1, description: 'Medium format mirrorless' },

        // Lighting Equipment (15 products)
        { name: 'Aputure 600D Pro LED Light', category: 'Lighting', brand: 'Aputure', price: 200, durationType: 'DAY', stock: 8, description: 'Professional LED light' },
        { name: 'Godox SL-60W LED Light', category: 'Lighting', brand: 'Godox', price: 80, durationType: 'DAY', stock: 15, description: 'Compact LED video light' },
        { name: 'Arri SkyPanel S60-C LED', category: 'Lighting', brand: 'Arri', price: 500, durationType: 'DAY', stock: 4, description: 'Professional RGB LED panel' },
        { name: 'Nanlite Forza 500 LED Light', category: 'Lighting', brand: 'Nanlite', price: 180, durationType: 'DAY', stock: 10, description: 'Powerful LED spotlight' },
        { name: 'Aputure MC RGB LED Light', category: 'Lighting', brand: 'Aputure', price: 40, durationType: 'DAY', stock: 20, description: 'Portable RGB light' },
        { name: 'Godox VL300 LED Light', category: 'Lighting', brand: 'Godox', price: 150, durationType: 'DAY', stock: 12, description: 'Studio LED light' },
        { name: 'Profoto B10 Plus Flash', category: 'Lighting', brand: 'Profoto', price: 250, durationType: 'DAY', stock: 6, description: 'Portable studio flash' },
        { name: 'Godox AD600 Pro Flash', category: 'Lighting', brand: 'Godox', price: 180, durationType: 'DAY', stock: 8, description: 'Outdoor flash system' },
        { name: 'Aputure Light Dome II Softbox', category: 'Lighting', brand: 'Aputure', price: 60, durationType: 'DAY', stock: 15, description: 'Parabolic softbox' },
        { name: 'Neewer Ring Light 18-inch', category: 'Lighting', brand: 'Neewer', price: 30, durationType: 'DAY', stock: 25, description: 'LED ring light for portraits' },
        { name: 'Elgato Key Light Air', category: 'Lighting', brand: 'Elgato', price: 70, durationType: 'DAY', stock: 18, description: 'Streaming key light' },
        { name: 'Lume Cube Panel Pro', category: 'Lighting', brand: 'Lume Cube', price: 90, durationType: 'DAY', stock: 12, description: 'Bi-color LED panel' },
        { name: 'Godox TL60 Tube Light', category: 'Lighting', brand: 'Godox', price: 100, durationType: 'DAY', stock: 10, description: 'RGB tube light' },
        { name: 'Aputure Nova P300c LED Panel', category: 'Lighting', brand: 'Aputure', price: 350, durationType: 'DAY', stock: 5, description: 'Flexible LED panel' },
        { name: 'Westcott Flex Cine LED Mat', category: 'Lighting', brand: 'Westcott', price: 200, durationType: 'DAY', stock: 7, description: 'Flexible LED mat' },

        // Audio Equipment (15 products)
        { name: 'Sennheiser MKH 416 Shotgun Mic', category: 'Audio', brand: 'Sennheiser', price: 120, durationType: 'DAY', stock: 10, description: 'Professional shotgun microphone' },
        { name: 'Rode NTG5 Shotgun Microphone', category: 'Audio', brand: 'Rode', price: 100, durationType: 'DAY', stock: 12, description: 'Lightweight shotgun mic' },
        { name: 'Shure SM7B Vocal Microphone', category: 'Audio', brand: 'Shure', price: 80, durationType: 'DAY', stock: 15, description: 'Studio vocal microphone' },
        { name: 'Rode Wireless GO II Mic System', category: 'Audio', brand: 'Rode', price: 90, durationType: 'DAY', stock: 14, description: 'Dual wireless mic system' },
        { name: 'Sennheiser EW 112P G4 Wireless', category: 'Audio', brand: 'Sennheiser', price: 150, durationType: 'DAY', stock: 8, description: 'Professional wireless system' },
        { name: 'Zoom H6 Audio Recorder', category: 'Audio', brand: 'Zoom', price: 70, durationType: 'DAY', stock: 10, description: '6-track portable recorder' },
        { name: 'Sound Devices MixPre-6 II', category: 'Audio', brand: 'Sound Devices', price: 180, durationType: 'DAY', stock: 6, description: 'Professional audio recorder' },
        { name: 'Rode VideoMic Pro Plus', category: 'Audio', brand: 'Rode', price: 60, durationType: 'DAY', stock: 18, description: 'On-camera microphone' },
        { name: 'Audio-Technica AT2020 Mic', category: 'Audio', brand: 'Audio-Technica', price: 40, durationType: 'DAY', stock: 20, description: 'Condenser microphone' },
        { name: 'Shure SM58 Dynamic Mic', category: 'Audio', brand: 'Shure', price: 35, durationType: 'DAY', stock: 25, description: 'Live vocal microphone' },
        { name: 'Rode Podcaster USB Microphone', category: 'Audio', brand: 'Rode', price: 50, durationType: 'DAY', stock: 15, description: 'USB broadcast microphone' },
        { name: 'Blue Yeti USB Microphone', category: 'Audio', brand: 'Blue', price: 45, durationType: 'DAY', stock: 20, description: 'USB condenser mic' },
        { name: 'Tascam DR-40X Audio Recorder', category: 'Audio', brand: 'Tascam', price: 55, durationType: 'DAY', stock: 12, description: 'Portable audio recorder' },
        { name: 'Deity V-Mic D3 Pro Shotgun', category: 'Audio', brand: 'Deity', price: 75, durationType: 'DAY', stock: 10, description: 'Location sound microphone' },
        { name: 'Rode Lavalier GO Mic', category: 'Audio', brand: 'Rode', price: 30, durationType: 'DAY', stock: 25, description: 'Clip-on lavalier mic' },

        // Gaming Equipment (15 products)
        { name: 'PlayStation 5 Console', category: 'Gaming', brand: 'Sony', price: 150, durationType: 'DAY', stock: 10, description: 'Next-gen gaming console' },
        { name: 'Xbox Series X Console', category: 'Gaming', brand: 'Microsoft', price: 140, durationType: 'DAY', stock: 12, description: 'Powerful gaming console' },
        { name: 'Nintendo Switch OLED', category: 'Gaming', brand: 'Nintendo', price: 80, durationType: 'DAY', stock: 15, description: 'Portable gaming console' },
        { name: 'Meta Quest 3 VR Headset', category: 'Gaming', brand: 'Meta', price: 120, durationType: 'DAY', stock: 8, description: 'Standalone VR headset' },
        { name: 'PlayStation VR2 Headset', category: 'Gaming', brand: 'Sony', price: 130, durationType: 'DAY', stock: 6, description: 'PS5 VR headset' },
        { name: 'Valve Index VR Kit', category: 'Gaming', brand: 'Valve', price: 200, durationType: 'DAY', stock: 4, description: 'Premium PC VR system' },
        { name: 'Logitech G Pro X Superlight Mouse', category: 'Gaming', brand: 'Logitech', price: 25, durationType: 'DAY', stock: 20, description: 'Wireless gaming mouse' },
        { name: 'Razer BlackWidow V4 Keyboard', category: 'Gaming', brand: 'Razer', price: 35, durationType: 'DAY', stock: 18, description: 'Mechanical gaming keyboard' },
        { name: 'SteelSeries Arctis Nova Pro', category: 'Gaming', brand: 'SteelSeries', price: 50, durationType: 'DAY', stock: 15, description: 'Premium gaming headset' },
        { name: 'Elgato Stream Deck XL', category: 'Gaming', brand: 'Elgato', price: 60, durationType: 'DAY', stock: 12, description: 'Streaming control panel' },
        { name: 'Elgato HD60 X Capture Card', category: 'Gaming', brand: 'Elgato', price: 45, durationType: 'DAY', stock: 14, description: '4K capture card' },
        { name: 'Blue Yeti X Streaming Mic', category: 'Gaming', brand: 'Blue', price: 55, durationType: 'DAY', stock: 16, description: 'USB streaming microphone' },
        { name: 'Logitech C922 Pro Webcam', category: 'Gaming', brand: 'Logitech', price: 30, durationType: 'DAY', stock: 20, description: 'HD streaming webcam' },
        { name: 'Razer Kiyo Pro Webcam', category: 'Gaming', brand: 'Razer', price: 40, durationType: 'DAY', stock: 15, description: 'Professional streaming camera' },
        { name: 'ASUS ROG Swift Gaming Monitor 27"', category: 'Gaming', brand: 'ASUS', price: 100, durationType: 'DAY', stock: 8, description: '240Hz gaming monitor' },

        // Drones & Gimbals (10 products)
        { name: 'DJI Mavic 3 Pro Drone', category: 'Drones', brand: 'DJI', price: 300, durationType: 'DAY', stock: 5, description: 'Professional camera drone' },
        { name: 'DJI Air 3 Drone', category: 'Drones', brand: 'DJI', price: 200, durationType: 'DAY', stock: 7, description: 'Compact foldable drone' },
        { name: 'DJI Mini 4 Pro Drone', category: 'Drones', brand: 'DJI', price: 150, durationType: 'DAY', stock: 10, description: 'Ultra-light drone' },
        { name: 'Autel EVO Lite+ Drone', category: 'Drones', brand: 'Autel', price: 180, durationType: 'DAY', stock: 6, description: '6K camera drone' },
        { name: 'DJI RS 3 Pro Gimbal', category: 'Gimbals', brand: 'DJI', price: 120, durationType: 'DAY', stock: 10, description: 'Professional camera gimbal' },
        { name: 'Zhiyun Crane 3S Gimbal', category: 'Gimbals', brand: 'Zhiyun', price: 100, durationType: 'DAY', stock: 12, description: 'Heavy-duty gimbal' },
        { name: 'DJI OM 6 Smartphone Gimbal', category: 'Gimbals', brand: 'DJI', price: 40, durationType: 'DAY', stock: 18, description: 'Phone stabilizer' },
        { name: 'Zhiyun Smooth 5 Phone Gimbal', category: 'Gimbals', brand: 'Zhiyun', price: 35, durationType: 'DAY', stock: 20, description: 'Smartphone gimbal' },
        { name: 'DJI Inspire 3 Cinema Drone', category: 'Drones', brand: 'DJI', price: 800, durationType: 'DAY', stock: 2, description: 'Professional cinema drone' },
        { name: 'Freefly MoVI Pro Gimbal', category: 'Gimbals', brand: 'Freefly', price: 250, durationType: 'DAY', stock: 4, description: 'Cinema camera gimbal' },

        // Computers & Laptops (10 products)
        { name: 'MacBook Pro 16" M3 Max', category: 'Laptops', brand: 'Apple', price: 250, durationType: 'DAY', stock: 6, description: 'Professional laptop' },
        { name: 'Dell XPS 15 Laptop', category: 'Laptops', brand: 'Dell', price: 180, durationType: 'DAY', stock: 8, description: 'Premium Windows laptop' },
        { name: 'Razer Blade 15 Gaming Laptop', category: 'Laptops', brand: 'Razer', price: 200, durationType: 'DAY', stock: 5, description: 'Gaming laptop' },
        { name: 'iPad Pro 12.9" M2', category: 'Tablets', brand: 'Apple', price: 120, durationType: 'DAY', stock: 10, description: 'Professional tablet' },
        { name: 'Microsoft Surface Pro 9', category: 'Tablets', brand: 'Microsoft', price: 100, durationType: 'DAY', stock: 12, description: '2-in-1 tablet PC' },
        { name: 'Samsung Galaxy Tab S9 Ultra', category: 'Tablets', brand: 'Samsung', price: 110, durationType: 'DAY', stock: 8, description: 'Android tablet' },
        { name: 'Apple Mac Studio M2 Ultra', category: 'Desktops', brand: 'Apple', price: 300, durationType: 'DAY', stock: 4, description: 'Desktop workstation' },
        { name: 'Alienware Aurora R15 Gaming PC', category: 'Desktops', brand: 'Dell', price: 280, durationType: 'DAY', stock: 5, description: 'Gaming desktop' },
        { name: 'HP Z8 Workstation', category: 'Desktops', brand: 'HP', price: 350, durationType: 'DAY', stock: 3, description: 'Professional workstation' },
        { name: 'LG UltraFine 5K Display 27"', category: 'Monitors', brand: 'LG', price: 90, durationType: 'DAY', stock: 10, description: '5K monitor' },
    ];

    // Create products with random vendor assignment
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];

        await prisma.product.create({
            data: {
                name: product.name,
                description: product.description,
                category: product.category,
                brand: product.brand,
                color: 'Black', // Default color
                price: product.price,
                durationType: product.durationType,
                stock: product.stock,
                quantityOnHand: product.stock,
                vendorId: randomVendor.id,
                imageUrl: null // You can add image URLs later
            }
        });

        // Progress indicator
        if ((i + 1) % 10 === 0) {
            console.log(`  Created ${i + 1}/${products.length} products...`);
        }
    }

    console.log('✅ 100 products created successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Admin: admin@rentflow.com / admin123`);
    console.log(`  - Vendors: vendor1@rentflow.com, vendor2@rentflow.com, vendor3@rentflow.com / vendor123`);
    console.log(`  - Customers: customer@rentflow.com, customer2@rentflow.com / customer123`);
    console.log(`  - Products: 100 items across multiple categories`);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
