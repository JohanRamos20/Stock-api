import { User, UserRole, UserSector } from "../entities/user.entity";

export interface CreateUserData {
  name: string;
  email: string;
  siapp: string;
  password: string;
  role: UserRole;
  sector: UserSector;
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findBySiapp(siapp: string): Promise<User | null>;
  list(): Promise<User[]>;
  updatePassword(id: string, hashedPassword: string): Promise<void>;
  delete(id: string): Promise<void>;
  hasRequests(id: string): Promise<boolean>;
}
