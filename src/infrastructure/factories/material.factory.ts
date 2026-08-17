import { PrismaMaterialRepository } from "@database/repositories/prisma-material.repository";
import { CreateMaterialUseCase } from "@application/usecases/material/create-material.usecase";
import { EditMaterialUseCase } from "@application/usecases/material/edit-material.usecase";
import { DeleteMaterialUseCase } from "@application/usecases/material/delete-material.usecase";
import { GetAllMaterialsUseCase } from "@application/usecases/material/get-all-materials.usecase";
import { MaterialController } from "@infrastructure/http/controllers/material.controller";

export function makeMaterialController(): MaterialController {
  const materialRepository = new PrismaMaterialRepository();

  const createMaterialUseCase = new CreateMaterialUseCase(materialRepository);
  const editMaterialUseCase = new EditMaterialUseCase(materialRepository);
  const deleteMaterialUseCase = new DeleteMaterialUseCase(materialRepository);
  const getAllMaterialsUseCase = new GetAllMaterialsUseCase(materialRepository);

  return new MaterialController(createMaterialUseCase, editMaterialUseCase, deleteMaterialUseCase, getAllMaterialsUseCase);
}
