import { Router } from "express";
import { UserRole } from "@domain/entities/user.entity";
import { authMiddleware } from "@infrastructure/http/middlewares/auth.middleware";
import { requireRole } from "@infrastructure/http/middlewares/require-role.middleware";
import { makeUserController } from "@infrastructure/factories/user.factory";

const userRoutes = Router();
const userController = makeUserController();

userRoutes.post("/", authMiddleware, requireRole(UserRole.ADMIN), userController.create);
userRoutes.get("/", authMiddleware, requireRole(UserRole.ADMIN), userController.list);
userRoutes.get("/me", authMiddleware, userController.getById);
userRoutes.post("/password/reset", userController.changePassword);
userRoutes.patch("/:id/password/reset", authMiddleware, requireRole(UserRole.ADMIN), userController.resetPassword);
userRoutes.post("/login", userController.login);

export { userRoutes };
