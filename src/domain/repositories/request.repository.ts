import { Request } from "../entities/request.entity";

export interface RequestMaterialInput {
  materialId: string;
  quantity: number;
}

export interface CreateRequestData {
  userId: string;
  prazo: Date;
  materials: RequestMaterialInput[];
}

export interface UpdateRequestData {
  prazo?: Date;
  materials?: RequestMaterialInput[];
}

export interface PageRequest {
  skip: number;
  take: number;
}

export interface PageResult<T> {
  data: T[];
  total: number;
}

export interface IRequestRepository {
  create(data: CreateRequestData): Promise<Request>;
  findById(id: string): Promise<Request | null>;
  update(id: string, data: UpdateRequestData): Promise<Request>;
  cancel(id: string): Promise<Request>;
  complete(id: string): Promise<Request>;
  findManyByUserId(userId: string, page: PageRequest): Promise<PageResult<Request>>;
  findMany(page: PageRequest): Promise<PageResult<Request>>;
}
