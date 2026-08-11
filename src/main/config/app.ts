import cors from "cors";
import express from "express";
import { errorMiddleware } from "@infrastructure/http/middlewares/error.middleware";
import { userRoutes } from "@infrastructure/http/routes/user.routes";
import { env } from "./env";

export const app = express();

app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/users", userRoutes);

app.use(errorMiddleware);
