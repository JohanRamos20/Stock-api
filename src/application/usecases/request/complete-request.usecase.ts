import { BusinessError } from "@domain/errors";
import { RequestStatus } from "@domain/entities/request.entity";
import { IRequestRepository } from "@domain/repositories/request.repository";
import { IUserRepository } from "@domain/repositories/user.repository";
import { ICacheService } from "@domain/services/cache.service";
import { toRequestResponseDto, RequestResponseDto } from "@application/dtos/request/request-response.dto";
import { ALL_REQUESTS_CACHE_PREFIX, userRequestsCachePrefix } from "./request-cache-keys";

export class CompleteRequestUseCase {
  constructor(
    private readonly requestRepository: IRequestRepository,
    private readonly userRepository: IUserRepository,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(id: string, adminId: string): Promise<RequestResponseDto> {
    const request = await this.requestRepository.findById(id);
    if (!request) throw new BusinessError(`Request not found: ${id}`, 404);

    if (request.status !== RequestStatus.PENDING) {
      throw new BusinessError(`Request is already ${request.status}`, 409);
    }

    const admin = await this.userRepository.findById(adminId);
    if (!admin) throw new BusinessError(`Admin not found: ${adminId}`, 404);

    const completed = await this.requestRepository.complete(id, adminId, admin.name);

    await this.cacheService.invalidate(userRequestsCachePrefix(request.userId));
    await this.cacheService.invalidate(ALL_REQUESTS_CACHE_PREFIX);

    return toRequestResponseDto(completed);
  }
}
