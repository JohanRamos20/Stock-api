import { Request } from "@domain/entities/request.entity";
import { User, UserSector } from "@domain/entities/user.entity";

const SECTOR_LABELS: Record<UserSector, string> = {
  [UserSector.ACADEMICS]: "Acadêmico",
  [UserSector.ADMINISTRATIVE]: "Administrativo",
};

export interface WithdrawalSlipMaterialDto {
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

export interface WithdrawalSlipDto {
  requestId: string;
  requesterName: string;
  sector: string;
  deadline: string;
  createdAt: string;
  materials: WithdrawalSlipMaterialDto[];
}

export function toWithdrawalSlipDto(request: Request, requester: User): WithdrawalSlipDto {
  return {
    requestId: request.id,
    requesterName: requester.name,
    sector: SECTOR_LABELS[requester.sector],
    deadline: request.prazo.toLocaleDateString("pt-BR"),
    createdAt: request.createdAt.toLocaleString("pt-BR"),
    materials: request.materials.map((item) => ({
      name: item.material.name,
      category: item.material.category,
      quantity: item.quantity,
      unit: item.material.unitType,
    })),
  };
}
