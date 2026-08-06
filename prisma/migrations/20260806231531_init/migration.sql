-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('ACADEMICS', 'ADMINISTRATIVE');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "MaterialCategory" AS ENUM ('FERRAMENTA', 'EPI', 'ELETRICO', 'HIDRAULICO', 'CONSUMIVEL', 'LIMPEZA');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('UNITY', 'BOX');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "sector" "Sector" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "prazo" TIMESTAMP(3) NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "MaterialCategory" NOT NULL,
    "location" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "unit_type" "UnitType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_materials" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "request_materials_request_id_material_id_key" ON "request_materials"("request_id", "material_id");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_materials" ADD CONSTRAINT "request_materials_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_materials" ADD CONSTRAINT "request_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
