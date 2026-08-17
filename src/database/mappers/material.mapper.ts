import type { MaterialModel } from "../../../generated/prisma/models";
import { Material, MaterialCategory, UnitType } from "@domain/entities/material.entity";

export function toDomainMaterial(raw: MaterialModel): Material {
  return Material.create({
    id: raw.id,
    name: raw.name,
    category: raw.category as MaterialCategory,
    location: raw.location,
    amount: raw.amount,
    unitType: raw.unitType as UnitType,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}
