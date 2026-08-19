import { UserRole } from "@domain/entities/user.entity";
import { IMaterialRepository } from "@domain/repositories/material.repository";
import { toMaterialResponseDto, MaterialResponseDto } from "@application/dtos/material/material-response.dto";

export class GetAllMaterialsUseCase {
  constructor(private readonly materialRepository: IMaterialRepository) {}

  async execute(requesterRole: UserRole): Promise<MaterialResponseDto[]> {
    const onlyInStock = requesterRole !== UserRole.ADMIN;
    const materials = await this.materialRepository.list({ onlyInStock });
    return materials.map(toMaterialResponseDto);
  }
}
