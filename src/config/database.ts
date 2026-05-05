import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../shared/logger";

export const connectMongo = async (): Promise<void> => {
    mongoose.connection.on('connected', () =>
        logger.info('MongoDB connected'))
    mongoose.connection.on('error', (err) =>
        logger.error({ err }, 'MongoDB error'))
    
    await mongoose.connect(env.MONGO_URI, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000
    })
}