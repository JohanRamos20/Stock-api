import { Router } from "express";
import { authMiddleware } from "@infrastructure/http/middlewares/auth.middleware";
import { makeUserController } from "@infrastructure/factories/user.factory";

const userRoutes = Router();
const userController = makeUserController();

userRoutes.post("/", userController.create);
userRoutes.get("/", userController.list);
userRoutes.get("/me", authMiddleware, userController.getById);
userRoutes.patch("/password", userController.updatePassword);
userRoutes.post("/login", userController.login);

export { userRoutes };
