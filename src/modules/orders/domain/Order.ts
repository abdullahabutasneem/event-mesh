import {Aggregate} from "../../../core/aggregate/Aggregate";
import {DomainEvent} from "../../../core/event/DomainEvent";
import { nanoid } from "nanoid";

export interface OrderItem {
    productId: string;
    quantity: number;
}

export class Order extends Aggregate {
    private status: 'pending' | 'shipped' | 'cancelled' = 'pending';
    private _id: string = nanoid();

    static place(customerId: string, items: OrderItem[]): Order {
        const order = new Order()
        order.apply({
            id: nanoid(),
            type: 'OrderPlaced',
            aggregateId: order._id,
            aggregateType: 'Order',
            version: 0,
            occurredAt: new Date(),
            payload: {
                customerId,
                items,
            },
            metadata: {
                correlationId: nanoid(),
                causationId: nanoid(),
            }
        })
        return order
    }
    
    ship(): void {
        if (this.status !== 'pending') {
            throw new Error('Only pending orders can be shipped')
        }
        this.apply({
            id: nanoid(),
            type: 'OrderShipped',
            aggregateId: this._id,
            aggregateType: 'Order',
            version: this.version + 1,
            occurredAt: new Date(),
            payload: {},
            metadata: {
                correlationId: nanoid(),
                causationId: nanoid(),
            }
        })
    }

    cancel(reason: string): void {
        if (this.status === 'shipped') {
            throw new Error('Shipped orders cannot be cancelled')
        }
        if (this.status === 'cancelled') {
            throw new Error('Order is already cancelled')
        }
        this.apply({
            id: nanoid(),
            type: 'OrderCancelled',
            aggregateId: this._id,
            aggregateType: 'Order',
            version: this.version + 1,
            occurredAt: new Date(),
            payload: { reason },
            metadata: {
                correlationId: nanoid(),
                causationId: nanoid(),
            }
        })
    }

    getStatus() {
        return this.status
    }

    protected when(event: DomainEvent): void {
        // Keep aggregate identity aligned with the event stream being replayed.
        // Without this, rehydrated orders may emit follow-up events to a random id.
        this._id = event.aggregateId

        if (event.type === 'OrderPlaced')
            this.status = 'pending' 
        if (event.type === 'OrderShipped') 
            this.status = 'shipped'
        if (event.type === 'OrderCancelled')
            this.status = 'cancelled'
    }

    getId() {
        return this._id
    }
}