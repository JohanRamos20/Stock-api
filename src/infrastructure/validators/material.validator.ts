import { z } from "zod";
import { MaterialCategory, UnitType } from "@domain/entities/material.entity";

export const createMaterialSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  category: z.nativeEnum(MaterialCategory),
  location: z.string().trim().min(1, "location is required"),
  amount: z.number().int().nonnegative(),
  unitType: z.nativeEnum(UnitType),
});

export type CreateMaterialDto = z.infer<typeof createMaterialSchema>;

export const editMaterialSchema = z
  .object({
    name: z.string().trim().min(1, "name is required").optional(),
    category: z.nativeEnum(MaterialCategory).optional(),
    location: z.string().trim().min(1, "location is required").optional(),
    amount: z.number().int().nonnegative().optional(),
    unitType: z.nativeEnum(UnitType).optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "at least one field must be provided",
  });

export type EditMaterialDto = z.infer<typeof editMaterialSchema>;
