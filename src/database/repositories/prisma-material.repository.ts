import { prisma } from "@database/prisma";
import { toDomainMaterial } from "@database/mappers/material.mapper";
import { BusinessError } from "@domain/errors";
import { Material } from "@domain/entities/material.entity";
import { CreateMaterialData, IMaterialRepository, UpdateMaterialData } from "@domain/repositories/material.repository";
import type { PrismaClient, Prisma } from "../../../generated/prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

export class PrismaMaterialRepository implements IMaterialRepository {
  constructor(private readonly db: Db = prisma) {}

  async create(data: CreateMaterialData): Promise<Material> {
    const created = await this.db.material.create({ data });
    return toDomainMaterial(created);
  }

  async findById(id: string): Promise<Material | null> {
    const found = await this.db.material.findUnique({ where: { id } });
    return found ? toDomainMaterial(found) : null;
  }

  async findByIds(ids: string[]): Promise<Material[]> {
    const materials = await this.db.material.findMany({ where: { id: { in: ids } } });
    return materials.map(toDomainMaterial);
  }

  async update(id: string, data: UpdateMaterialData): Promise<Material> {
    const updated = await this.db.material.update({ where: { id }, data });
    return toDomainMaterial(updated);
  }

  async delete(id: string): Promise<void> {
    await this.db.material.delete({ where: { id } });
  }

  async list(filters?: { onlyInStock?: boolean }): Promise<Material[]> {
    const materials = await this.db.material.findMany({
      where: filters?.onlyInStock ? { amount: { gt: 0 } } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return materials.map(toDomainMaterial);
  }

  async isInUse(id: string): Promise<boolean> {
    const count = await this.db.requestMaterial.count({ where: { materialId: id } });
    return count > 0;
  }

  async decrementAmount(id: string, quantity: number): Promise<Material> {
    const result = await this.db.material.updateMany({
      where: { id, amount: { gte: quantity } },
      data: { amount: { decrement: quantity } },
    });

    if (result.count === 0) {
      const current = await this.db.material.findUnique({ where: { id } });
      throw new BusinessError(
        `Insufficient stock for material ${id}: requested ${quantity}, available ${current?.amount ?? 0}`,
        409,
      );
    }

    const updated = await this.db.material.findUniqueOrThrow({ where: { id } });
    return toDomainMaterial(updated);
  }

  async incrementAmount(id: string, quantity: number): Promise<Material> {
    const updated = await this.db.material.update({
      where: { id },
      data: { amount: { increment: quantity } },
    });
    return toDomainMaterial(updated);
  }
}
