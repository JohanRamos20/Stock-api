import { MaterialCategory, UnitType } from "./material.entity";

export enum RequestStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export interface RequestMaterialProps {
  materialId: string;
  quantity: number;
  material: {
    name: string;
    category: MaterialCategory;
    unitType: UnitType;
  };
}

export interface RequestProps {
  id: string;
  userId: string;
  prazo: Date;
  status: RequestStatus;
  materials: RequestMaterialProps[];
  createdAt: Date;
  updatedAt: Date;
}

export class Request {
  readonly id: string;
  readonly userId: string;
  readonly prazo: Date;
  readonly status: RequestStatus;
  readonly materials: RequestMaterialProps[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: RequestProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.prazo = props.prazo;
    this.status = props.status;
    this.materials = props.materials;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: RequestProps): Request {
    if (!props.userId.trim()) throw new Error("Request userId must not be empty");
    if (!props.prazo) throw new Error("Request prazo must not be empty");
    if (!props.materials.length) throw new Error("Request must have at least one material");
    if (props.materials.some((material) => material.quantity <= 0)) {
      throw new Error("Request material quantity must be greater than zero");
    }
    return new Request(props);
  }
}
