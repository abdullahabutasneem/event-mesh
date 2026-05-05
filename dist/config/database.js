"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMongo = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_1 = require("../shared/logger");
const connectMongo = async () => {
    mongoose_1.default.connection.on('connected', () => logger_1.logger.info('MongoDB connected'));
    mongoose_1.default.connection.on('error', (err) => logger_1.logger.error({ err }, 'MongoDB error'));
    await mongoose_1.default.connect(env_1.env.MONGO_URI, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 5000
    });
};
exports.connectMongo = connectMongo;
//# sourceMappingURL=database.js.map