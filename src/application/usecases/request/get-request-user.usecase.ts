import { IRequestRepository } from "@domain/repositories/request.repository";
import {
  toPaginatedRequestResponseDto,
  PaginatedRequestResponseDto,
} from "@application/dtos/request/request-response.dto";
import { PaginationQueryDto } from "@infrastructure/validators/request.validator";

export class GetRequestUserUseCase {
  constructor(private readonly requestRepository: IRequestRepository) {}

  async execute(requesterId: string, query: PaginationQueryDto): Promise<PaginatedRequestResponseDto> {
    const page = await this.requestRepository.findManyByUserId(requesterId, {
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    return toPaginatedRequestResponseDto(page, query.page, query.limit);
  }
}
