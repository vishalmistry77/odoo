/*
  Warnings:

  - The values [QUOTATION_SENT,SALES_ORDER,CONFIRMED,COMPLETED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('QUOTATION', 'RENTAL_ORDER', 'PAID', 'PICKED_UP', 'RETURNED', 'CANCELLED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'QUOTATION';
COMMIT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "quotationState" TEXT;
