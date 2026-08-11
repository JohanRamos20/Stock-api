import { User } from "@domain/entities/user.entity";
import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";

export class GetUserByEmailUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) throw new BusinessError(`User not found: ${email}`, 404);
    return user;
  }
}
