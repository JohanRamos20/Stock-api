import { IRequestRepository } from "../repositories/request.repository";
import { IMaterialRepository } from "../repositories/material.repository";

export interface UnitOfWorkRepositories {
  requestRepository: IRequestRepository;
  materialRepository: IMaterialRepository;
}

export interface IUnitOfWork {
  run<T>(work: (repos: UnitOfWorkRepositories) => Promise<T>): Promise<T>;
}
