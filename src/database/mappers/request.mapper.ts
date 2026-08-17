import { Request, RequestStatus } from "@domain/entities/request.entity";
import { MaterialCategory, UnitType } from "@domain/entities/material.entity";

interface RawRequestMaterial {
  materialId: string;
  quantity: number;
  material: {
    name: string;
    category: string;
    unitType: string;
  };
}

interface RawRequest {
  id: string;
  userId: string;
  prazo: Date;
  status: string;
  materials: RawRequestMaterial[];
  createdAt: Date;
  updatedAt: Date;
}

export function toDomainRequest(raw: RawRequest): Request {
  return Request.create({
    id: raw.id,
    userId: raw.userId,
    prazo: raw.prazo,
    status: raw.status as RequestStatus,
    materials: raw.materials.map((requestMaterial) => ({
      materialId: requestMaterial.materialId,
      quantity: requestMaterial.quantity,
      material: {
        name: requestMaterial.material.name,
        category: requestMaterial.material.category as MaterialCategory,
        unitType: requestMaterial.material.unitType as UnitType,
      },
    })),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}
