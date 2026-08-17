import { Request, RequestStatus } from "@domain/entities/request.entity";
import { MaterialCategory, UnitType } from "@domain/entities/material.entity";

export interface RequestMaterialResponseDto {
  materialId: string;
  name: string;
  category: MaterialCategory;
  unitType: UnitType;
  quantity: number;
}

export interface RequestResponseDto {
  id: string;
  userId: string;
  prazo: Date;
  status: RequestStatus;
  materials: RequestMaterialResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedRequestResponseDto {
  data: RequestResponseDto[];
  total: number;
  page: number;
  totalPages: number;
}

export function toRequestResponseDto(request: Request): RequestResponseDto {
  return {
    id: request.id,
    userId: request.userId,
    prazo: request.prazo,
    status: request.status,
    materials: request.materials.map((material) => ({
      materialId: material.materialId,
      name: material.material.name,
      category: material.material.category,
      unitType: material.material.unitType,
      quantity: material.quantity,
    })),
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
}

export function toPaginatedRequestResponseDto(
  page: { data: Request[]; total: number },
  currentPage: number,
  limit: number,
): PaginatedRequestResponseDto {
  return {
    data: page.data.map(toRequestResponseDto),
    total: page.total,
    page: currentPage,
    totalPages: Math.ceil(page.total / limit),
  };
}
