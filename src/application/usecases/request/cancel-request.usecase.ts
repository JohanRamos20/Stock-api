import { BusinessError } from "@domain/errors";
import { UserRole } from "@domain/entities/user.entity";
import { RequestStatus } from "@domain/entities/request.entity";
import { IRequestRepository } from "@domain/repositories/request.repository";
import { IUnitOfWork } from "@domain/services/unit-of-work";

export class CancelRequestUseCase {
  constructor(
    private readonly requestRepository: IRequestRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(id: string, requesterId: string, requesterRole: UserRole): Promise<void> {
    const request = await this.requestRepository.findById(id);
    if (!request) throw new BusinessError(`Request not found: ${id}`, 404);

    if (request.userId !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw new BusinessError("You do not have permission to access this request", 403);
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new BusinessError(`Request is already ${request.status} and cannot be canceled`, 409);
    }

    await this.unitOfWork.run(async ({ requestRepository, materialRepository }) => {
      await requestRepository.cancel(id);
      for (const item of request.materials) {
        await materialRepository.incrementAmount(item.materialId, item.quantity);
      }
    });
  }
}
