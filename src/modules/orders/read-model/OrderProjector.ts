import * as amqp from "amqplib"
import { connectRabbit, EXCHANGE } from "../../../messaging/RabbitMQConnection"
import { OrderViewModel } from "./OrderViewSchema"
import type { DomainEvent } from "../../../core/event/DomainEvent"
import { logger } from "../../../shared/logger"

/*
Subscribes to Order.* events and updates the read model.

Idempotency: each upsert checks `version` — if the stored view is already
at or beyond the incoming event's version, we skip. This handles redelivery
(at-least-once semantics from RabbitMQ).

Durable queue + manual ack: messages survive broker restart and are only
removed once we've successfully applied them.
*/

const QUEUE = "order.read-model"
const PATTERNS = ["OrderPlaced", "OrderShipped", "OrderCancelled"]

interface OrderPlacedPayload {
    customerId: string
    items: { productId: string; quantity: number }[]
}

interface OrderCancelledPayload {
    reason: string
}

export class OrderProjector {
    async start(): Promise<void> {
        const channel = await connectRabbit()

        await channel.assertQueue(QUEUE, { durable: true })
        for (const pattern of PATTERNS) {
            await channel.bindQueue(QUEUE, EXCHANGE, pattern)
        }

        // Process one message at a time per consumer — keeps version checks simple
        await channel.prefetch(1)

        await channel.consume(QUEUE, async (msg) => {
            if (!msg) return
            try {
                const event = this.parseEvent(msg)
                await this.apply(event)
                channel.ack(msg)
            } catch (err) {
                logger.error({ err }, "Projector failed — requeueing")
                // requeue=false would dead-letter; for now we requeue to retry
                channel.nack(msg, false, true)
            }
        })

        logger.info({ queue: QUEUE }, "OrderProjector started")
    }

    private parseEvent(msg: amqp.ConsumeMessage): DomainEvent {
        const raw = JSON.parse(msg.content.toString())
        return { ...raw, occurredAt: new Date(raw.occurredAt) }
    }

    private async apply(event: DomainEvent): Promise<void> {
        switch (event.type) {
            case "OrderPlaced":
                return this.onPlaced(event as DomainEvent<OrderPlacedPayload>)
            case "OrderShipped":
                return this.onShipped(event)
            case "OrderCancelled":
                return this.onCancelled(event as DomainEvent<OrderCancelledPayload>)
            default:
                logger.warn({ type: event.type }, "Unknown event type — skipping")
        }
    }

    private async onPlaced(event: DomainEvent<OrderPlacedPayload>): Promise<void> {
        await OrderViewModel.updateOne(
            { orderId: event.aggregateId, version: { $lt: event.version } },
            {
                $set: {
                    orderId: event.aggregateId,
                    customerId: event.payload.customerId,
                    items: event.payload.items,
                    status: "pending",
                    version: event.version,
                    placedAt: event.occurredAt,
                    updatedAt: event.occurredAt,
                },
            },
            { upsert: true }
        )
    }

    private async onShipped(event: DomainEvent): Promise<void> {
        await OrderViewModel.updateOne(
            { orderId: event.aggregateId, version: { $lt: event.version } },
            { $set: { status: "shipped", version: event.version, updatedAt: event.occurredAt } }
        )
    }

    private async onCancelled(event: DomainEvent<OrderCancelledPayload>): Promise<void> {
        await OrderViewModel.updateOne(
            { orderId: event.aggregateId, version: { $lt: event.version } },
            {
                $set: {
                    status: "cancelled",
                    cancelReason: event.payload.reason,
                    version: event.version,
                    updatedAt: event.occurredAt,
                },
            }
        )
    }
}
