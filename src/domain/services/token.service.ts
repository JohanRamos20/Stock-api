import { UserRole } from "@domain/entities/user.entity";

export interface TokenPayload {
  id: string;
  role: UserRole;
}

export interface ITokenService {
  sign(payload: TokenPayload): string;
}
