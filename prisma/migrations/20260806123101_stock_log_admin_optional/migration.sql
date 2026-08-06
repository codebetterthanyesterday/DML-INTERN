-- DropForeignKey
ALTER TABLE "stock_logs" DROP CONSTRAINT "stock_logs_adminId_fkey";

-- AlterTable
ALTER TABLE "stock_logs" ALTER COLUMN "adminId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
