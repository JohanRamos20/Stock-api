import { IMaterialRepository } from "@domain/repositories/material.repository";
import { toMaterialResponseDto, MaterialResponseDto } from "@application/dtos/material/material-response.dto";

export class GetAllMaterialsUseCase {
  constructor(private readonly materialRepository: IMaterialRepository) {}

  async execute(): Promise<MaterialResponseDto[]> {
    const materials = await this.materialRepository.list();
    return materials.map(toMaterialResponseDto);
  }
}
