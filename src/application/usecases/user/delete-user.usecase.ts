import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { IPasswordHasher } from "@domain/services/password-hasher.service";

export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(targetUserId: string, adminId: string, adminPassword: string): Promise<void> {
    if (targetUserId === adminId) {
      throw new BusinessError("Admins cannot delete their own account", 403);
    }

    const admin = await this.userRepository.findById(adminId);
    if (!admin) throw new BusinessError("Missing or invalid authentication token", 401);

    const isPasswordValid = await this.passwordHasher.compare(adminPassword, admin.password);
    if (!isPasswordValid) throw new BusinessError("Invalid credentials", 401);

    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) throw new BusinessError(`User not found: ${targetUserId}`, 404);

    const hasRequests = await this.userRepository.hasRequests(targetUserId);
    if (hasRequests) throw new BusinessError("User has associated requests and cannot be deleted", 409);

    await this.userRepository.delete(targetUserId);
  }
}
