/*
  Warnings:

  - The `billingCycle` column on the `Plan` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE',
DROP COLUMN "billingCycle",
ADD COLUMN     "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY';
