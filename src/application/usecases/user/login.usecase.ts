import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { IPasswordHasher } from "@domain/services/password-hasher.service";
import { ITokenService } from "@domain/services/token.service";
import { LoginResponseDto } from "@application/dtos/user/login-response.dto";
import { toUserResponseDto } from "@application/dtos/user/user-response.dto";
import { GetUserByEmailUseCase } from "@application/usecases/user/get-user-by-email.usecase";
import { LoginDto } from "@infrastructure/validators/user.validator";

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginDto): Promise<LoginResponseDto> {
    const user = await this.getUserByEmailUseCase.execute(input.email).catch((error) => {
      if (error instanceof BusinessError) throw new BusinessError("Invalid credentials", 401);
      throw error;
    });

    const isPasswordValid = await this.passwordHasher.compare(input.password, user.password);
    if (!isPasswordValid) throw new BusinessError("Invalid credentials", 401);

    const token = this.tokenService.sign({ id: user.id });

    return { token, user: toUserResponseDto(user) };
  }
}
