import { PrismaRequestRepository } from "@database/repositories/prisma-request.repository";
import { PrismaMaterialRepository } from "@database/repositories/prisma-material.repository";
import { PrismaUserRepository } from "@database/repositories/prisma-user.repository";
import { PrismaUnitOfWork } from "@database/unit-of-work";
import { CreateRequestUseCase } from "@application/usecases/request/create-request.usecase";
import { GetRequestUseCase } from "@application/usecases/request/get-request.usecase";
import { GetRequestUserUseCase } from "@application/usecases/request/get-request-user.usecase";
import { GetRequestAllUseCase } from "@application/usecases/request/get-request-all.usecase";
import { EditRequestUseCase } from "@application/usecases/request/edit-request.usecase";
import { CancelRequestUseCase } from "@application/usecases/request/cancel-request.usecase";
import { CompleteRequestUseCase } from "@application/usecases/request/complete-request.usecase";
import { PdfRequestUseCase } from "@application/usecases/request/pdf-request.usecase";
import { RequestController } from "@infrastructure/http/controllers/request.controller";

export function makeRequestController(): RequestController {
  const requestRepository = new PrismaRequestRepository();
  const materialRepository = new PrismaMaterialRepository();
  const userRepository = new PrismaUserRepository();
  const unitOfWork = new PrismaUnitOfWork();

  const createRequestUseCase = new CreateRequestUseCase(materialRepository, unitOfWork);
  const getRequestUseCase = new GetRequestUseCase(requestRepository);
  const getRequestUserUseCase = new GetRequestUserUseCase(requestRepository);
  const getRequestAllUseCase = new GetRequestAllUseCase(requestRepository);
  const editRequestUseCase = new EditRequestUseCase(requestRepository, materialRepository, unitOfWork);
  const cancelRequestUseCase = new CancelRequestUseCase(requestRepository, unitOfWork);
  const completeRequestUseCase = new CompleteRequestUseCase(requestRepository);
  const pdfRequestUseCase = new PdfRequestUseCase(requestRepository, userRepository);

  return new RequestController(
    createRequestUseCase,
    getRequestUseCase,
    getRequestUserUseCase,
    getRequestAllUseCase,
    editRequestUseCase,
    cancelRequestUseCase,
    completeRequestUseCase,
    pdfRequestUseCase,
  );
}
