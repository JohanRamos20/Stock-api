import { IUserRepository } from "@domain/repositories/user.repository";
import { toUserResponseDto, UserResponseDto } from "@application/dtos/user/user-response.dto";

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.list();
    return users.map(toUserResponseDto);
  }
}
