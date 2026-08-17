import { BusinessError } from "@domain/errors";
import { UserRole } from "@domain/entities/user.entity";
import { RequestStatus } from "@domain/entities/request.entity";
import { IMaterialRepository } from "@domain/repositories/material.repository";
import { IRequestRepository } from "@domain/repositories/request.repository";
import { IUnitOfWork } from "@domain/services/unit-of-work";
import { toRequestResponseDto, RequestResponseDto } from "@application/dtos/request/request-response.dto";
import { EditRequestDto } from "@infrastructure/validators/request.validator";

export class EditRequestUseCase {
  constructor(
    private readonly requestRepository: IRequestRepository,
    private readonly materialRepository: IMaterialRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(
    id: string,
    requesterId: string,
    requesterRole: UserRole,
    input: EditRequestDto,
  ): Promise<RequestResponseDto> {
    const request = await this.requestRepository.findById(id);
    if (!request) throw new BusinessError(`Request not found: ${id}`, 404);

    if (request.userId !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw new BusinessError("You do not have permission to access this request", 403);
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BusinessError(`Request is already ${request.status} and cannot be modified`, 409);
    }

    if (input.materials) {
      const materialIds = input.materials.map((material) => material.materialId);
      const materials = await this.materialRepository.findByIds(materialIds);
      for (const materialId of materialIds) {
        if (!materials.some((material) => material.id === materialId)) {
          throw new BusinessError(`Material not found: ${materialId}`, 404);
        }
      }
    }

    const updated = await this.unitOfWork.run(async ({ requestRepository, materialRepository }) => {
      if (input.materials) {
        for (const oldItem of request.materials) {
          await materialRepository.incrementAmount(oldItem.materialId, oldItem.quantity);
        }
        for (const item of input.materials) {
          await materialRepository.decrementAmount(item.materialId, item.quantity);
        }
      }

      return requestRepository.update(id, {
        prazo: input.prazo,
        materials: input.materials,
      });
    });

    return toRequestResponseDto(updated);
  }
}
