import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { IPasswordHasher } from "@domain/services/password-hasher.service";
import { toUserResponseDto, UserResponseDto } from "@application/dtos/user/user-response.dto";
import { CreateUserDto } from "@infrastructure/validators/user.validator";

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) throw new BusinessError(`User already exists with email: ${input.email}`, 409);

    const existingSiapp = await this.userRepository.findBySiapp(input.siapp);
    if (existingSiapp) throw new BusinessError(`User already exists with siapp: ${input.siapp}`, 409);

    const hashedPassword = await this.passwordHasher.hash(input.siapp);

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      siapp: input.siapp,
      password: hashedPassword,
      role: input.role,
      sector: input.sector,
    });

    return toUserResponseDto(user);
  }
}
