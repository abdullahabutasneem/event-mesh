import { Schema, model, Document } from "mongoose"

/*
Read-model (a.k.a. projection) for orders.

This is intentionally separate from the event store: events are the source
of truth, this collection is a denormalized view rebuilt by replaying events.
If we ever change query needs, we drop this collection and rebuild from
the event log.

`version` here mirrors the last-applied event version — used for idempotent
projection (skip events we've already applied).
*/

export interface OrderViewDocument extends Document {
    orderId: string
    customerId: string
    items: { productId: string; quantity: number }[]
    status: "pending" | "shipped" | "cancelled"
    cancelReason?: string
    version: number
    placedAt: Date
    updatedAt: Date
}

const OrderViewSchema = new Schema<OrderViewDocument>({
    orderId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    items: [{
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
    }],
    status: {
        type: String,
        enum: ["pending", "shipped", "cancelled"],
        required: true,
    },
    cancelReason: { type: String },
    version: { type: Number, required: true },
    placedAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
}, { _id: false })

export const OrderViewModel = model<OrderViewDocument>("OrderView", OrderViewSchema)
