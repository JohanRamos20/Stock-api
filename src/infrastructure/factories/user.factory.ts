import { PrismaUserRepository } from "@database/repositories/prisma-user.repository";
import { BcryptPasswordHasher } from "@infrastructure/services/bcrypt-password-hasher.service";
import { JwtTokenService } from "@infrastructure/services/jwt-token.service";
import { CreateUserUseCase } from "@application/usecases/user/create-user.usecase";
import { GetUserByEmailUseCase } from "@application/usecases/user/get-user-by-email.usecase";
import { GetUserByIdUseCase } from "@application/usecases/user/get-user-by-id.usecase";
import { ListUsersUseCase } from "@application/usecases/user/list-users.usecase";
import { LoginUseCase } from "@application/usecases/user/login.usecase";
import { ChangePasswordUseCase } from "@application/usecases/user/change-password.usecase";
import { ResetPasswordUseCase } from "@application/usecases/user/reset-password.usecase";
import { UserController } from "@infrastructure/http/controllers/user.controller";

export function makeUserController(): UserController {
  const userRepository = new PrismaUserRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService();
  const getUserByEmailUseCase = new GetUserByEmailUseCase(userRepository);

  const createUserUseCase = new CreateUserUseCase(userRepository, passwordHasher);
  const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
  const listUsersUseCase = new ListUsersUseCase(userRepository);
  const changePasswordUseCase = new ChangePasswordUseCase(userRepository, getUserByEmailUseCase, passwordHasher);
  const resetPasswordUseCase = new ResetPasswordUseCase(userRepository, passwordHasher);
  const loginUseCase = new LoginUseCase(userRepository, getUserByEmailUseCase, passwordHasher, tokenService);

  return new UserController(
    createUserUseCase,
    getUserByIdUseCase,
    listUsersUseCase,
    changePasswordUseCase,
    resetPasswordUseCase,
    loginUseCase,
  );
}
