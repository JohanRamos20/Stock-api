export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER",
}

export enum UserSector {
  ACADEMICS = "ACADEMICS",
  ADMINISTRATIVE = "ADMINISTRATIVE",
}

export interface UserProps {
  id: string;
  name: string;
  email: string;
  siapp: string;
  password: string;
  role: UserRole;
  sector: UserSector;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly siapp: string;
  readonly password: string;
  readonly role: UserRole;
  readonly sector: UserSector;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.siapp = props.siapp;
    this.password = props.password;
    this.role = props.role;
    this.sector = props.sector;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: UserProps): User {
    if (!props.name.trim()) throw new Error("User name must not be empty");
    if (!props.email.trim()) throw new Error("User email must not be empty");
    if (!props.siapp.trim()) throw new Error("User siapp must not be empty");
    if (!props.password) throw new Error("User password must not be empty");
    return new User(props);
  }
}
