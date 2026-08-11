import { PrismaUserRepository } from "@database/repositories/prisma-user.repository";
import { CreateUserUseCase } from "@application/usecases/user/create-user.usecase";
import { GetUserByEmailUseCase } from "@application/usecases/user/get-user-by-email.usecase";
import { GetUserByIdUseCase } from "@application/usecases/user/get-user-by-id.usecase";
import { ListUsersUseCase } from "@application/usecases/user/list-users.usecase";
import { LoginUseCase } from "@application/usecases/user/login.usecase";
import { UpdatePasswordUseCase } from "@application/usecases/user/update-password.usecase";
import { UserController } from "@infrastructure/http/controllers/user.controller";

export function makeUserController(): UserController {
  const userRepository = new PrismaUserRepository();
  const getUserByEmailUseCase = new GetUserByEmailUseCase(userRepository);

  const createUserUseCase = new CreateUserUseCase(userRepository);
  const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
  const listUsersUseCase = new ListUsersUseCase(userRepository);
  const updatePasswordUseCase = new UpdatePasswordUseCase(userRepository, getUserByEmailUseCase);
  const loginUseCase = new LoginUseCase(userRepository, getUserByEmailUseCase);

  return new UserController(
    createUserUseCase,
    getUserByIdUseCase,
    listUsersUseCase,
    updatePasswordUseCase,
    loginUseCase,
  );
}
