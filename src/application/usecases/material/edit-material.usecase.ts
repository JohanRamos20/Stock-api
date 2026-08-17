import { BusinessError } from "@domain/errors";
import { IMaterialRepository } from "@domain/repositories/material.repository";
import { toMaterialResponseDto, MaterialResponseDto } from "@application/dtos/material/material-response.dto";
import { EditMaterialDto } from "@infrastructure/validators/material.validator";

export class EditMaterialUseCase {
  constructor(private readonly materialRepository: IMaterialRepository) {}

  async execute(id: string, input: EditMaterialDto): Promise<MaterialResponseDto> {
    const material = await this.materialRepository.findById(id);
    if (!material) throw new BusinessError(`Material not found: ${id}`, 404);

    const updated = await this.materialRepository.update(id, input);
    return toMaterialResponseDto(updated);
  }
}
