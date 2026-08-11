import bcrypt from "bcryptjs";
import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { toUserResponseDto, UserResponseDto } from "@application/dtos/user/user-response.dto";
import { CreateUserDto } from "@infrastructure/validators/user.validator";

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = "123456";

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) throw new BusinessError(`User already exists with email: ${input.email}`, 409);

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);

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
