import * as amqp from "amqplib"
import { env } from "../config/env"
import { logger } from "../shared/logger"

/*
Single shared AMQP connection + channel for the process.

Why one connection: AMQP connections are heavyweight (TCP + TLS + auth).
Channels are cheap and multiplex over a single connection — we open one
channel here for publishing. Consumers can open their own channels.
*/

let connection: amqp.ChannelModel | null = null
let channel: amqp.Channel | null = null

export const EXCHANGE = "events"

export const connectRabbit = async (): Promise<amqp.Channel> => {
    if (channel) return channel

    connection = await amqp.connect(env.RABBITMQ_URL)
    channel = await connection.createChannel()

    // Topic exchange — routing key = event type, e.g. "OrderPlaced"
    // durable: true → exchange survives broker restarts
    await channel.assertExchange(EXCHANGE, "topic", { durable: true })

    connection.on("error", (err) => logger.error({ err }, "RabbitMQ error"))
    connection.on("close", () => {
        logger.warn("RabbitMQ connection closed")
        connection = null
        channel = null
    })

    logger.info("RabbitMQ connected")
    return channel
}

export const getChannel = (): amqp.Channel => {
    if (!channel) throw new Error("RabbitMQ not connected — call connectRabbit() first")
    return channel
}

export const closeRabbit = async (): Promise<void> => {
    await channel?.close()
    await connection?.close()
    channel = null
    connection = null
}
