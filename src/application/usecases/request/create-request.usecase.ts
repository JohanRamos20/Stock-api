import { BusinessError } from "@domain/errors";
import { UserRole } from "@domain/entities/user.entity";
import { IMaterialRepository } from "@domain/repositories/material.repository";
import { IUserRepository } from "@domain/repositories/user.repository";
import { IUnitOfWork } from "@domain/services/unit-of-work";
import { ICacheService } from "@domain/services/cache.service";
import { toRequestResponseDto, RequestResponseDto } from "@application/dtos/request/request-response.dto";
import { CreateRequestDto } from "@infrastructure/validators/request.validator";
import { ALL_REQUESTS_CACHE_PREFIX, userRequestsCachePrefix } from "./request-cache-keys";

function getNextBusinessDay(from: Date): Date {
  const result = new Date(from);
  result.setDate(result.getDate() + 1);
  while (result.getDay() === 0 || result.getDay() === 6) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

export class CreateRequestUseCase {
  constructor(
    private readonly materialRepository: IMaterialRepository,
    private readonly userRepository: IUserRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly cacheService: ICacheService,
  ) {}

  async execute(callerId: string, callerRole: UserRole, input: CreateRequestDto): Promise<RequestResponseDto> {
    let ownerId = callerId;
    let createdByAdminId: string | null = null;
    let createdByAdminName: string | null = null;

    if (input.userId) {
      if (callerRole !== UserRole.ADMIN) {
        throw new BusinessError("Only admins can create a request on behalf of another user", 403);
      }

      const targetUser = await this.userRepository.findById(input.userId);
      if (!targetUser) throw new BusinessError(`User not found: ${input.userId}`, 404);

      const admin = await this.userRepository.findById(callerId);
      if (!admin) throw new BusinessError(`Admin not found: ${callerId}`, 404);

      ownerId = input.userId;
      createdByAdminId = callerId;
      createdByAdminName = admin.name;
    }

    const materialIds = input.materials.map((material) => material.materialId);
    const materials = await this.materialRepository.findByIds(materialIds);

    for (const materialId of materialIds) {
      if (!materials.some((material) => material.id === materialId)) {
        throw new BusinessError(`Material not found: ${materialId}`, 404);
      }
    }

    const prazo = input.prazo ?? getNextBusinessDay(new Date());

    const request = await this.unitOfWork.run(async ({ requestRepository, materialRepository }) => {
      const created = await requestRepository.create({
        userId: ownerId,
        prazo,
        materials: input.materials,
        createdByAdminId,
        createdByAdminName,
      });

      for (const item of input.materials) {
        await materialRepository.decrementAmount(item.materialId, item.quantity);
      }

      return created;
    });

    await this.cacheService.invalidate(userRequestsCachePrefix(ownerId));
    await this.cacheService.invalidate(ALL_REQUESTS_CACHE_PREFIX);

    return toRequestResponseDto(request);
  }
}
