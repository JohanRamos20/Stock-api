import { NextFunction, Request, Response } from "express";
import { BusinessError } from "@domain/errors";
import { CreateMaterialUseCase } from "@application/usecases/material/create-material.usecase";
import { EditMaterialUseCase } from "@application/usecases/material/edit-material.usecase";
import { DeleteMaterialUseCase } from "@application/usecases/material/delete-material.usecase";
import { GetAllMaterialsUseCase } from "@application/usecases/material/get-all-materials.usecase";
import { createMaterialSchema, editMaterialSchema } from "@infrastructure/validators/material.validator";

export class MaterialController {
  constructor(
    private readonly createMaterialUseCase: CreateMaterialUseCase,
    private readonly editMaterialUseCase: EditMaterialUseCase,
    private readonly deleteMaterialUseCase: DeleteMaterialUseCase,
    private readonly getAllMaterialsUseCase: GetAllMaterialsUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = createMaterialSchema.parse(req.body);
      const material = await this.createMaterialUseCase.execute(dto);
      res.status(201).json(material);
    } catch (err) {
      next(err);
    }
  };

  edit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = editMaterialSchema.parse(req.body);
      const material = await this.editMaterialUseCase.execute(req.params.id as string, dto);
      res.status(200).json(material);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.deleteMaterialUseCase.execute(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userRole) throw new BusinessError("Missing or invalid authentication token", 401);
      const materials = await this.getAllMaterialsUseCase.execute(req.userRole);
      res.status(200).json(materials);
    } catch (err) {
      next(err);
    }
  };
}
