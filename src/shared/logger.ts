import pino from "pino";

const logLevel = process.env.NODE_ENV === "production" ? "info" : "debug";

export const logger = pino({
  level: logLevel,
});

