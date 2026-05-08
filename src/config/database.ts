import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../shared/logger";

const resolveMongoUri = (): string => {
    const rawUri = env.MONGO_URI;

    // Local Docker replica sets often advertise internal hostnames (e.g. "mongo"),
    // so force direct connection when developing against localhost.
    if (env.NODE_ENV !== "development") return rawUri;

    try {
        const parsed = new URL(rawUri);
        const isLocalHost =
            parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

        if (isLocalHost && !parsed.searchParams.has("directConnection")) {
            parsed.searchParams.set("directConnection", "true");
            return parsed.toString();
        }
    } catch {
        // If URI is non-standard, fall back to the raw value.
    }

    return rawUri;
};

export const connectMongo = async (): Promise<void> => {
    mongoose.connection.on('connected', () =>
        logger.info('MongoDB connected'))
    mongoose.connection.on('error', (err) =>
        logger.error({ err }, 'MongoDB error'))
    
    await mongoose.connect(resolveMongoUri(), {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000
    })
}