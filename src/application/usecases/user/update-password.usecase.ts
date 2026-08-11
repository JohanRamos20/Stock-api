import bcrypt from "bcryptjs";
import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { GetUserByEmailUseCase } from "@application/usecases/user/get-user-by-email.usecase";
import { UpdatePasswordDto } from "@infrastructure/validators/user.validator";

const SALT_ROUNDS = 10;

export class UpdatePasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
  ) {}

  async execute(input: UpdatePasswordDto): Promise<void> {
    const user = await this.getUserByEmailUseCase.execute(input.email);

    const isCurrentPasswordValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!isCurrentPasswordValid) throw new BusinessError("Invalid credentials", 401);

    const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await this.userRepository.updatePassword(user.id, hashedPassword);
  }
}
