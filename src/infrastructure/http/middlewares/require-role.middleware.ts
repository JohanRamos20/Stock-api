import { NextFunction, Request, Response } from "express";
import { BusinessError } from "@domain/errors";
import { UserRole } from "@domain/entities/user.entity";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      next(new BusinessError("Forbidden: insufficient permissions", 403));
      return;
    }
    next();
  };
}
