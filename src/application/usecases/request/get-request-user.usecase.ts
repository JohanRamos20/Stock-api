import { IRequestRepository } from "@domain/repositories/request.repository";
import { ICacheService } from "@domain/services/cache.service";
import {
  toPaginatedRequestResponseDto,
  PaginatedRequestResponseDto,
} from "@application/dtos/request/request-response.dto";
import { PaginationQueryDto } from "@infrastructure/validators/request.validator";
import { buildUserRequestsCacheKey, REQUEST_LIST_CACHE_TTL_SECONDS } from "./request-cache-keys";

export class GetRequestUserUseCase {
  constructor(
    private readonly requestRepository: IRequestRepository,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(requesterId: string, query: PaginationQueryDto): Promise<PaginatedRequestResponseDto> {
    const cacheKey = buildUserRequestsCacheKey(requesterId, query.page, query.limit);
    const cached = await this.cacheService.get<PaginatedRequestResponseDto>(cacheKey);
    if (cached) return cached;

    const page = await this.requestRepository.findManyByUserId(requesterId, {
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });

    const result = toPaginatedRequestResponseDto(page, query.page, query.limit);
    await this.cacheService.set(cacheKey, result, REQUEST_LIST_CACHE_TTL_SECONDS);
    return result;
  }
}
