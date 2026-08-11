import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { IPasswordHasher } from "@domain/services/password-hasher.service";
import { GetUserByEmailUseCase } from "@application/usecases/user/get-user-by-email.usecase";
import { ResetPasswordDto } from "@infrastructure/validators/user.validator";

// TODO: mocked until the email delivery flow generates and stores a real code per user.
const MOCK_RESET_CODE = "000000";

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: ResetPasswordDto): Promise<void> {
    const user = await this.getUserByEmailUseCase.execute(input.email);

    if (input.code !== MOCK_RESET_CODE) throw new BusinessError("Invalid or expired code", 401);

    const hashedPassword = await this.passwordHasher.hash(input.newPassword);
    await this.userRepository.updatePassword(user.id, hashedPassword);
  }
}
