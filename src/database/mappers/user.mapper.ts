import type { UserModel } from "../../../generated/prisma/models";
import { User, UserRole, UserSector } from "@domain/entities/user.entity";

export function toDomainUser(raw: UserModel): User {
  return User.create({
    id: raw.id,
    name: raw.name,
    email: raw.email,
    password: raw.password,
    role: raw.role as UserRole,
    sector: raw.sector as UserSector,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });
}
