import { prisma } from "@database/prisma";
import { PrismaRequestRepository } from "@database/repositories/prisma-request.repository";
import { PrismaMaterialRepository } from "@database/repositories/prisma-material.repository";
import { IUnitOfWork, UnitOfWorkRepositories } from "@domain/services/unit-of-work";

export class PrismaUnitOfWork implements IUnitOfWork {
  async run<T>(work: (repos: UnitOfWorkRepositories) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      const requestRepository = new PrismaRequestRepository(tx);
      const materialRepository = new PrismaMaterialRepository(tx);
      return work({ requestRepository, materialRepository });
    });
  }
}
