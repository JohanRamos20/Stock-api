import { Router } from "express";
import { UserRole } from "@domain/entities/user.entity";
import { authMiddleware } from "@infrastructure/http/middlewares/auth.middleware";
import { requireRole } from "@infrastructure/http/middlewares/require-role.middleware";
import { makeMaterialController } from "@infrastructure/factories/material.factory";

const materialRoutes = Router();
const materialController = makeMaterialController();

materialRoutes.post("/", authMiddleware, requireRole(UserRole.ADMIN), materialController.create);
materialRoutes.get("/", authMiddleware, materialController.getAll);
materialRoutes.patch("/:id", authMiddleware, requireRole(UserRole.ADMIN), materialController.edit);
materialRoutes.delete("/:id", authMiddleware, requireRole(UserRole.ADMIN), materialController.delete);

export { materialRoutes };
