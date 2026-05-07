import { buildApp } from "./app"
import { connectMongo } from "./config/database"
import { connectRabbit, closeRabbit } from "./messaging/RabbitMQConnection"
import { OrderProjector } from "./modules/orders/read-model/OrderProjector"
import { env } from "./config/env"
import { logger } from "./shared/logger"
import mongoose from "mongoose"

/*
Process entry point. Connects all infrastructure BEFORE accepting traffic,
then starts the HTTP server and the projector consumer.

Graceful shutdown order:
  1. Stop accepting new HTTP connections
  2. Drain in-flight requests (server.close)
  3. Close RabbitMQ (stops consuming, flushes publishes)
  4. Close Mongo

If any infra fails to connect on startup, exit non-zero so the orchestrator
restarts us — better than running with broken dependencies.
*/

const start = async (): Promise<void> => {
    try {
        await connectMongo()
        await connectRabbit()

        // Start projector consumer in-process. In production you'd often run
        // this as a separate worker — but for the learning/single-node
        // setup, co-locating is fine.
        await new OrderProjector().start()

        const app = buildApp()
        const server = app.listen(env.PORT, () => {
            logger.info({ port: env.PORT }, "HTTP server listening")
        })

        const shutdown = async (signal: string) => {
            logger.info({ signal }, "Shutdown initiated")
            server.close(async () => {
                await closeRabbit()
                await mongoose.disconnect()
                logger.info("Shutdown complete")
                process.exit(0)
            })

            // Hard timeout — never hang forever
            setTimeout(() => {
                logger.error("Shutdown timed out — forcing exit")
                process.exit(1)
            }, 10_000).unref()
        }

        process.on("SIGTERM", () => shutdown("SIGTERM"))
        process.on("SIGINT", () => shutdown("SIGINT"))
    } catch (err) {
        logger.fatal({ err }, "Startup failed")
        process.exit(1)
    }
}

start()
