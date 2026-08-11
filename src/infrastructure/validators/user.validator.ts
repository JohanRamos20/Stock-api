import { z } from "zod";
import { UserRole, UserSector } from "@domain/entities/user.entity";

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(120),
  email: z.string().trim().toLowerCase().email(),
  role: z.nativeEnum(UserRole),
  sector: z.nativeEnum(UserSector),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, "password is required"),
});

export type LoginDto = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().min(1, "code is required"),
  newPassword: z.string().min(8, "newPassword must have at least 8 characters"),
});

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
