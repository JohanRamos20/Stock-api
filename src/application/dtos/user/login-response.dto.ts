import { UserResponseDto } from "./user-response.dto";

export interface LoginResponseDto {
  token: string;
  user: UserResponseDto;
}
