import { OrderRepository } from "../infrastructure/OrderRepository"
import type { RabbitMQBus } from "./PlaceOrderHandler"

export interface CancelOrderCommand {
    orderId: string
    reason: string
}

export class CancelOrderHandler {
    constructor(
        private repo: OrderRepository,
        private bus: RabbitMQBus
    ) {}

    async execute(cmd: CancelOrderCommand): Promise<void> {
        const order = await this.repo.findById(cmd.orderId)
        order.cancel(cmd.reason)

        const pendingEvents = order.getUncommittedEvents()
        await this.repo.save(order)

        for (const event of pendingEvents) {
            await this.bus.publish(event)
        }
    }
}
