import { NextFunction, Request, Response } from "express";
import { BusinessError } from "@domain/errors";
import { CreateUserUseCase } from "@application/usecases/user/create-user.usecase";
import { GetUserByIdUseCase } from "@application/usecases/user/get-user-by-id.usecase";
import { ListUsersUseCase } from "@application/usecases/user/list-users.usecase";
import { LoginUseCase } from "@application/usecases/user/login.usecase";
import { UpdatePasswordUseCase } from "@application/usecases/user/update-password.usecase";
import { createUserSchema, loginSchema, updatePasswordSchema } from "@infrastructure/validators/user.validator";

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = createUserSchema.parse(req.body);
      const user = await this.createUserUseCase.execute(dto);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) throw new BusinessError("Missing or invalid authentication token", 401);
      const user = await this.getUserByIdUseCase.execute(req.userId);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };

  list = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.listUsersUseCase.execute();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  };

  updatePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = updatePasswordSchema.parse(req.body);
      await this.updatePasswordUseCase.execute(dto);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = loginSchema.parse(req.body);
      const result = await this.loginUseCase.execute(dto);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
