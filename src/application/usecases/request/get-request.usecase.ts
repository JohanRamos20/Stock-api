import { BusinessError } from "@domain/errors";
import { UserRole } from "@domain/entities/user.entity";
import { IRequestRepository } from "@domain/repositories/request.repository";
import { toRequestResponseDto, RequestResponseDto } from "@application/dtos/request/request-response.dto";

export class GetRequestUseCase {
  constructor(private readonly requestRepository: IRequestRepository) {}

  async execute(id: string, requesterId: string, requesterRole: UserRole): Promise<RequestResponseDto> {
    const request = await this.requestRepository.findById(id);
    if (!request) throw new BusinessError(`Request not found: ${id}`, 404);

    if (request.userId !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw new BusinessError("You do not have permission to access this request", 403);
    }

    return toRequestResponseDto(request);
  }
}
