import { Router } from "express";
import { UserRole } from "@domain/entities/user.entity";
import { authMiddleware } from "@infrastructure/http/middlewares/auth.middleware";
import { requireRole } from "@infrastructure/http/middlewares/require-role.middleware";
import { makeRequestController } from "@infrastructure/factories/request.factory";

const requestRoutes = Router();
const requestController = makeRequestController();

requestRoutes.post("/", authMiddleware, requestController.create);
requestRoutes.get("/me", authMiddleware, requestController.listMine);
requestRoutes.get("/all", authMiddleware, requireRole(UserRole.ADMIN), requestController.listAll);
requestRoutes.get("/:id", authMiddleware, requestController.getById);
requestRoutes.patch("/:id", authMiddleware, requestController.edit);
requestRoutes.delete("/:id", authMiddleware, requestController.cancel);
requestRoutes.patch(
  "/:id/complete",
  authMiddleware,
  requireRole(UserRole.ADMIN),
  requestController.complete,
);

export { requestRoutes };
