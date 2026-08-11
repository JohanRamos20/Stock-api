import jwt from "jsonwebtoken";
import { ITokenService, TokenPayload } from "@domain/services/token.service";
import { env } from "@main/config/env";

export class JwtTokenService implements ITokenService {
  sign(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}
