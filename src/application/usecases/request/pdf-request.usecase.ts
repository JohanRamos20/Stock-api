import { BusinessError } from "@domain/errors";
import { RequestStatus } from "@domain/entities/request.entity";
import { UserRole } from "@domain/entities/user.entity";
import { IRequestRepository } from "@domain/repositories/request.repository";
import { IUserRepository } from "@domain/repositories/user.repository";
import { toWithdrawalSlipDto, WithdrawalSlipDto } from "@application/dtos/request/withdrawal-slip.dto";

export class PdfRequestUseCase {
  constructor(
    private readonly requestRepository: IRequestRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, requesterId: string, requesterRole: UserRole): Promise<WithdrawalSlipDto> {
    const request = await this.requestRepository.findById(id);
    if (!request) throw new BusinessError(`Request not found: ${id}`, 404);

    if (request.userId !== requesterId && requesterRole !== UserRole.ADMIN) {
      throw new BusinessError("You do not have permission to access this request", 403);
    }

    if (request.status === RequestStatus.CANCELED) {
      throw new BusinessError("Cannot issue withdrawal slip for a canceled request", 409);
    }

    const requester = await this.userRepository.findById(request.userId);
    if (!requester) throw new BusinessError(`User not found: ${request.userId}`, 404);

    return toWithdrawalSlipDto(request, requester);
  }
}
