"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
const envalid_1 = require("envalid");
exports.env = (0, envalid_1.cleanEnv)(process.env, {
    PORT: (0, envalid_1.port)({ default: 3000 }),
    NODE_ENV: (0, envalid_1.str)({
        choices: ["development", "test", "production"],
        default: "development",
    }),
    RABBITMQ_URL: (0, envalid_1.str)({ default: "amqp://localhost:5672" }),
    REDIS_URL: (0, envalid_1.str)({ default: "redis://localhost:6379" }),
    MONGO_URI: (0, envalid_1.str)({ default: "mongodb://localhost:27017/event-mesh" }),
    JWT_SECRET: (0, envalid_1.str)({ default: "dev-secret-change-me" }),
});
//# sourceMappingURL=env.js.map