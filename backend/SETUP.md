# Backend setup

## Database tables (Prisma)

1. **Apply all migrations** (creates User, Coupon, CouponUsage, Product, ProductVariant, Cart, CartItem):

   ```bash
   cd backend
   npx prisma migrate deploy
   ```

   Or, if you prefer to create a new migration from schema changes:

   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. **Seed the database** (creates sample coupons and 5 products: Modern Sofa, Smart TV 55", Gaming Laptop, DSLR Camera, Game Console):

   ```bash
   npx prisma db seed
   ```

3. **Generate Prisma client** (if you get errors about missing models):

   ```bash
   npx prisma generate
   ```

## If you see "No products" on the Dashboard

- Ensure the backend server is running: `npm run dev` (or `node src/app.js`).
- Ensure migrations have been applied: `npx prisma migrate deploy`.
- Ensure the database has been seeded: `npx prisma db seed`.
- Check that `DATABASE_URL` in `.env` points to your PostgreSQL database.

After running migrations and seed, refresh the Dashboard; the 5 products should appear.
