import { BusinessError } from "@domain/errors";
import { RequestStatus } from "@domain/entities/request.entity";
import { IRequestRepository } from "@domain/repositories/request.repository";
import { toRequestResponseDto, RequestResponseDto } from "@application/dtos/request/request-response.dto";

export class CompleteRequestUseCase {
  constructor(private readonly requestRepository: IRequestRepository) {}

  async execute(id: string): Promise<RequestResponseDto> {
    const request = await this.requestRepository.findById(id);
    if (!request) throw new BusinessError(`Request not found: ${id}`, 404);

    if (request.status !== RequestStatus.PENDING) {
      throw new BusinessError(`Request is already ${request.status}`, 409);
    }

    const completed = await this.requestRepository.complete(id);
    return toRequestResponseDto(completed);
  }
}
