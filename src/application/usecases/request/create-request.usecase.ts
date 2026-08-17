import { BusinessError } from "@domain/errors";
import { IMaterialRepository } from "@domain/repositories/material.repository";
import { IUnitOfWork } from "@domain/services/unit-of-work";
import { toRequestResponseDto, RequestResponseDto } from "@application/dtos/request/request-response.dto";
import { CreateRequestDto } from "@infrastructure/validators/request.validator";

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
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(requesterId: string, input: CreateRequestDto): Promise<RequestResponseDto> {
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
        userId: requesterId,
        prazo,
        materials: input.materials,
      });

      for (const item of input.materials) {
        await materialRepository.decrementAmount(item.materialId, item.quantity);
      }

      return created;
    });

    return toRequestResponseDto(request);
  }
}
