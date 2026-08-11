import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { toUserResponseDto, UserResponseDto } from "@application/dtos/user/user-response.dto";

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new BusinessError(`User not found: ${id}`, 404);
    return toUserResponseDto(user);
  }
}
