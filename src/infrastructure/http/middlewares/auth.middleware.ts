import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { BusinessError } from "@domain/errors";
import { UserRole } from "@domain/entities/user.entity";
import { env } from "@main/config/env";

interface AccessTokenPayload {
  id: string;
  role: UserRole;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    next(new BusinessError("Missing or invalid authentication token", 401));
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    req.userId = payload.id;
    req.userRole = payload.role;
    next();
  } catch {
    next(new BusinessError("Missing or invalid authentication token", 401));
  }
}
