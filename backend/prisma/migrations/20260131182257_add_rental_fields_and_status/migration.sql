/*
  Warnings:

  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('QUOTATION', 'QUOTATION_SENT', 'SALES_ORDER', 'CONFIRMED', 'CANCELLED', 'PAID');

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'QUOTATION';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);
