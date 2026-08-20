-- AlterTable
ALTER TABLE "requests" ADD COLUMN     "admin_id" TEXT;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
