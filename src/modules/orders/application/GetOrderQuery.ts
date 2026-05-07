import { OrderViewModel } from "../read-model/OrderViewSchema"
import { AggregateNotFoundError } from "../../../core/errors/AggregateNotFoundError"

/*
Read side. Hits the projection — never the event store.

CQRS principle: queries don't reconstruct aggregates from history; they read
the denormalized view that the projector keeps current. Cheap, fast, and
free to add new shapes without touching the write model.
*/

export interface OrderDTO {
    orderId: string
    customerId: string
    items: { productId: string; quantity: number }[]
    status: "pending" | "shipped" | "cancelled"
    cancelReason?: string
    placedAt: Date
    updatedAt: Date
}

export class GetOrderQuery {
    async byId(orderId: string): Promise<OrderDTO> {
        const view = await OrderViewModel.findOne({ orderId }).lean()
        if (!view) throw new AggregateNotFoundError(orderId)

        return {
            orderId: view.orderId,
            customerId: view.customerId,
            items: view.items,
            status: view.status,
            cancelReason: view.cancelReason,
            placedAt: view.placedAt,
            updatedAt: view.updatedAt,
        }
    }

    async byCustomer(customerId: string): Promise<OrderDTO[]> {
        const views = await OrderViewModel
            .find({ customerId })
            .sort({ placedAt: -1 })
            .lean()

        return views.map((view) => ({
            orderId: view.orderId,
            customerId: view.customerId,
            items: view.items,
            status: view.status,
            cancelReason: view.cancelReason,
            placedAt: view.placedAt,
            updatedAt: view.updatedAt,
        }))
    }
}
