import { app } from "./config/app";
import { env } from "./config/env";
import { redisClient } from "@database/redis";

redisClient
  .connect()
  .catch((err) => console.error("Failed to connect to Redis", err))
  .finally(() => {
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  });
