import { IMaterialRepository } from "@domain/repositories/material.repository";
import { toMaterialResponseDto, MaterialResponseDto } from "@application/dtos/material/material-response.dto";
import { CreateMaterialDto } from "@infrastructure/validators/material.validator";

export class CreateMaterialUseCase {
  constructor(private readonly materialRepository: IMaterialRepository) {}

  async execute(input: CreateMaterialDto): Promise<MaterialResponseDto> {
    const material = await this.materialRepository.create(input);
    return toMaterialResponseDto(material);
  }
}
