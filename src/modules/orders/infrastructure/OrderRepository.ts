import {MongoEventStore} from "../../../event-store/MongoEventStore";
import { Order } from "../domain/Order";
import { AggregateNotFoundError } from "../../../core/errors/AggregateNotFoundError";

export class OrderRepository {
    constructor(private eventStore: MongoEventStore) {}

    async save(order: Order): Promise<void> {
        const events = order.getUncommittedEvents()
        if (events.length === 0) return

        // expected version = version before this batch of events
        const expectedVersion = order.getVersion() - events.length
        await this.eventStore.append(order.getId(), events, expectedVersion)
        order.clearUncommittedEvents()
    }

    async findById(id: string): Promise<Order> {
        const events = await this.eventStore.load(id)
        if (events.length === 0) throw new AggregateNotFoundError(id)
        const order = new Order()
        order.rehydrate(events)
        return order
    }
}