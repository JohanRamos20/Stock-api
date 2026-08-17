-- AlterEnum
BEGIN;
CREATE TYPE "MaterialCategory_new" AS ENUM ('FERRAMENTA', 'EPI', 'CONSUMIVEL');
ALTER TABLE "materials" ALTER COLUMN "category" TYPE "MaterialCategory_new" USING ("category"::text::"MaterialCategory_new");
ALTER TYPE "MaterialCategory" RENAME TO "MaterialCategory_old";
ALTER TYPE "MaterialCategory_new" RENAME TO "MaterialCategory";
DROP TYPE "public"."MaterialCategory_old";
COMMIT;

