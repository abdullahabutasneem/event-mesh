import { api } from "./client"
import type { Order, OrderItem } from "../types"

/*
Typed wrappers around the order endpoints. One function per backend route.

POST /orders            -> { orderId }     (202 Accepted)
POST /orders/:id/ship   -> ()              (202 Accepted)
POST /orders/:id/cancel -> ()              (202 Accepted)
GET  /orders/:id        -> Order
GET  /orders/customer/:customerId -> Order[]

Note the eventual-consistency caveat: a successful POST /orders means the
event was persisted, but the read model (queried by GET) may take a moment
to catch up. The UI handles this by re-fetching after a short delay.
*/

export const placeOrder = (body: { customerId: string; items: OrderItem[] }) =>
  api.post<{ orderId: string }>("/orders", body)

export const shipOrder = (orderId: string) =>
  api.post<void>(`/orders/${encodeURIComponent(orderId)}/ship`)

export const cancelOrder = (orderId: string, reason: string) =>
  api.post<void>(`/orders/${encodeURIComponent(orderId)}/cancel`, { reason })

export const getOrder = (orderId: string) =>
  api.get<Order>(`/orders/${encodeURIComponent(orderId)}`)

export const listOrdersByCustomer = (customerId: string) =>
  api.get<Order[]>(`/orders/customer/${encodeURIComponent(customerId)}`)
