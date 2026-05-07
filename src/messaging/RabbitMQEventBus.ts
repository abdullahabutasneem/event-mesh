import { getChannel, EXCHANGE } from "./RabbitMQConnection"
import type { DomainEvent } from "../core/event/DomainEvent"
import type { RabbitMQBus } from "../modules/orders/application/PlaceOrderHandler"
import { logger } from "../shared/logger"

/*
Publishes domain events to a topic exchange.

Routing key = event.type (e.g. "OrderPlaced", "OrderShipped").
Consumers bind their queues with patterns like "Order.*" or "OrderPlaced".

persistent: true → message survives broker restart (paired with durable
exchange + durable queue on the consumer side).

NOTE: this is fire-and-forget. The PlaceOrderHandler already saves events
to MongoDB *before* publishing — if publish fails, events are still in the
store and a separate outbox/relay can retry them.
*/

export class RabbitMQEventBus implements RabbitMQBus {
    async publish(event: DomainEvent): Promise<void> {
        const channel = getChannel()
        const payload = Buffer.from(JSON.stringify(event))

        const ok = channel.publish(EXCHANGE, event.type, payload, {
            persistent: true,
            contentType: "application/json",
            messageId: event.id,
            timestamp: event.occurredAt.getTime(),
            headers: {
                aggregateId: event.aggregateId,
                aggregateType: event.aggregateType,
                version: event.version,
                correlationId: event.metadata.correlationId,
                causationId: event.metadata.causationId,
            },
        })

        if (!ok) {
            // Channel write buffer is full — wait for drain
            await new Promise<void>((resolve) => channel.once("drain", resolve))
        }

        logger.debug({ eventType: event.type, aggregateId: event.aggregateId }, "Event published")
    }
}
