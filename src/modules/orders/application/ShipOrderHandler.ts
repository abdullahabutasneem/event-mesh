import { OrderRepository } from "../infrastructure/OrderRepository"
import type { RabbitMQBus } from "./PlaceOrderHandler"

export interface ShipOrderCommand {
    orderId: string
}

/*
Ship flow:
  1. Load aggregate from event store (rehydrate from history)
  2. Invoke business behavior (raises OrderShipped event + version bump)
  3. Save — repo appends new events with optimistic concurrency check
  4. Publish events to bus AFTER persist (events survive bus failure)
*/
export class ShipOrderHandler {
    constructor(
        private repo: OrderRepository,
        private bus: RabbitMQBus
    ) {}

    async execute(cmd: ShipOrderCommand): Promise<void> {
        const order = await this.repo.findById(cmd.orderId)
        order.ship()

        const pendingEvents = order.getUncommittedEvents()
        await this.repo.save(order)

        for (const event of pendingEvents) {
            await this.bus.publish(event)
        }
    }
}
