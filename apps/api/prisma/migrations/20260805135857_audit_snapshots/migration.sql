-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "previousSnapshot" JSONB,
ADD COLUMN     "snapshot" JSONB;
