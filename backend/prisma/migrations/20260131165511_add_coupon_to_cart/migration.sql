-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "couponCode" TEXT,
ADD COLUMN     "discountPercent" INTEGER NOT NULL DEFAULT 0;
