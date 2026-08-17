export enum MaterialCategory {
  FERRAMENTA = "FERRAMENTA",
  EPI = "EPI",
  CONSUMIVEL = "CONSUMIVEL",
}

export enum UnitType {
  UNITY = "UNITY",
  BOX = "BOX",
}

export interface MaterialProps {
  id: string;
  name: string;
  category: MaterialCategory;
  location: string;
  amount: number;
  unitType: UnitType;
  createdAt: Date;
  updatedAt: Date;
}

export class Material {
  readonly id: string;
  readonly name: string;
  readonly category: MaterialCategory;
  readonly location: string;
  readonly amount: number;
  readonly unitType: UnitType;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: MaterialProps) {
    this.id = props.id;
    this.name = props.name;
    this.category = props.category;
    this.location = props.location;
    this.amount = props.amount;
    this.unitType = props.unitType;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: MaterialProps): Material {
    if (!props.name.trim()) throw new Error("Material name must not be empty");
    if (!props.location.trim()) throw new Error("Material location must not be empty");
    return new Material(props);
  }
}
