import { UserRole } from "@domain/entities/user.entity";

declare global {
  namespace Express {
    export interface Request {
      userId?: string;
      userRole?: UserRole;
    }
  }
}
