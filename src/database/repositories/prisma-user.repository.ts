import { prisma } from "@database/prisma";
import { toDomainUser } from "@database/mappers/user.mapper";
import { User } from "@domain/entities/user.entity";
import { CreateUserData, IUserRepository } from "@domain/repositories/user.repository";

export class PrismaUserRepository implements IUserRepository {
  async create(data: CreateUserData): Promise<User> {
    const created = await prisma.user.create({ data });
    return toDomainUser(created);
  }

  async findById(id: string): Promise<User | null> {
    const found = await prisma.user.findUnique({ where: { id } });
    return found ? toDomainUser(found) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await prisma.user.findUnique({ where: { email } });
    return found ? toDomainUser(found) : null;
  }

  async findBySiapp(siapp: string): Promise<User | null> {
    const found = await prisma.user.findUnique({ where: { siapp } });
    return found ? toDomainUser(found) : null;
  }

  async list(): Promise<User[]> {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc"}, where: { role:"USER" } });
    return users.map(toDomainUser);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { password: hashedPassword } });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  async hasRequests(id: string): Promise<boolean> {
    const count = await prisma.request.count({ where: { userId: id } });
    return count > 0;
  }
}
