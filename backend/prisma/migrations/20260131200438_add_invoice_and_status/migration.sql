-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'PICKED_UP';
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';
ALTER TYPE "OrderStatus" ADD VALUE 'COMPLETED';

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "paymentDate" TIMESTAMP(3),
    "method" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_orderId_key" ON "Invoice"("orderId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
