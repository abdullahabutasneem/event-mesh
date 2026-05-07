import { z } from "zod"

/*
Zod schemas for HTTP request shapes. They double as parsers (validate at the
edge) and as type sources (z.infer<typeof X>) — so the controller layer never
hand-types request bodies.
*/

export const PlaceOrderBody = z.object({
    customerId: z.string().min(1),
    items: z.array(z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
    })).min(1, "At least one item is required"),
})

export const CancelOrderBody = z.object({
    reason: z.string().min(1).max(500),
})

export const OrderIdParams = z.object({
    id: z.string().min(1),
})

export const CustomerIdParams = z.object({
    customerId: z.string().min(1),
})

export type PlaceOrderBody = z.infer<typeof PlaceOrderBody>
export type CancelOrderBody = z.infer<typeof CancelOrderBody>
