import { z } from "zod";

const requestMaterialSchema = z.object({
  materialId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const createRequestSchema = z.object({
  prazo: z.coerce.date().optional(),
  materials: z.array(requestMaterialSchema).min(1, "at least one material is required"),
});

export type CreateRequestDto = z.infer<typeof createRequestSchema>;

export const editRequestSchema = z
  .object({
    prazo: z.coerce.date().optional(),
    materials: z.array(requestMaterialSchema).min(1, "at least one material is required").optional(),
  })
  .refine((data) => data.prazo !== undefined || data.materials !== undefined, {
    message: "at least one of prazo or materials must be provided",
  });

export type EditRequestDto = z.infer<typeof editRequestSchema>;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;
