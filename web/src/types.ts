/*
Shared types — mirror the backend's read-side DTO shape.

These intentionally duplicate the server-side OrderDTO instead of importing
from ../../src — the backend is its own deployable, and we don't want the
web build to depend on backend internals. If they drift, fix here.
*/

export type OrderStatus = "pending" | "shipped" | "cancelled"

export interface OrderItem {
  productId: string
  quantity: number
}

export interface Order {
  orderId: string
  customerId: string
  items: OrderItem[]
  status: OrderStatus
  cancelReason?: string
  placedAt: string
  updatedAt: string
}
