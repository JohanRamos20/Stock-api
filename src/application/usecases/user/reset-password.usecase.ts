import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { IPasswordHasher } from "@domain/services/password-hasher.service";

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new BusinessError(`User not found: ${userId}`, 404);

    const hashedPassword = await this.passwordHasher.hash(user.siapp);
    await this.userRepository.updatePassword(user.id, hashedPassword);
  }
}
