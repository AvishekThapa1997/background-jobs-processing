-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "failed_reason" TEXT,
ADD COLUMN     "last_processed_on" TIMESTAMP(3);
