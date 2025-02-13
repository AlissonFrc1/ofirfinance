/*
  Warnings:

  - Added the required column `dueDate` to the `CardExpense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CardExpense" ADD COLUMN     "dueDate" TIMESTAMP(3);

-- Atualiza os registros existentes usando a data da despesa como valor padrão
UPDATE "CardExpense" SET "dueDate" = "date";

-- Altera a coluna para não aceitar valores nulos
ALTER TABLE "CardExpense" ALTER COLUMN "dueDate" SET NOT NULL;
