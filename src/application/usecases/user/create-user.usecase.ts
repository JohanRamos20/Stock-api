import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { IPasswordHasher } from "@domain/services/password-hasher.service";
import { toUserResponseDto, UserResponseDto } from "@application/dtos/user/user-response.dto";
import { CreateUserDto } from "@infrastructure/validators/user.validator";

const DEFAULT_PASSWORD = "123456";

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) throw new BusinessError(`User already exists with email: ${input.email}`, 409);

    const hashedPassword = await this.passwordHasher.hash(DEFAULT_PASSWORD);

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      sector: input.sector,
    });

    return toUserResponseDto(user);
  }
}
