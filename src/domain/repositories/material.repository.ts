import { Material, MaterialCategory, UnitType } from "../entities/material.entity";

export interface CreateMaterialData {
  name: string;
  category: MaterialCategory;
  location: string;
  amount: number;
  unitType: UnitType;
}

export interface UpdateMaterialData {
  name?: string;
  category?: MaterialCategory;
  location?: string;
  amount?: number;
  unitType?: UnitType;
}

export interface IMaterialRepository {
  create(data: CreateMaterialData): Promise<Material>;
  findById(id: string): Promise<Material | null>;
  findByIds(ids: string[]): Promise<Material[]>;
  update(id: string, data: UpdateMaterialData): Promise<Material>;
  delete(id: string): Promise<void>;
  list(filters?: { onlyInStock?: boolean }): Promise<Material[]>;
  isInUse(id: string): Promise<boolean>;
  decrementAmount(id: string, quantity: number): Promise<Material>;
  incrementAmount(id: string, quantity: number): Promise<Material>;
}
