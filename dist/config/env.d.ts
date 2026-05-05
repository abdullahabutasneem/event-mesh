import "dotenv/config";
export declare const env: Readonly<{
    PORT: number;
    NODE_ENV: "development" | "test" | "production";
    RABBITMQ_URL: string;
    REDIS_URL: string;
    MONGO_URI: string;
    JWT_SECRET: string;
} & import("envalid").CleanedEnvAccessors>;
//# sourceMappingURL=env.d.ts.map