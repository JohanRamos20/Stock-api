import { Material, MaterialCategory, UnitType } from "@domain/entities/material.entity";

export interface MaterialResponseDto {
  id: string;
  name: string;
  category: MaterialCategory;
  location: string;
  amount: number;
  unitType: UnitType;
  createdAt: Date;
  updatedAt: Date;
}

export function toMaterialResponseDto(material: Material): MaterialResponseDto {
  return {
    id: material.id,
    name: material.name,
    category: material.category,
    location: material.location,
    amount: material.amount,
    unitType: material.unitType,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
  };
}
