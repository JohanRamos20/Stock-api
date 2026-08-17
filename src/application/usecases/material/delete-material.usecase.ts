import { BusinessError } from "@domain/errors";
import { IMaterialRepository } from "@domain/repositories/material.repository";

export class DeleteMaterialUseCase {
  constructor(private readonly materialRepository: IMaterialRepository) {}

  async execute(id: string): Promise<void> {
    const material = await this.materialRepository.findById(id);
    if (!material) throw new BusinessError(`Material not found: ${id}`, 404);

    const inUse = await this.materialRepository.isInUse(id);
    if (inUse) throw new BusinessError("Material is in use and cannot be deleted", 409);

    await this.materialRepository.delete(id);
  }
}
