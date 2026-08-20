-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "created_by_admin_id" TEXT,
ADD COLUMN     "created_by_admin_name" TEXT;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_created_by_admin_id_fkey" FOREIGN KEY ("created_by_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
