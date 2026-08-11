import { User, UserRole, UserSector } from "@domain/entities/user.entity";

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sector: UserSector;
  createdAt: Date;
  updatedAt: Date;
}

export function toUserResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    sector: user.sector,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
