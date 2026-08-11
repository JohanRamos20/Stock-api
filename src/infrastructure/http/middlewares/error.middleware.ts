import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { BusinessError } from "@domain/errors";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        message: "Validation error",
        code: "VALIDATION_ERROR",
        issues: err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
    });
    return;
  }

  if (err instanceof BusinessError) {
    res.status(err.statusCode).json({ error: { message: err.message } });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { message: "Internal server error", code: "INTERNAL_SERVER_ERROR" } });
};
