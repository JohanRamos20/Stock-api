import { NextFunction, Request, Response } from "express";
import { BusinessError } from "@domain/errors";
import { CreateRequestUseCase } from "@application/usecases/request/create-request.usecase";
import { GetRequestUseCase } from "@application/usecases/request/get-request.usecase";
import { GetRequestUserUseCase } from "@application/usecases/request/get-request-user.usecase";
import { GetRequestAllUseCase } from "@application/usecases/request/get-request-all.usecase";
import { EditRequestUseCase } from "@application/usecases/request/edit-request.usecase";
import { CancelRequestUseCase } from "@application/usecases/request/cancel-request.usecase";
import { SeparateRequestUseCase } from "@application/usecases/request/separate-request.usecase";
import { CompleteRequestUseCase } from "@application/usecases/request/complete-request.usecase";
import { PdfRequestUseCase } from "@application/usecases/request/pdf-request.usecase";
import {
  createRequestSchema,
  editRequestSchema,
  paginationQuerySchema,
} from "@infrastructure/validators/request.validator";

export class RequestController {
  constructor(
    private readonly createRequestUseCase: CreateRequestUseCase,
    private readonly getRequestUseCase: GetRequestUseCase,
    private readonly getRequestUserUseCase: GetRequestUserUseCase,
    private readonly getRequestAllUseCase: GetRequestAllUseCase,
    private readonly editRequestUseCase: EditRequestUseCase,
    private readonly cancelRequestUseCase: CancelRequestUseCase,
    private readonly separateRequestUseCase: SeparateRequestUseCase,
    private readonly completeRequestUseCase: CompleteRequestUseCase,
    private readonly pdfRequestUseCase: PdfRequestUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId || !req.userRole) throw new BusinessError("Missing or invalid authentication token", 401);
      const dto = createRequestSchema.parse(req.body);
      const request = await this.createRequestUseCase.execute(req.userId, req.userRole, dto);
      res.status(201).json(request);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId || !req.userRole) throw new BusinessError("Missing or invalid authentication token", 401);
      const request = await this.getRequestUseCase.execute(req.params.id as string, req.userId, req.userRole);
      res.status(200).json(request);
    } catch (err) {
      next(err);
    }
  };

  listMine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) throw new BusinessError("Missing or invalid authentication token", 401);
      const query = paginationQuerySchema.parse(req.query);
      const requests = await this.getRequestUserUseCase.execute(req.userId, query);
      res.status(200).json(requests);
    } catch (err) {
      next(err);
    }
  };

  listAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = paginationQuerySchema.parse(req.query);
      const requests = await this.getRequestAllUseCase.execute(query);
      res.status(200).json(requests);
    } catch (err) {
      next(err);
    }
  };

  edit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId || !req.userRole) throw new BusinessError("Missing or invalid authentication token", 401);
      const dto = editRequestSchema.parse(req.body);
      const request = await this.editRequestUseCase.execute(
        req.params.id as string,
        req.userId,
        req.userRole,
        dto,
      );
      res.status(200).json(request);
    } catch (err) {
      next(err);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId || !req.userRole) throw new BusinessError("Missing or invalid authentication token", 401);
      await this.cancelRequestUseCase.execute(req.params.id as string, req.userId, req.userRole);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  separate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) throw new BusinessError("Missing or invalid authentication token", 401);
      const request = await this.separateRequestUseCase.execute(req.params.id as string);
      res.status(200).json(request);
    } catch (err) {
      next(err);
    }
  };

  complete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) throw new BusinessError("Missing or invalid authentication token", 401);
      const request = await this.completeRequestUseCase.execute(req.params.id as string, req.userId);
      res.status(200).json(request);
    } catch (err) {
      next(err);
    }
  };

  pdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId || !req.userRole) throw new BusinessError("Missing or invalid authentication token", 401);
      const withdrawalSlip = await this.pdfRequestUseCase.execute(req.params.id as string, req.userId, req.userRole);
      res.status(200).json(withdrawalSlip);
    } catch (err) {
      next(err);
    }
  };
}
