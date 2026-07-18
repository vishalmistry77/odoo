-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VENDOR', 'CUSTOMER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "gstin" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "vendorCategory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
