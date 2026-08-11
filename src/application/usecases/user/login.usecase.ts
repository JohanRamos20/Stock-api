import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { BusinessError } from "@domain/errors";
import { IUserRepository } from "@domain/repositories/user.repository";
import { LoginResponseDto } from "@application/dtos/user/login-response.dto";
import { toUserResponseDto } from "@application/dtos/user/user-response.dto";
import { GetUserByEmailUseCase } from "@application/usecases/user/get-user-by-email.usecase";
import { env } from "@main/config/env";
import { LoginDto } from "@infrastructure/validators/user.validator";

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly getUserByEmailUseCase: GetUserByEmailUseCase,
  ) {}

  async execute(input: LoginDto): Promise<LoginResponseDto> {
    const user = await this.getUserByEmailUseCase.execute(input.email).catch((error) => {
      if (error instanceof BusinessError) throw new BusinessError("Invalid credentials", 401);
      throw error;
    });

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) throw new BusinessError("Invalid credentials", 401);

    const token = jwt.sign({ id: user.id }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    } as jwt.SignOptions);

    return { token, user: toUserResponseDto(user) };
  }
}
