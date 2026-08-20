import { BusinessError } from "@domain/errors";
import { RequestStatus } from "@domain/entities/request.entity";
import { IRequestRepository } from "@domain/repositories/request.repository";
import { ICacheService } from "@domain/services/cache.service";
import { toRequestResponseDto, RequestResponseDto } from "@application/dtos/request/request-response.dto";
import { ALL_REQUESTS_CACHE_PREFIX, userRequestsCachePrefix } from "./request-cache-keys";

export class SeparateRequestUseCase {
  constructor(
    private readonly requestRepository: IRequestRepository,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(id: string): Promise<RequestResponseDto> {
    const request = await this.requestRepository.findById(id);
    if (!request) throw new BusinessError(`Request not found: ${id}`, 404);

    if (request.status !== RequestStatus.PENDING) {
      throw new BusinessError(`Request is already ${request.status} and cannot be separated`, 409);
    }

    const separated = await this.requestRepository.updateStatus(id, RequestStatus.SEPARATED);

    await this.cacheService.invalidate(userRequestsCachePrefix(request.userId));
    await this.cacheService.invalidate(ALL_REQUESTS_CACHE_PREFIX);

    return toRequestResponseDto(separated);
  }
}
