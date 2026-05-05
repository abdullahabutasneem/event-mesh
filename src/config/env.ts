import "dotenv/config";
import { cleanEnv, str, port } from "envalid";

export const env = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  NODE_ENV: str({
    choices: ["development", "test", "production"],
    default: "development",
  }),
  RABBITMQ_URL: str({ default: "amqp://localhost:5672" }),
  REDIS_URL: str({ default: "redis://localhost:6379" }),
  MONGO_URI: str({ default: "mongodb://localhost:27017/event-mesh" }),
  JWT_SECRET: str({ default: "dev-secret-change-me" }),
});