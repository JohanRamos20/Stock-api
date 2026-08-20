import { prisma } from "@database/prisma";
import { toDomainRequest } from "@database/mappers/request.mapper";
import { Request, RequestStatus } from "@domain/entities/request.entity";
import {
  CreateRequestData,
  IRequestRepository,
  PageRequest,
  PageResult,
  UpdateRequestData,
} from "@domain/repositories/request.repository";
import type { PrismaClient, Prisma } from "../../../generated/prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

const materialsInclude = { materials: { include: { material: true } } } as const;

export class PrismaRequestRepository implements IRequestRepository {
  constructor(private readonly db: Db = prisma) {}

  async create(data: CreateRequestData): Promise<Request> {
    const created = await this.db.request.create({
      data: {
        userId: data.userId,
        prazo: data.prazo,
        createdByAdminId: data.createdByAdminId ?? null,
        createdByAdminName: data.createdByAdminName ?? null,
        materials: {
          create: data.materials.map((material) => ({
            materialId: material.materialId,
            quantity: material.quantity,
          })),
        },
      },
      include: materialsInclude,
    });
    return toDomainRequest(created);
  }

  async findById(id: string): Promise<Request | null> {
    const found = await this.db.request.findUnique({ where: { id }, include: materialsInclude });
    return found ? toDomainRequest(found) : null;
  }

  async update(id: string, data: UpdateRequestData): Promise<Request> {
    const updated = await this.db.request.update({
      where: { id },
      data: {
        ...(data.prazo ? { prazo: data.prazo } : {}),
        ...(data.materials
          ? {
              materials: {
                deleteMany: {},
                create: data.materials.map((material) => ({
                  materialId: material.materialId,
                  quantity: material.quantity,
                })),
              },
            }
          : {}),
      },
      include: materialsInclude,
    });
    return toDomainRequest(updated);
  }

  async updateStatus(id: string, status: RequestStatus): Promise<Request> {
    const updated = await this.db.request.update({
      where: { id },
      data: { status },
      include: materialsInclude,
    });
    return toDomainRequest(updated);
  }

  async complete(id: string, adminId: string, adminName: string): Promise<Request> {
    const completed = await this.db.request.update({
      where: { id },
      data: { status: "COMPLETED", adminId, adminName },
      include: materialsInclude,
    });
    return toDomainRequest(completed);
  }

  async findManyByUserId(userId: string, page: PageRequest): Promise<PageResult<Request>> {
    const [data, total] = await prisma.$transaction([
      prisma.request.findMany({
        where: { userId },
        skip: page.skip,
        take: page.take,
        orderBy: { createdAt: "desc" },
        include: materialsInclude,
      }),
      prisma.request.count({ where: { userId } }),
    ]);
    return { data: data.map(toDomainRequest), total };
  }

  async findMany(page: PageRequest): Promise<PageResult<Request>> {
    const [data, total] = await prisma.$transaction([
      prisma.request.findMany({
        skip: page.skip,
        take: page.take,
        orderBy: { createdAt: "desc" },
        include: materialsInclude,
      }),
      prisma.request.count(),
    ]);
    return { data: data.map(toDomainRequest), total };
  }
}
