import { OrderRepository } from "../infrastructure/OrderRepository"
import { Order, type OrderItem } from "../domain/Order"
import type { DomainEvent } from "../../../core/event/DomainEvent"

export interface PlaceOrderCommand {
  customerId: string
  items: OrderItem[]
}

export interface RabbitMQBus {
  publish(event: DomainEvent): Promise<void>
}

export class PlaceOrderHandler {
    constructor(
      private repo: OrderRepository,
      private bus: RabbitMQBus
    ) {}
  
    async execute(cmd: PlaceOrderCommand): Promise<string> {
      const order = Order.place(cmd.customerId, cmd.items)
      const pendingEvents = order.getUncommittedEvents()
      await this.repo.save(order)
  
      // Publish events AFTER saving — if publish fails, events
      // are still in MongoDB and can be replayed
      for (const event of pendingEvents) {
        await this.bus.publish(event)
      }
  
      return order.getId()
    }
}