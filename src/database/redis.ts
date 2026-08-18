import { createClient } from "redis";
import { env } from "../main/config/env";

export const redisClient = createClient({ url: env.redisUrl });

redisClient.on("error", (err) => console.error("Redis Client Error", err));
