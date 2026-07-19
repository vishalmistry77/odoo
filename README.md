#  RentFlow - Rental Management System

A comprehensive full-stack rental management platform built with **Next.js**, **Node.js**, **Express**, and **PostgreSQL**. RentFlow enables vendors to manage rental products, customers to browse and rent items, and admins to oversee the entire platform.

---

##  Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [User Roles](#-user-roles)
- [API Endpoints](#-api-endpoints)
- [Coupon System](#-coupon-system)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)

---

##  Features

###  **Customer Features**
- Browse 100+ rental products across multiple categories
- Advanced search and filtering by category, brand, price
- Add products to cart with rental date selection
- Apply discount coupons dynamically
- Secure checkout and payment processing
- Order tracking and history
- User profile management

###  **Vendor Features**
- Vendor dashboard with analytics
- Product management (add, edit, delete products)
- Order management with status tracking
- Create quotations and invoices
- Revenue reports and top product analytics
- Customer management

###  **Admin Features**
- Platform-wide analytics dashboard
- User management (customers, vendors, admins)
- Product oversight across all vendors
- Order monitoring and management
- Revenue reports by category and vendor
- Coupon management system

###  **Dynamic Coupon System**
- Database-driven coupon validation
- Percentage-based discounts
- Expiry date and usage limit tracking
- Automatic discount calculation
- Coupon usage analytics

---

##  Tech Stack

### **Frontend**
- **React** 18.x - UI library
- **React Router** - Client-side routing
- **Context API** - State management
- **Axios** - HTTP client
- **CSS3** - Styling with CSS variables

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Prisma ORM** - Database toolkit
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### **Database**
- **PostgreSQL** - Primary database
- **Prisma** - ORM and migrations

---

## 📁 Project Structure

```
rentralsystem-odoo/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seedProducts.js        # Product seeding script
│   │   └── seedCoupons.js         # Coupon seeding script
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Prisma client
│   │   ├── controllers/           # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── cartController.js
│   │   │   └── reportsController.js
│   │   ├── middlewares/           # Auth & validation
│   │   │   └── authMiddleware.js
│   │   ├── routes/                # API routes
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   └── cartRoutes.js
│   │   ├── services/              # Business logic
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── orderService.js
│   │   │   ├── cartService.js
│   │   │   └── couponService.js
│   │   ├── app.js                 # Express app
│   │   └── server.js              # Server entry point
│   ├── .env                       # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          # Axios instance
│   │   ├── components/            # Reusable components
│   │   ├── context/               # React contexts
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── SearchContext.jsx
│   │   ├── pages/                 # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── VendorOrders.jsx
│   │   │   ├── VendorReports.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   └── AdminReports.jsx
│   │   ├── App.jsx                # Main app component
│   │   └── index.js               # Entry point
│   └── package.json
│
└── README.md
```

---

##  Installation

### **Prerequisites**
- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/rentralsystem-odoo.git
cd rentralsystem-odoo
```

### **2. Install Backend Dependencies**
```bash
cd backend
npm install
```

### **3. Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

---

## 🗄️ Database Setup

### **1. Create PostgreSQL Database**
```sql
CREATE DATABASE rentflow;
```

### **2. Configure Environment Variables**
Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/rentflow"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=5000
```

### **3. Run Prisma Migrations**
```bash
cd backend
npx prisma db push
```

### **4. Seed the Database**

**Seed Products (100 products):**
```bash
node prisma/seedProducts.js
```

**Seed Coupons:**
```bash
node prisma/seedCoupons.js
```

This will create:
- **1 Admin user**: `admin@rentflow.com` / `admin123`
- **3 Vendor users**: `vendor1@rentflow.com`, `vendor2@rentflow.com`, `vendor3@rentflow.com` / `vendor123`
- **2 Customer users**: `customer@rentflow.com`, `customer2@rentflow.com` / `customer123`
- **100 Products** across 10 categories
- **7 Coupons** (5 active, 2 for testing)

---

##  Running the Application

### **Start Backend Server**
```bash
cd backend
npm start
```
Backend runs on: `http://localhost:5000`

### **Start Frontend Development Server**
```bash
cd frontend
npm start
```
Frontend runs on: `http://localhost:5175`

---

## 👥 User Roles

### **Admin**
- **Email**: `admin@rentflow.com`
- **Password**: `admin123`
- **Access**: Full platform control, analytics, user/product/order management

### **Vendor**
- **Email**: `vendor1@rentflow.com` (or vendor2, vendor3)
- **Password**: `vendor123`
- **Access**: Product management, order processing, vendor analytics

### **Customer**
- **Email**: `customer@rentflow.com`
- **Password**: `customer123`
- **Access**: Browse products, place orders, track rentals

---

## 🔌 API Endpoints

### **Authentication**
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
GET    /api/auth/me                # Get current user
```

### **Products**
```
GET    /api/products               # Get all products
GET    /api/products/:id           # Get product by ID
POST   /api/products               # Create product (Vendor)
PUT    /api/products/:id           # Update product (Vendor)
DELETE /api/products/:id           # Delete product (Vendor)
```

### **Cart**
```
GET    /api/cart                   # Get user cart
POST   /api/cart/add               # Add item to cart
PUT    /api/cart/update/:itemId    # Update cart item
DELETE /api/cart/remove/:itemId    # Remove cart item
POST   /api/cart/apply-coupon      # Apply coupon to cart
```

### **Orders**
```
GET    /api/orders                 # Get user orders
GET    /api/orders/:id             # Get order by ID
POST   /api/orders                 # Create order
POST   /api/orders/:id/confirm     # Confirm order (Vendor)
POST   /api/orders/:id/pay         # Pay for order (Customer)
```

### **Reports**
```
GET    /api/reports/vendor         # Get vendor analytics
```

---

## 🎟️ Coupon System

### **Available Coupons**

| Code | Discount | Expires | Limit | Status |
|------|----------|---------|-------|--------|
| **WELCOME10** | 10% | Dec 2026 | 100 | ✅ Active |
| **SAVE20** | 20% | Dec 2026 | 50 | ✅ Active |
| **RENT50** | 50% | Jun 2026 | 20 | ✅ Active |
| **FIRSTORDER** | 15% | Dec 2026 | 200 | ✅ Active |
| **MEGA30** | 30% | Mar 2026 | 30 | ✅ Active |
| EXPIRED10 | 10% | Dec 2025 | 100 | ❌ Expired |
| INACTIVE25 | 25% | Dec 2026 | 50 | ❌ Inactive |

### **How Coupons Work**
1. User enters coupon code in cart or vendor order
2. Backend validates against database (active, not expired, usage limit)
3. If valid, discount percentage is applied to subtotal
4. Discount is saved to cart/order
5. Usage count is incremented


##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---


**Made with ❤️ for the Odoo x KSV Hackathon**
