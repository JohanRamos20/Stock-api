import { BusinessError } from "@domain/errors";
import { UserRole } from "@domain/entities/user.entity";
import { RequestStatus } from "@domain/entities/request.entity";
import { IRequestRepository } from "@domain/repositories/request.repository";
import { IUnitOfWork } from "@domain/services/unit-of-work";
import { ICacheService } from "@domain/services/cache.service";
import { ALL_REQUESTS_CACHE_PREFIX, userRequestsCachePrefix } from "./request-cache-keys";

const CANCELABLE_STATUSES: RequestStatus[] = [RequestStatus.PENDING, RequestStatus.SEPARATED];

export class CancelRequestUseCase {
  constructor(
    private readonly requestRepository: IRequestRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(id: string, requesterId: string, requesterRole: UserRole): Promise<void> {
    const request = await this.requestRepository.findById(id);
    if (!request) throw new BusinessError(`Request not found: ${id}`, 404);

    if (request.userId !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw new BusinessError("You do not have permission to access this request", 403);
    }

    if (!CANCELABLE_STATUSES.includes(request.status)) {
      throw new BusinessError(`Request is already ${request.status} and cannot be canceled`, 409);
    }

    await this.unitOfWork.run(async ({ requestRepository, materialRepository }) => {
      await requestRepository.updateStatus(id, RequestStatus.CANCELED);
      for (const item of request.materials) {
        await materialRepository.incrementAmount(item.materialId, item.quantity);
      }
    });

    await this.cacheService.invalidate(userRequestsCachePrefix(request.userId));
    await this.cacheService.invalidate(ALL_REQUESTS_CACHE_PREFIX);
  }
}
