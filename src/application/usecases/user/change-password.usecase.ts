import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { IPasswordHasher } from "@domain/services/password-hasher.service";
import { GetUserByEmailUseCase } from "@application/usecases/user/get-user-by-email.usecase";
import { ChangePasswordDto } from "@infrastructure/validators/user.validator";

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: ChangePasswordDto): Promise<void> {
    const user = await this.getUserByEmailUseCase.execute(input.email).catch((error) => {
      if (error instanceof BusinessError) throw new BusinessError("Invalid credentials", 401);
      throw error;
    });

    const isCurrentPasswordValid = await this.passwordHasher.compare(input.currentPassword, user.password);
    if (!isCurrentPasswordValid) throw new BusinessError("Invalid credentials", 401);

    const hashedPassword = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.updatePassword(user.id, hashedPassword);
  }
}
